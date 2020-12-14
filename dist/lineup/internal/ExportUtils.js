import { isNumberColumn, isDateColumn } from 'lineupjs';
import { XlsxUtils } from '../../utils/XlsxUtils';
export class ExportUtils {
    static getColumnName(column) {
        return column.label + (column.desc.summary ? ' - ' + column.desc.summary : '') + (column.description ? '\n' + column.description : '');
    }
    static exportRanking(columns, rows, separator) {
        //optionally quote not numbers
        const escape = new RegExp(`["]`, 'g');
        function quote(v, c) {
            if (v == null) {
                return '';
            }
            const l = v.toString();
            if (l == null || l === 'null') {
                return '';
            }
            if ((l.includes('\n') || l.includes(separator)) && (!c || !isNumberColumn(c))) {
                return `"${l.replace(escape, '""')}"`;
            }
            return l;
        }
        const r = [];
        r.push(columns.map((d) => quote(ExportUtils.getColumnName(d))).join(separator));
        rows.forEach((row) => {
            r.push(columns.map((c) => quote(c.getExportValue(row, 'text'), c)).join(separator));
        });
        return r.join('\n');
    }
    static exportJSON(columns, rows) {
        const converted = rows.map((row) => {
            const r = {};
            for (const col of columns) {
                r[ExportUtils.getColumnName(col)] = isNumberColumn(col) ? col.getRawNumber(row) : col.getExportValue(row, 'json');
            }
            return r;
        });
        return JSON.stringify(converted, null, 2);
    }
    static exportXLSX(columns, rows) {
        const converted = rows.map((row) => {
            const r = {};
            for (const col of columns) {
                r[ExportUtils.getColumnName(col)] = isNumberColumn(col) ? col.getRawNumber(row) : col.getExportValue(row, 'text');
            }
            return r;
        });
        return XlsxUtils.json2xlsx({
            sheets: [{
                    title: 'LineUp',
                    columns: columns.map((d) => ({ name: ExportUtils.getColumnName(d), type: (isNumberColumn(d) ? 'float' : isDateColumn(d) ? 'date' : 'string') })),
                    rows: converted
                }]
        });
    }
    static resortAble(base, elementSelector) {
        const items = Array.from(base.querySelectorAll(elementSelector));
        const enable = (item) => {
            item.classList.add('dragging');
            base.classList.add('dragging');
            let prevBB;
            let nextBB;
            const update = () => {
                prevBB = item.previousElementSibling && item.previousElementSibling.matches(elementSelector) ? item.previousElementSibling.getBoundingClientRect() : null;
                nextBB = item.nextElementSibling && item.nextElementSibling.matches(elementSelector) ? item.nextElementSibling.getBoundingClientRect() : null;
            };
            update();
            base.onmouseup = base.onmouseleave = () => {
                item.classList.remove('dragging');
                base.classList.remove('dragging');
                base.onmouseleave = base.onmouseup = base.onmousemove = null;
            };
            base.onmousemove = (evt) => {
                const y = evt.clientY;
                if (prevBB && y < (prevBB.top + prevBB.height / 2)) {
                    // move up
                    item.parentElement.insertBefore(item, item.previousElementSibling);
                    update();
                }
                else if (nextBB && y > (nextBB.top + nextBB.height / 2)) {
                    // move down
                    item.parentElement.insertBefore(item.nextElementSibling, item);
                    update();
                }
                evt.preventDefault();
                evt.stopPropagation();
            };
        };
        for (const item of items) {
            const handle = item.firstElementChild;
            handle.onmousedown = () => {
                enable(item);
            };
        }
    }
}
//# sourceMappingURL=ExportUtils.js.map