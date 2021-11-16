from typing import Union

from .JSONPlaceholderUserCDC import JSONPlaceholderUserCDC
from .JSONPlaceholderPostsCDC import JSONPlaceholderPostsCDC
from .BaseCDC import BaseCDC
from .CDCAlert import CDCAlert
from .filter import FieldFilterMixin, Filter
import logging

_log = logging.getLogger(__name__)

cdcs = []


def get_cdc(id: str) -> Union[BaseCDC, None]:
    return next((c for c in cdcs if c.id == id), None)


def run_alert2(alert: CDCAlert):
    _log.info(f'Refreshing alert {alert.cdc_id}')
    cdc = get_cdc(alert.cdc_id)

    if not cdc:
        raise Exception(f'Missing cdc {alert.cdc_id}')

    # Fetch new entry
    new = cdc.load_data({
        # TODO: Define options like username?
    })

    new = Filter().load(alert.filter)._apply(new)

    for i, item in enumerate(new):
        new_item = {
            '_cdc_compare_id': str(cdc.get_id(item)),
            # TODO: Recursive lookup and field selection
            # **item
        }
        for field in alert.compare_columns:
            new_item[field] = FieldFilterMixin.access(item, field)
        new[i] = new_item

    # Compare confirmed with new entry
    diff = cdc.compare(alert.confirmed_data, new)

    if "dictionary_item_removed" in diff:
        diff["dictionary_item_removed"] = [rm.path(output_format='list')[0] for rm in diff["dictionary_item_removed"]]

    if "dictionary_item_added" in diff:
        diff["dictionary_item_added"] = [add.path(output_format='list')[0] for add in diff["dictionary_item_added"]]

    if "values_changed" in diff:
        new_values_changed = []
        for changed in diff["values_changed"]:
            new_obj = {}
            change_path = changed.path(output_format='list')
            new_obj["id"] = change_path[0]
            new_obj["field"] = change_path[1:len(change_path)]
            new_obj["old_value"] = changed.t1
            new_obj["new_value"] = changed.t2
            new_values_changed.append(new_obj)
        diff["values_changed"] = new_values_changed

    return new, diff


cdcs.append(JSONPlaceholderUserCDC())
cdcs.append(JSONPlaceholderPostsCDC())
