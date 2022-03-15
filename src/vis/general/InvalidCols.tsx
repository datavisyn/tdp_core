import * as React from 'react';

export function InvalidCols({ message }: { message: string }) {
  return (
    <div className="card w-25 h-10 justify-content-center">
      <div className="card-header">Invalid columns selected</div>
      <div className="card-body">
        <p className="card-text">{message}</p>
      </div>
    </div>
  );
}
