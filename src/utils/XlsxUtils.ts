import {Ajax, AppContext} from 'phovea_core';

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

export class XlsxUtils {

  static xlsx2json(file: File): Promise<IXLSXJSONFile> {
    const data = new FormData();
    data.set('file', file);

    return AppContext.getInstance().sendAPI('/tdp/xlsx/to_json', data, 'POST');
  }

  static xlsx2jsonArray(file: File): Promise<any[][]> {
    const data = new FormData();
    data.set('file', file);

    return AppContext.getInstance().sendAPI('/tdp/xlsx/to_json_array', data, 'POST');
  }

  static json2xlsx(file: IXLSXJSONFile): Promise<Blob> {
    return Ajax.send(AppContext.getInstance().api2absURL('/tdp/xlsx/from_json'), file, 'POST', 'blob', 'application/json');
  }


  static jsonArray2xlsx(file: any[][]): Promise<Blob> {
    return Ajax.send(AppContext.getInstance().api2absURL('/tdp/xlsx/from_json_array'), file, 'POST', 'blob', 'application/json');
  }
}
