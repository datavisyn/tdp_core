import * as React from 'react';
import { useTable } from 'react-table';
// tslint:disable-next-line: variable-name
export function TDP_UI_Table(props) {
    const { columns, data } = props;
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });
    // Render the UI for your table
    return (React.createElement("table", Object.assign({}, getTableProps({ className: 'table-component table table-sm' })),
        React.createElement("thead", null, headerGroups.map((headerGroup) => (React.createElement("tr", Object.assign({}, headerGroup.getHeaderGroupProps()), headerGroup.headers.map((column) => (React.createElement("th", Object.assign({}, column.getHeaderProps()), column.render('Header')))))))),
        React.createElement("tbody", Object.assign({}, getTableBodyProps()), rows.map((row, i) => {
            prepareRow(row);
            return (React.createElement("tr", Object.assign({}, row.getRowProps()), row.cells.map((cell) => {
                return React.createElement("td", Object.assign({}, cell.getCellProps()), cell.render('Cell'));
            })));
        }))));
}
//# sourceMappingURL=PHOVEA_UI_Table.js.map