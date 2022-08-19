import { merge } from 'lodash';
import * as papaparse from 'papaparse';

export interface IParseResult {
  data: any;
  meta: any;
}

export interface ICSVParsingOptions {
  header?: boolean;
  delimiter?: string;
  newline?: '\r' | '\n' | '\r\n' | undefined;
}

const defaultOptions = {
  skipEmptyLines: true,
};

export class ParserUtils {
  /**
   * parses the given csv file/blob using PapaParse
   * @param data
   * @param options additional options
   * @return {Promise<R>|Promise}
   */
  static parseCSV(data: any, options: ICSVParsingOptions = {}): Promise<IParseResult> {
    return new Promise((resolve, reject) => {
      papaparse.parse(
        data,
        merge(
          {
            complete: (result) => resolve({ data: result.data, meta: result.meta }),
            error: (error) => reject(error),
          },
          defaultOptions,
          options,
        ),
      );
    });
  }

  static streamCSV(data: any, chunk: (chunk: IParseResult) => any, options: ICSVParsingOptions = {}): Promise<IParseResult> {
    return new Promise((resolve, reject) => {
      papaparse.parse(
        data,
        merge(
          {
            complete: (result) => resolve(null),
            chunk: (result) => chunk({ data: result.data, meta: result.meta }),
            error: (error) => reject(error),
          },
          defaultOptions,
          options,
        ),
      );
    });
  }
}
