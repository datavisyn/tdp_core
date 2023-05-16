import { isNumberColumn, isDateColumn } from 'lineupjs';
import { XlsxUtils } from 'visyn_core/utils';
class ExportUtils {
    /**
     * Returns an IExportFormat object for the given format.
     * If no format is registered the return value is `null`.
     *
     * @param format Export format as string
     */
    static getExportFormat(format) {
        switch (format) {
            case 'json':
            case 'JSON':
                return ExportUtils.EXPORT_FORMAT.JSON;
            case 'csv':
            case 'CSV':
                return ExportUtils.EXPORT_FORMAT.CSV;
            case 'tsv':
            case 'TSV':
                return ExportUtils.EXPORT_FORMAT.TSV;
            case 'ssv':
            case 'SSV':
                return ExportUtils.EXPORT_FORMAT.SSV;
            case 'xlsx':
            case 'XLSX':
                return ExportUtils.EXPORT_FORMAT.XLSX;
            default:
                return null;
        }
    }
    static getColumnName(column) {
        return column.label + (column.desc.summary ? ` - ${column.desc.summary}` : '') + (column.description ? `\n${column.description}` : '');
    }
    static exportRanking(columns, rows, separator) {
        // optionally quote not numbers
        const escape = /["]/g;
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
            sheets: [
                {
                    title: 'LineUp',
                    columns: columns.map((d) => ({
                        name: ExportUtils.getColumnName(d),
                        type: (isNumberColumn(d) ? 'float' : isDateColumn(d) ? 'date' : 'string'),
                    })),
                    rows: converted,
                },
            ],
        });
    }
    static toBlob(content, mimeType) {
        return new Blob([content], { type: mimeType });
    }
}
ExportUtils.EXPORT_FORMAT = {
    JSON: {
        name: 'json',
        separator: null,
        mimeType: 'application/json',
        fileExtension: '.json',
        getRankingContent(columns, rows) {
            const content = ExportUtils.exportJSON(columns, rows);
            const blob = ExportUtils.toBlob(content, ExportUtils.EXPORT_FORMAT.JSON.mimeType);
            return Promise.resolve(blob);
        },
    },
    CSV: {
        name: 'csv',
        separator: ',',
        mimeType: 'text/csv',
        fileExtension: '.csv',
        getRankingContent(columns, rows) {
            const content = ExportUtils.exportRanking(columns, rows, ExportUtils.EXPORT_FORMAT.CSV.separator);
            const blob = ExportUtils.toBlob(content, ExportUtils.EXPORT_FORMAT.CSV.mimeType);
            return Promise.resolve(blob);
        },
    },
    TSV: {
        name: 'tsv',
        separator: '\t',
        mimeType: 'text/tab-separated-values',
        fileExtension: '.tsv',
        getRankingContent(columns, rows) {
            const content = ExportUtils.exportRanking(columns, rows, ExportUtils.EXPORT_FORMAT.TSV.separator);
            const blob = ExportUtils.toBlob(content, ExportUtils.EXPORT_FORMAT.TSV.mimeType);
            return Promise.resolve(blob);
        },
    },
    SSV: {
        name: 'ssv',
        separator: ';',
        mimeType: 'text/csv',
        fileExtension: '.csv',
        getRankingContent(columns, rows) {
            const content = ExportUtils.exportRanking(columns, rows, ExportUtils.EXPORT_FORMAT.SSV.separator);
            const blob = ExportUtils.toBlob(content, ExportUtils.EXPORT_FORMAT.SSV.mimeType);
            return Promise.resolve(blob);
        },
    },
    XLSX: {
        name: 'xlsx',
        separator: null,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileExtension: '.xlsx',
        getRankingContent(columns, rows) {
            return ExportUtils.exportXLSX(columns, rows); // returns a Promise<Blob>
        },
    },
};
export { ExportUtils };
//# sourceMappingURL=ExportUtils.js.map