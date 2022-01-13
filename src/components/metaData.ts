export interface IAppMetaData {
  name: string;
  displayName?: string;
  version: string;
  repository: string;
  description: string;
  homepage: string;
  screenshot?: string;
}

let metaData: Promise<IAppMetaData> = null;

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
