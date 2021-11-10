from datetime import datetime
from typing import Union

from .DemoCDC import DemoCDC
from .BaseCDC import BaseCDC
from .CDCAlert import CDCAlert
import logging
import json

_log = logging.getLogger(__name__)


# Alert: {filter: string; creator: ...@... }

class CDCManager():

    cdcs = []

    def getCDC(self, id: str) -> Union[BaseCDC, None]:
        return next((c for c in cdc_manager.cdcs if c.id == id), None)

    def run_alert(self, alert: CDCAlert):
        _log.info(f'Refreshing alert {alert.cdc_id}')
        cdc = self.getCDC(alert.cdc_id)

        if not cdc:
            raise Exception(f'Missing cdc {alert.cdc_id}')

        # Fetch new entry
        new = cdc.load_data({
            # TODO: Define options like username?
        })

        new = [item for item in new if eval(alert.filter_query)]


        fields = [col["value"] for col in alert.compare_columns]
        for i, item in enumerate(new):
            new_item = {
                '_cdc_compare_id': cdc.get_id(item),
                # TODO: Recursive lookup and field selection
                **item
            }
            for field in fields:
            #    new_item[field] = FieldFilterMixin.access(item, field)
            new[i] = new_item

        # Filter new entry
        # '(item["id"] in (4, 5, 6, 7, 8) and not (item["id"] == 5 and item["id"] == 4 or item["id"] == 8)) or ((item["address"]["city"] == "Gwenborough") and (item["id"] > 0 and item["id"] < 5))'


        # filter = {
        #     'operator': 'AND',
        #     'filters': [{
        #         'query': 'num1 == false && num2 == true'
        #     }, {
        #         'operator': 'OR',
        #         'filters': [{
        #         }, {
        #             'query': ''
        #         }]
        #     }]
        # }
        # filter = '(num1 == false AND num2 == true) AND ((age1 >= ...) OR (age1 <= ...))'
        # TODO: How to find a proper "filter" library?
        # 1) [item for item in new if exec('item.age >= 20')]
        # 2) new_df = pd.DataFrame.from_dict(new)
        #    new_df = new_df.query('name == ["test123", "asdfasdf"] or age > 40 and ...')

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

    def registerCDC(self, cdc: BaseCDC):
        _log.info(f'Registered CDC {cdc.id}')
        self.cdcs.append(cdc)

    def refreshCDC(self, cdc: BaseCDC):
        _log.info(f'Refreshing CDC {cdc.id}')
        # Get existing entry
        old = cdc.load_existing()

        # Fetch new entry
        new = cdc.load_data()

        # validate filter tree

        # {
        #   id: 'group',
        #   value: {operator: 'AND'}
        #   filters: [{
        #       id: 'range',
        #       value: {from: 1, to: 2, field: 'address.zipCode'}
        #   }, {
        #       id: 'group',
        #       value: {operator: 'AND'},
        #       filters: [...]
        #   }]
        # }

        class GroupFilter():
            pass
            # schema = ..

            # def filter(item: Dict[...], ..)

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
cdc_manager.registerCDC(DemoCDC())
