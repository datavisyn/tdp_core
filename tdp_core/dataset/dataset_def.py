import abc
from builtins import object

from ..security import can_read, can_write
from ..utils import fix_id


def to_plural(s):
    if s[len(s) - 1] == "y":
        return s[0 : len(s) - 1] + "ies"
    return s + "s"


def to_idtype_description(id):
    return dict(id=id, name=id, names=to_plural(id))


class ADataSetEntry(object, metaclass=abc.ABCMeta):
    """
    A basic dataset entry
    """

    def __init__(self, name, project, type, id=None):
        """
        constructor for a new dataset
        :param name:
        :param project: the parent/folder of this dataset
        :param type: the type of this dataset
        :param id: optional the id to use
        """
        self.name = name
        self.fqname = project + "/" + name
        self.type = type
        self.id = id if id is not None else fix_id(self.fqname)

    def idtypes(self):
        """
        :return: the list of all idtypes as string array
        """
        return []

    def to_description(self):
        """
        :return: a dictionary describing this dataset in a client understandable format
        """
        return dict(type=self.type, name=self.name, id=self.id, fqname=self.fqname)

    def to_idtype_descriptions(self):
        """
        list of a all idtypes of this dataset
        :return:
        """

        return [to_idtype_description(t) for t in self.idtypes()]

    def update(self, args, files):
        """
        updates this dataset with the new data
        :param args: data dict
        :param files: list of FileStorage files
        :return: boolean whether the operation was successful
        """
        return False

    def modify(self, args, files):
        """
        modifies this dataset with the given arguments
        :param args: data dict
        :param files: list of FileStorage files
        :return: boolean whether the operation was successful
        """
        return False

    def remove(self):
        """
        removes itself
        :return: boolean whether it was successfully removed
        """
        return False

    @abc.abstractmethod
    def asjson(self):
        """
        converts this dataset to a json compatible format
        :return: a json compatible dataset representation
        """
        return dict()

    def can_read(self, user=None):
        return can_read(self.to_description(), user)

    def can_write(self, user=None):
        return can_write(self.to_description(), user)


class ADataSetProvider(object, metaclass=abc.ABCMeta):
    def __len__(self):
        import itertools

        return itertools.count(self)  # type: ignore

    @abc.abstractmethod
    def __iter__(self):
        return iter([])

    def __getitem__(self, dataset_id):
        """
        get a specific dataset item by id
        :param dataset_id:
        :return: the dataset or None
        """
        for elem in self:
            if elem.id == dataset_id:
                return elem
        return None

    def remove(self, entry):
        return False

    def upload(self, data, files, id=None):
        """
        adds a new dataset to this provider
        :param data: the description data dict object
        :param files: a list of FileStorage files containing data files
        :param id: optional unique id of the newly created dataset
        :return: None if the element can't be uploaded else the dataset
        """
        return None
