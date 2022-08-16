let metaData = null;
export class AppMetaDataUtils {
    static getMetaData() {
        if (metaData === null) {
            metaData = window
                .fetch('./phoveaMetaData.json')
                .then((r) => r.json())
                .catch((r) => {
                console.warn('cannot read phoveaMetaData.json file, generate dummy');
                return { name: 'Phovea Application', version: '?', repository: '?', homepage: '', description: 'Fallback appication meta data' };
            });
        }
        return metaData;
    }
}
//# sourceMappingURL=metaData.js.map