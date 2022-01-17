import * as React from 'react';
import { useTable, Column } from 'react-table';

export interface ITableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function TDP_UI_Table<T extends object>(props: ITableProps<T>) {
  const { columns, data } = props;

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<T>({ columns, data });

  // Render the UI for your table
  return (
    <table {...getTableProps({ className: 'table-component table table-sm' })}>
      <thead>
        {headerGroups.map((headerGroup, i) => (
          <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th key={column.id} {...column.getHeaderProps()}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr key={row.id} {...row.getRowProps()}>
              {row.cells.map((cell, idx) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <td key={idx} {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
