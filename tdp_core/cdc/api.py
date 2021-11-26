
from datetime import datetime
from flask_apscheduler import APScheduler
from flask_smorest import Api, Blueprint

from phovea_server.config import view
from phovea_server.ns import Namespace, abort, no_cache
from phovea_server.security import can_write, login_required, can_read, current_username
from phovea_server.util import jsonify
from .CDCAlert import CDCAlert, CDCAlertSchema, create_session, CDCAlertArgsSchema, RunAllAlertsSchema
from .CortellisTrialsCDC import CortellisTrialsCDC
from .JSONPlaceholderPostsCDC import JSONPlaceholderPostsCDC
from .JSONPlaceholderUserCDC import JSONPlaceholderUserCDC
from .filter import FieldFilterMixin
from .mail import cdc_mail

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
blp = Blueprint('cdc', __name__, url_prefix='/')
scheduler = APScheduler()
_conf = view("tdp_core")

cdcs = {cls.__name__: cls() for cls in [JSONPlaceholderUserCDC, JSONPlaceholderPostsCDC, CortellisTrialsCDC]}


def compute_new_data_diff(alert: CDCAlert):
  app.logger.info(f'Refreshing alert {alert.id}')
  cdc = cdcs[alert.cdc_id]

  if not cdc:
    raise Exception(f'Missing cdc {alert.cdc_id}')

  data = cdc.load_data({})  # TODO: Define options like username?
  data = alert.apply_filter(data)
  # on py 3.9, use {a: b} | {c: d} to merge dicts, instead of {a: b, **{c: d}}
  data = [{'_cdc_compare_id': str(cdc.get_id(item)),
           **{field: FieldFilterMixin.access(item, field) for field in alert.compare_columns}}
          for item in data]

  # Compare confirmed with new entry
  diff = cdc.compare(alert.confirmed_data, data)

  if "dictionary_item_removed" in diff:
    diff["dictionary_item_removed"] = [rm.path(output_format='list')[0] for rm in diff["dictionary_item_removed"]]

  if "dictionary_item_added" in diff:
    diff["dictionary_item_added"] = [add.path(output_format='list')[0] for add in diff["dictionary_item_added"]]

  if "values_changed" in diff:
    vc = diff["values_changed"]
    changed_path = [changed.path(output_format='list') for changed in vc]
    diff["values_changed"] = [{
      "id": p[0],
      "field": p[1:len(p)],
      "old_value": c.t1,
      "new_value": c.t2
    } for c, p in zip(vc, changed_path)]
  return data, diff


def run_alert(alert: CDCAlert) -> bool:
  try:
    new_data, diff = compute_new_data_diff(alert)
  except Exception as e:
    app.logger.exception(f'Error when running alert {alert.id}')
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


@app.errorhandler(ValueError)  # happens in filter validation
@app.errorhandler(KeyError)  # happens in cdc lookups
def handle_error(e):
  return {
           "code": 400,
           "status": "Bad Request",
           "message": str(e)
         }, 400


@app.route('/cdc', methods=['GET'])
def list_cdc():
  return jsonify(list(cdcs.keys()))


@app.route('/cdc/<id>', methods=['GET'])
def execute_cdc(id: str):
  try:
    return cdcs.get(id, None)
  except KeyError:
    abort(404, f'No cdc with id {id} available')


@no_cache
@login_required
@blp.route('/alert', methods=["GET"])
@blp.response(CDCAlertSchema(many=True, ), code=200)
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


def cdc_update(without_perms=True):
  """ Schedule-able version that does not need a login / session-scope """
  session = create_session()
  alerts = [alert for alert in session.query(CDCAlert).all()
            if without_perms or can_read(alert)]  # if without_perms is true, can_read isn't considered
  status = [run_alert(alert) for alert in alerts]
  session.commit()
  return {'success': [a.id for a, s in zip(alerts, status) if s],
          'error': [a.id for a, s in zip(alerts, status) if not s]}


@no_cache
@login_required
@blp.route('/alert/run', methods=["GET"])
@blp.response(RunAllAlertsSchema, code=200, description="Response includes ids of successful and failing alerts")
def run_all_alerts():
  return cdc_update(without_perms=False)


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


def add_job_config(sched_func):
  name = sched_func.__name__
  time_dict = _conf.get(name, default={})
  if time_dict:
    app.logger.info(f"Added job {name} with cron-params {time_dict}")
    scheduler.add_job(id=name, func=sched_func, trigger="cron", **time_dict)


@blp.route("/asd")
def a():
  cdc_mail()
  return "", 200


def create():
  api.register_blueprint(blp)

  scheduler.init_app(app)
  add_job_config(cdc_update)
  add_job_config(cdc_mail)
  scheduler.start()

  return api._app
