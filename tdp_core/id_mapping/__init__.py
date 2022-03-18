from ..plugin.registry import lookup_singleton
from ..dataset.dataset import list_datasets
from ..dataset.dataset_def import to_idtype_description
from .manager import get_mappingmanager


def list_idtypes():
    tmp = dict()
    for d in list_datasets():
        for idtype in d.to_idtype_descriptions():
            tmp[idtype["id"]] = idtype

    # also include the known elements from the mapping graph
    mapping = get_mappingmanager()
    for idtype_id in mapping.known_idtypes():
        tmp[idtype_id] = to_idtype_description(idtype_id)
    return list(tmp.values())
