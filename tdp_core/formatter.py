from phovea_server.ns import request, Response
from phovea_server.util import jsonify


def _format_csv(array_of_dicts):
  import pandas as pd
  import io

  if not array_of_dicts:
    return Response('', mimetype='text/csv')

  out = io.BytesIO()
  d = pd.DataFrame.from_records(array_of_dicts)
  d.to_csv(out, sep='\t', encoding='utf-8', index=False)
  return Response(out.getvalue(), mimetype='text/csv')


def _format_json_decimal(obj):
  return jsonify(obj, double_precision=15)


def formatter(view_name):
  if view_name.endswith('.csv'):
    return view_name[:-4], _format_csv
  elif request.values.get('_format') == 'csv':
    return view_name, _format_csv
  elif view_name.endswith('.json'):
    return view_name[:-5], _format_json_decimal
  elif request.values.get('_format') == 'json':
    return view_name, _format_json_decimal
  return view_name, jsonify
