from abc import ABC, abstractmethod, abstractproperty
from typing import TypeVar, Generic, List, Union

T = TypeVar('T')


# @ABC
class BaseCDC(Generic[T]):
    @abstractproperty
    def id(self):
        pass

    @abstractmethod
    def load_data(self) -> List[T]:
        pass

    @abstractmethod
    def load_existing(self) -> Union[List[T], None]:
        pass

    @abstractmethod
    def save_existing(self, data: List[T]):
        pass

    @abstractmethod
    def get_id(self, item: T) -> str:
        pass

    @abstractmethod
    def compare(self, old: List[T], new: List[T]):
        pass
