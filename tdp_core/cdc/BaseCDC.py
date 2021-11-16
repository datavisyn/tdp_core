from abc import abstractmethod, abstractproperty
from typing import TypeVar, Generic, List
from deepdiff import DeepDiff

T = TypeVar('T')


# @ABC
class BaseCDC(Generic[T]):
    @abstractmethod
    def load_data(self) -> List[T]:
        pass

    @abstractmethod
    def get_id(self, item: T) -> str:
        pass

    def compare(self, old: List[T], new: List[T]):
        old = old or []
        new = new or []
        old_lookup = {item['_cdc_compare_id']: item for item in old}
        new_lookup = {item['_cdc_compare_id']: item for item in new}
        return DeepDiff(old_lookup, new_lookup, view='tree')
