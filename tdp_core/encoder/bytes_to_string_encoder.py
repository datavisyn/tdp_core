"""
The files in the _data directory contain objects of type 'bytes'. In Python 3.X the unicode type has been renamed as str and the older str type has been replaced by bytes.
This encoder is required to handle this change for the update to Python 3.7 by decoding bytes objects to strings that can be read.
"""


class BytesToStringEncoder:
    def __contains__(self, obj):
        if isinstance(obj, bytes):
            return True
        return False

    def __call__(self, obj, base_encoder):
        if isinstance(obj, bytes):
            return obj.decode("utf-8")
        return None


encoder = BytesToStringEncoder()


def create():
    return encoder
