import logging
from datetime import datetime
from typing import List
from flask_smorest import Api, Blueprint
from phovea_server.ns import Namespace, abort, no_cache
from phovea_server.security import can_write, login_required, can_read, current_username
from phovea_server.util import jsonify
from .CDCAlert import CDCAlert, CDCAlertSchema, create_session, CDCAlertArgsSchema, RunAllAlertsSchema
from .CDCManager import run_alert2, cdcs

app = Namespace(__name__)
app.config['OPENAPI_VERSION'] = '3.0.2'
app.config['OPENAPI_URL_PREFIX'] = '/spec'
app.config['OPENAPI_JSON_PATH'] = 'api.json'
app.config['OPENAPI_SWAGGER_UI_PATH'] = "/"
app.config['OPENAPI_SWAGGER_UI_URL'] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
api = Api(app, spec_kwargs={
    'title': 'CDC',
    'version': 1,
    'servers': [{
        'url': '/api/tdp/cdc/'
    }]
})
blp = Blueprint(
  'cdc', __name__, url_prefix='/'
)


def run_alert(alert: CDCAlert) -> bool:
    try:
        new_data, diff = run_alert2(alert)
    except Exception as e:
        _log.exception(f'Error when running alert {alert.id}')
        # TODO: Clear latest_diff and latest_fetched_data and latest_compare_data?
        alert.latest_error = str(e)
        alert.latest_error_date = datetime.utcnow()
        return False

    if diff:
        # We have a new diff! Send email? Store in db? ...
        alert.latest_compare_date = datetime.utcnow()
        alert.latest_fetched_data = new_data
        alert.latest_diff = diff
    # TODO else: also set latest diff to empty

    alert.latest_error = None
    alert.latest_error_date = None
    return True


@app.errorhandler(400)
@app.errorhandler(404)
@app.errorhandler(500)
def handle_error(e):
    return jsonify(error=str(e.description), code=e.code), e.code


_log = logging.getLogger(__name__)


@app.route('/cdc', methods=['GET'])
def list_cdc():
  return jsonify([c.id for c in cdcs])


@no_cache
@login_required
@blp.route('/alert', methods=["GET"])
@blp.response(CDCAlertSchema(many=True,), code=200)
def get_alerts():
    session = create_session()
    alerts = session.query(CDCAlert).all()
    return sorted([p for p in alerts if can_read(p)], key=lambda item: item.id)


@no_cache
@login_required
@blp.route('/alert', methods=["POST"])
@blp.arguments(CDCAlertArgsSchema, location='json', description='Create an alert')
@blp.response(CDCAlertSchema, code=200)
def create_alert(data):
    session = create_session()
    # session.query(CDCAlert).delete()
    alert = CDCAlertSchema().load(data, partial=True, session=session)
    # Security
    alert.creator = current_username()
    alert.creation_date = datetime.utcnow()
    alert.group = ""
    # Allow no one to see, and only the creator/buddy to edit
    # Use permissions from endpoint
    # alert.permissions = 7700
    alert.modifier = None
    alert.modification_date = None
    run_alert(alert)
    session.add(alert)
    session.commit()
    return alert


@no_cache
@login_required
@blp.route('/alert/<id>', methods=["PUT"])
@blp.arguments(CDCAlertArgsSchema(partial=True), location='json', description='Update an alert')
@blp.response(CDCAlertSchema(), code=200)
def edit_alert_by_id(data, id: str):
    session = create_session()
    item = session.query(CDCAlert).get(id)
    if not item:
        abort(404, f'No alert with id {id}')
    if not can_write(item):
        abort(401)

    alert = CDCAlertSchema().load(data, partial=True, instance=item, session=session)
    alert.modification_date = datetime.utcnow()
    alert.modifier = current_username()
    run_alert(alert)
    session.commit()
    return alert


@no_cache
@login_required
@blp.route('/alert/<id>', methods=["DELETE"])
@blp.response(code=200)
def delete_alert_by_id(id: int):
    session = create_session()
    item = session.query(CDCAlert).get(id)
    if not item:
        abort(404, f'No alert with id {id}')
    if not can_write(item):
        abort(401)

    session.delete(item)
    session.commit()
    return "", 200


@no_cache
@login_required
@blp.route('/alert/run', methods=["GET"])
@blp.response(RunAllAlertsSchema, code=200, description="Response includes ids of successful and failing alerts")
def run_all_alerts():
    session = create_session()
    alerts = [p for p in session.query(CDCAlert).all() if can_read(p)]
    success: List[str] = []
    error: List[str] = []
    for alert in alerts:
        successful = run_alert(alert)
        if successful:
            success.append(alert.id)
        else:
            error.append(alert.id)

    session.commit()
    return {'success': success, 'error': error}


@no_cache
@login_required
@blp.route('/alert/<id>/run', methods=["GET"])
@blp.response(CDCAlertSchema(), code=200)
def run_alert_by_id(id: int):
    session = create_session()
    alert = session.query(CDCAlert).get(id)
    if not alert:
        abort(404, f'No alert with id {id}')
    if not can_read(alert):
        abort(401)

    successful = run_alert(alert)
    session.commit()
    if not successful:
        abort(400)

    return alert, 200
    

@no_cache
@login_required
@blp.route('/alert/<id>/confirm', methods=["GET"])
@blp.response(CDCAlertSchema(), code=200)
def confirm_alert_by_id(id: str):
    session = create_session()
    alert = session.query(CDCAlert).get(id)
    if not alert:
        abort(404, f'No alert with id {id}')
    if not can_read(alert):
        abort(401)

    if not alert.latest_fetched_data:
        abort(400, f'No data to confirm for id {id}')

    alert.confirmation_date = datetime.utcnow()
    alert.confirmed_data = alert.latest_fetched_data
    alert.latest_compare_date = None
    alert.latest_fetched_data = None
    alert.latest_diff = None
    session.commit()
    return alert, 200


api.register_blueprint(blp)


def create():
  return api._app
