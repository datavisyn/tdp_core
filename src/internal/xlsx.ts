import {sendAPI, api2absURL, send} from 'phovea_core/src/ajax';

export interface IXLSXColumn {
  name: string;
  type: 'string'|'float'|'int'|'date'|'boolean';
}

export interface IXLSXSheet {
  title: string;
  columns: IXLSXColumn[];
  rows: { [key: string]: string|number|Date|boolean|null}[];
}

export interface IXLSXJSONFile {
  sheets: IXLSXSheet[];
}


export function xlsx2json(file: File): Promise<IXLSXJSONFile> {
  const data = new FormData();
  data.set('file', file);

  return sendAPI('/tdp/xlsx/to_json', data, 'POST');
}

export function xlsx2jsonArray(file: File): Promise<any[][]> {
  const data = new FormData();
  data.set('file', file);

  return sendAPI('/tdp/xlsx/to_json_array', data, 'POST');
}

export function json2xlsx(file: IXLSXJSONFile): Promise<Blob> {
  return send(api2absURL('/tdp/xlsx/from_json'), file, 'POST', 'blob', 'application/json');
}
