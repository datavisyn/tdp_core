import * as React from 'react';

export function InvalidCols({ headerMessage, bodyMessage }: { headerMessage: string; bodyMessage: string }) {
  return (
    <div className="card w-25 h-10 justify-content-center">
      <div className="card-header">{headerMessage}</div>
      <div className="card-body">
        <p className="card-text">{bodyMessage}</p>
      </div>
    </div>
  );
}
