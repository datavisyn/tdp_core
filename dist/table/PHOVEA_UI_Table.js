import * as React from 'react';
import { useTable } from 'react-table';
// eslint-disable-next-line @typescript-eslint/naming-convention
export function TDP_UI_Table(props) {
    const { columns, data } = props;
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });
    // Render the UI for your table
    return (React.createElement("table", Object.assign({}, getTableProps({ className: 'table-component table table-sm' })),
        React.createElement("thead", null, headerGroups.map((headerGroup, i) => (React.createElement("tr", Object.assign({ key: headerGroup.id }, headerGroup.getHeaderGroupProps()), headerGroup.headers.map((column) => (React.createElement("th", Object.assign({ key: column.id }, column.getHeaderProps()), column.render('Header')))))))),
        React.createElement("tbody", Object.assign({}, getTableBodyProps()), rows.map((row, i) => {
            prepareRow(row);
            return (React.createElement("tr", Object.assign({ key: row.id }, row.getRowProps()), row.cells.map((cell, idx) => {
                return (
                // eslint-disable-next-line react/no-array-index-key
                React.createElement("td", Object.assign({ key: idx }, cell.getCellProps()), cell.render('Cell')));
            })));
        }))));
}
//# sourceMappingURL=PHOVEA_UI_Table.js.map