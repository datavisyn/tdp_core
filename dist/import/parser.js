import { merge } from 'lodash';
import * as papaparse from 'papaparse';
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
    static parseCSV(data, options = {}) {
        return new Promise((resolve, reject) => {
            papaparse.parse(data, merge({
                complete: (result) => resolve({ data: result.data, meta: result.meta }),
                error: (error) => reject(error),
            }, defaultOptions, options));
        });
    }
    static streamCSV(data, chunk, options = {}) {
        return new Promise((resolve, reject) => {
            papaparse.parse(data, merge({
                complete: (result) => resolve(null),
                chunk: (result) => chunk({ data: result.data, meta: result.meta }),
                error: (error) => reject(error),
            }, defaultOptions, options));
        });
    }
}
//# sourceMappingURL=parser.js.map