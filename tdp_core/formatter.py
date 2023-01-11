from flask import jsonify, request
from flask.wrappers import Response


def _format_csv(array_of_dicts):
    import io

    try:
        import pandas as pd  # type: ignore
    except ImportError as e:
        raise ImportError("pandas is required to format as csv") from e

    if not array_of_dicts:
        return Response("", mimetype="text/csv")

    out = io.BytesIO()
    d = pd.DataFrame.from_records(array_of_dicts)
    d.to_csv(out, sep="\t", encoding="utf-8", index=False)
    return Response(out.getvalue(), mimetype="text/csv")


def _format_json_decimal(obj):
    # The Pandas JSON module has been deprecated and removed. The JSON that is used in _util.py_ of phovea_server does not support double_precision.
    # return jsonify(obj, double_precision=15)
    return jsonify(obj)


def formatter(view_name):
    if view_name.endswith(".csv"):
        return view_name[:-4], _format_csv
    elif request.values.get("_format") == "csv":
        return view_name, _format_csv
    elif view_name.endswith(".json"):
        return view_name[:-5], _format_json_decimal
    elif request.values.get("_format") == "json":
        return view_name, _format_json_decimal
    return view_name, jsonify
