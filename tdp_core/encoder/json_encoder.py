import datetime as dt
import decimal
from builtins import object, range

import numpy as np
import numpy.ma as ma


class NumpyTablesEncoder(object):
    def __contains__(self, obj):
        if isinstance(obj, np.ndarray):
            return True
        if isinstance(obj, bytes):
            return True
        if isinstance(obj, np.generic):
            return True
        if isinstance(obj, dt.datetime):
            return True
        if isinstance(obj, decimal.Decimal):
            return True
        return False

    def __call__(self, obj, base_encoder):
        if isinstance(obj, np.ndarray):
            if obj.ndim == 1:
                return [base_encoder.default(x) for x in obj]
            else:
                return [base_encoder.default(obj[i]) for i in range(obj.shape[0])]
        if isinstance(obj, np.generic):
            a = np.asscalar(obj)
            if (isinstance(a, float) and np.isnan(a)) or ma.is_masked(a):
                return None
            return a
        if isinstance(obj, dt.datetime):
            return int(obj.timestamp() * 1000)
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        if isinstance(obj, bytes):
            return obj.decode("utf-8")
        return None


n = NumpyTablesEncoder()


def create():
    return n
