import itertools
from builtins import str

from .. import manager

_providers_r = None


def _providers():
    global _providers_r
    if _providers_r is None:
        _providers_r = [p.load().factory() for p in manager.registry.list("dataset-provider")]
    return _providers_r


def iter():
    """
    an iterator of all known datasets
    :return:
    """
    return itertools.chain(*_providers())


def list_datasets():
    """
    list all known datasets
    :return:
    """
    return list(iter())


def get(dataset_id):
    """
    :param dataset_id:
    :return: returns the selected dataset identified by id
    """
    for p in _providers():
        r = p[dataset_id]
        if r is not None:
            return r
    return None


def add(desc, files=[], id=None):
    """
    adds a new dataset to this storage
    :param desc: the dict description information
    :param files: a list of FileStorage
    :param id: optional the unique id to use
    :return: the newly created dataset or None if an error occurred
    """
    for p in _providers():
        r = p.upload(desc, files, id)
        if r:
            return r
    return None


def update(dataset, desc, files=[]):
    """
    updates the given dataset
    :param dataset: a dataset or a dataset id
    :param desc: the dict description information
    :param files: a list of FileStorage
    :return:
    """
    old = get(dataset) if isinstance(dataset, str) else dataset
    if old is None:
        return add(desc, files)
    r = old.update(desc, files)
    return r


def remove(dataset):
    """
    removes the given dataset
    :param dataset: a dataset or a dataset id
    :return: boolean whether the operation was successful
    """
    old = get(dataset) if isinstance(dataset, str) else dataset
    if old is None:
        return False
    for p in _providers():
        if p.remove(old):
            return True
    return False
