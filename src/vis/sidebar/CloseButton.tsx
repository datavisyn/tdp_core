import * as React from 'react';

export function CloseButton({ closeCallback }: { closeCallback: () => void }) {
  return (
    <div className="position-absolute end-0 top-0">
      <button onClick={() => closeCallback()} className="btn btn-primary-outline" type="button">
        <i className="fas fa-times" />
      </button>
    </div>
  );
}
