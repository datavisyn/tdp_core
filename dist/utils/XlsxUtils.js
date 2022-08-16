import { AppContext } from '../app';
import { Ajax } from '../base/ajax';
export class XlsxUtils {
    static xlsx2json(file) {
        const data = new FormData();
        data.set('file', file);
        return AppContext.getInstance().sendAPI('/tdp/xlsx/to_json', data, 'POST');
    }
    static xlsx2jsonArray(file) {
        const data = new FormData();
        data.set('file', file);
        return AppContext.getInstance().sendAPI('/tdp/xlsx/to_json_array', data, 'POST');
    }
    static json2xlsx(file) {
        return Ajax.send(AppContext.getInstance().api2absURL('/tdp/xlsx/from_json'), file, 'POST', 'blob', 'application/json');
    }
    static jsonArray2xlsx(file) {
        return Ajax.send(AppContext.getInstance().api2absURL('/tdp/xlsx/from_json_array'), file, 'POST', 'blob', 'application/json');
    }
}
//# sourceMappingURL=XlsxUtils.js.map