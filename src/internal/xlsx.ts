import {sendAPI, api2absURL, send} from 'phovea_core/src/ajax';

export interface IxlsxColumn {
  name: string;
  type: 'string'|'float'|'int'|'date'|'boolean';
}

export interface IxlsxSheet {
  title: string;
  columns: IxlsxColumn[];
  rows: { [key: string]: string|number|Date|boolean|null}[];
}

export interface IxlsxJSONFile {
  sheets: IxlsxSheet[];
}


export function xlsx2json(file: File): Promise<IxlsxJSONFile> {
  const data = new FormData();
  data.set('file', file);

  return sendAPI('/tdp/xlsx/to_json', data, 'POST');
}

export function json2xlsx(file: IxlsxJSONFile): Promise<Blob> {
  return send(api2absURL('/tdp/xlsx/from_json'), file, 'POST', 'blob', 'application/json');
}
