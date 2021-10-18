from datetime import datetime
from typing import Union
from .DemoCDC import DemoCDC
from .BaseCDC import BaseCDC
from .CDCAlert import CDCAlert
import logging

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

        # Filter new entry
        # '(item["id"] in (4, 5, 6, 7, 8) and not (item["id"] == 5 and item["id"] == 4 or item["id"] == 8)) or ((item["address"]["city"] == "Gwenborough") and (item["id"] > 0 and item["id"] < 5))'
        new = [item for item in new if eval(alert.filter)]

        
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

        # Filter new entry
        new = [item for item in new if eval('(item["id"] in (4, 5, 6, 7, 8) and not (item["id"] == 5 and item["id"] == 4 or item["id"] == 8)) or ((item["address"]["city"] == "Gwenborough") and (item["id"] > 0 and item["id"] < 5))')]

        
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

        # Compare with new entry
        diff_summary = cdc.compare(old, new)

        # new[5]['name'] = 'Hello world'
        # cdc.save_existing(choices(new, k=len(new) // 2))
        cdc.save_existing(new)

        return diff_summary


cdc_manager = CDCManager()
cdc_manager.registerCDC(DemoCDC())