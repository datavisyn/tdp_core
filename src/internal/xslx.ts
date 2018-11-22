import {sendAPI, api2absURL, send} from 'phovea_core/src/ajax';

export interface IXSLXColumn {
  name: string;
  type: 'string'|'float'|'int'|'date'|'boolean';
}

export interface IXSLXSheet {
  columns: IXSLXColumn[];
  rows: { [key: string]: string|number|Date|boolean|null}[];
}

export interface IXSLXJSONFile {
  sheet: IXSLXSheet[];
}


export function xslx2json(file: File): Promise<IXSLXJSONFile> {
  const data = new FormData();
  data.set('file', file);

  return sendAPI('/tdp/xslx/to_json', data, 'POST');
}

export function json2xslx(file: IXSLXJSONFile): Promise<Blob> {
  return send(api2absURL('/tdp/xslx/from_json'), file, 'POST', 'blob', 'application/json');
}
