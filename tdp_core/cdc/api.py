import logging
from flask import jsonify
from datetime import datetime
from flask_smorest import Api, Blueprint
from phovea_server.ns import Namespace, abort, no_cache
from phovea_server.security import login_required, can_write, can_read, current_username
from phovea_server.config import view
from .CDCAlert import CDCAlert, CDCAlertSchema, create_session, CDCAlertArgsSchema
from .CDCManager import cdc_manager
from flask_apscheduler import APScheduler


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


def run_alert(alert: CDCAlert):
    new_data, diff = cdc_manager.run_alert(alert)

    if diff:
        # We have a new diff! Send email? Store in db? ...
        alert.latest_compare_date = datetime.utcnow()
        alert.latest_fetched_data = new_data
        alert.latest_diff = diff
    # TODO else: also set latest diff to empty

    alert.latest_error = None
    alert.latest_error_date = None


@app.errorhandler(TypeError)
def handle_type_error(e):
  return jsonify(*e), 400


@app.errorhandler(400)
@app.errorhandler(404)
@app.errorhandler(500)
def handle_error(e):
    return jsonify(error=str(e.description), code=e.code), e.code


_log = logging.getLogger(__name__)


@app.route('/cdc', methods=['GET'])
def list_cdc():
  return jsonify([c.id for c in cdc_manager.cdcs])


@app.route('/cdc/<id>', methods=['GET'])
def execute_cdc(id: str):
  cdc = cdc_manager.get_cdc(id)
  if not cdc:
    abort(404, f'No cdc with id {id} available')
  return cdc_manager.refresh_cdc(cdc)


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


def _run_all_alerts():
    session = create_session()
    alerts = session.query(CDCAlert).all()
    result = {'success': [], 'error': []}
    for alert in alerts:
        try:
            run_alert(alert)
            result['success'].append(alert.id)
        except:
            result['error'].append(alert.id)

    session.commit()
    return jsonify(result)


@no_cache
@login_required
@blp.route('/alert/run', methods=["GET"])
@blp.response(CDCAlertSchema(many=True,), code=200)
def run_all_alerts():
  return _run_all_alerts()


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

    try:
        run_alert(alert)
        session.commit()
        return alert, 200

    except Exception as e:
        alert.latest_error = str(e)
        alert.latest_error_date = datetime.utcnow()
        session.commit()
        abort(400)


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

# schedule update by param
scheduler = APScheduler()
scheduler.init_app(app)
cron_update_params = view("tdp_core").get("cdc_update", default={})  # default: every minute at second 0
app.logger.info(f"cron_update_params={cron_update_params}")
if cron_update_params:
    scheduler.add_job(id="update", func=_run_all_alerts, trigger="cron", **cron_update_params)
scheduler.start()


def create():
  return api._app
