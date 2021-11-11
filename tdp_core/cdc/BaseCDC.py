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
        old_lookup = {item['_cdc_compare_id']: item for item in old}
        new_lookup = {item['_cdc_compare_id']: item for item in new}
        return DeepDiff(old_lookup, new_lookup, view='tree')

    # @abstractproperty # ?
    # @property
    # def available_filters() -> Dict[str, LambdaType]:
    #     return {
    #         'text': lambda item, filter: item[filter.field] == filter.value,
    #         'range': lambda item, filter: item[filter.field] >= filter.min and item[filter.field] <= filter.max,
    #         'text': textFilter
    #     }

# def textFilter(item, filter) -> bool:
#     return True
