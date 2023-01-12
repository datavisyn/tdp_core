"""
This encoder is required to handle changes of data types in Python 3.7 by adding list() to set().
"""


class SetEncoder:
    def __contains__(self, obj):
        return isinstance(obj, set)

    def __call__(self, obj, base_encoder):
        return list(obj)


encoder = SetEncoder()


def create():
    return encoder
