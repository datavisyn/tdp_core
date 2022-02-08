import * as React from 'react';

interface InvalidColsProps {
  message: string;
}

export function InvalidCols({ message }: InvalidColsProps) {
  return (
    <div className="card w-25 h-10 justify-content-center">
      <div className="card-header">Invalid Columns Selected</div>
      <div className="card-body">
        <p className="card-text">{message}</p>
      </div>
    </div>
  );
}
