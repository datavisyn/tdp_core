from typing import Dict
from .BaseCDC import BaseCDC
import requests


class CortellisTrialsCDC(BaseCDC):
    def load_data(self, options: Dict = {}):
        data = requests.get('https://api.the-brain.int.bayer.com/datasource/cortellis/trialsForTarget?entrez_gene_id=1234&returnkey=phase&returnkey=indications&returnkey=datestart&returnkey=dateend&returnkey=numberofsites&returnkey=enrollmentcount&returnkey=trialid').json()
        # data[0]['phase'] = 'Phase 3 Clinical'
        return data

    def get_id(self, item):
        return item['trialid']
