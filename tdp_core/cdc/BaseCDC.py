from abc import abstractmethod, abstractproperty
from typing import TypeVar, Generic, List
from deepdiff import DeepDiff

T = TypeVar('T')


# @ABC
class BaseCDC(Generic[T]):
    @abstractproperty
    def id(self):
        pass

    @abstractmethod
    def load_data(self) -> List[T]:
        pass

    # @abstractmethod
    # def load_existing(self, options: Dict = {}) -> Union[List[T], None]:
    #     pass

    # @abstractmethod
    # def save_existing(self, data: List[T]):
    #     pass

    @abstractmethod
    def get_id(self, item: T) -> str:
        pass

    def compare(self, old: List[T], new: List[T]):
        old = old or []
        new = new or []
        old_lookup = {self.get_id(item): item for item in old}
        new_lookup = {self.get_id(item): item for item in new}
        return DeepDiff(old_lookup, new_lookup).to_json()
