from typing import Union

from .JSONPlaceholderUserCDC import JSONPlaceholderUserCDC
from .JSONPlaceholderPostsCDC import JSONPlaceholderPostsCDC
from .BaseCDC import BaseCDC
from .CDCAlert import CDCAlert
from .filter import FieldFilterMixin, Filter
import logging

_log = logging.getLogger(__name__)


class CDCManager():
    cdcs = []

    def get_cdc(self, id: str) -> Union[BaseCDC, None]:
        return next((c for c in cdc_manager.cdcs if c.id == id), None)

    def run_alert(self, alert: CDCAlert):
        _log.info(f'Refreshing alert {alert.cdc_id}')
        cdc = self.get_cdc(alert.cdc_id)

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

        _log.info(diff.to_dict())

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

        _log.info("New")
        _log.info(diff)

        return new, diff

    def register_cdc(self, cdc: BaseCDC):
        _log.info(f'Registered CDC {cdc.id}')
        self.cdcs.append(cdc)

    def refresh_cdc(self, cdc: BaseCDC):
        _log.info(f'Refreshing CDC {cdc.id}')
        # Get existing entry
        old = cdc.load_existing()

        # Fetch new entry
        new = cdc.load_data()

        # Filter new entry
        new = [item for item in new if eval('(item["id"] in (4, 5, 6, 7, 8) and not (item["id"] == 5 and item["id"] == 4 or item["id"] == 8)) or ((item["address"]["city"] == "Gwenborough") and (item["id"] > 0 and item["id"] < 5))')]

        # TODO: How to find a proper "filter" library?
        # 1) [item for item in new if exec('item.age >= 20')]
        # 2) new_df = pd.DataFrame.from_dict(new)
        #    new_df = new_df.query('name == ["test123", "asdfasdf"] or age > 40 and ...')

        # Compare with new entry
        diff_summary = cdc.compare(old, new)

        # new[5]['name'] = 'Hello world'
        # cdc.save_existing(choices(new, k=len(new) // 2))
        cdc.save_existing(new)

        return diff_summary


cdc_manager = CDCManager()
cdc_manager.register_cdc(JSONPlaceholderUserCDC())
cdc_manager.register_cdc(JSONPlaceholderPostsCDC())
