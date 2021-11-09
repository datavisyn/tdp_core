import logging
from datetime import datetime

import requests
from flask_smorest import Api, Blueprint

from phovea_server.ns import Namespace, abort, no_cache
from phovea_server.security import login_required, can_write, can_read, current_username
from phovea_server.util import jsonify
from .CDCAlert import CDCAlert, CDCAlertSchema, create_session, CDCAlertArgsSchema

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

#@app.errorhandler(400)
##@app.errorhandler(404)
#@app.errorhandler(500)
def handle_error(e):
    return jsonify(error=str(e.description), code=e.code), e.code


_log = logging.getLogger(__name__)


@app.route('/cdc', methods=['GET'])
def list_cdc():
  return jsonify([c.id for c in cdc_manager.cdcs])


@app.route('/cdc/<id>', methods=['GET'])
def execute_cdc(id: str):
  cdc = cdc_manager.getCDC(id)
  if not cdc:
    abort(404, f'No cdc with id {id} available')
  return cdc_manager.refreshCDC(cdc)


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
@blp.arguments(CDCAlertArgsSchema)
# @blp.response(CDCAlertSchema, code=200)
def create_alert(data):
    users = requests.get('https://jsonplaceholder.typicode.com/users').json()
    for user in users:
      user["Eins"] = user["Zwei"] = user["Drei"] = False
    users[1]["Eins"] = users[2]["Zwei"] = users[3]["Drei"] = True
    fusers = data["filter"]["_apply"](users)
    return jsonify(fusers)

    """
    session = create_session()
    # Security
    alert.creator = current_username()
    alert.creation_date = datetime.utcnow()
    alert.group = ""
    # Allow no one to see, and only the creator/buddy to edit
    # Use permissions from endpoint
    # alert.permissions = 7700
    alert.modifier = None
    alert.modification_date = None
    session.add(alert)
    session.commit()
    return alert
    """

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

    new_item = CDCAlertSchema().load(data, partial=True, instance=item, session=session)
    new_item.modification_date = datetime.utcnow()
    new_item.modifier = current_username()
    session.commit()
    return new_item


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
@blp.route('/alert/<id>/run', methods=["GET"])
@blp.response(CDCAlertSchema(), code=200)
def run_alert_by_id(id: int):
    session = create_session()
    alert = session.query(CDCAlert).get(id)
    if not alert:
        abort(404, f'No alert with id {id}')
    if not can_read(alert):
        abort(401)

    new_data, diff = cdc_manager.run_alert(alert)

    if diff:
        # We have a new diff! Send email? Store in db? ...
        alert.latest_compare_date = datetime.utcnow()
        alert.latest_fetched_data = new_data
        alert.latest_diff = diff
    # TODO else: also set latest diff to empty

    session.commit()
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
        abort(500, f'No data to confirm for id {id}')

    # TODO: How to confirm this override?
    alert.confirmation_date = datetime.utcnow()
    alert.confirmed_data = alert.latest_fetched_data
    alert.confirmed_data[1]['name'] = 'Herbert'
    alert.confirmed_data[2]['name'] = 'Herbert'
    alert.confirmed_data[1]['address']['street'] = 'Dornach'
    alert.confirmed_data[2]['address']['city'] = 'Lünz'

    alert.latest_compare_date = None
    alert.latest_fetched_data = None
    alert.latest_diff = None
    session.commit()
    return alert, 200


api.register_blueprint(blp)


def create():
  return api._app
