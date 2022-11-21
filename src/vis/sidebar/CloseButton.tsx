import * as React from 'react';

export function CloseButton({ closeCallback }: { closeCallback: () => void }) {
  return (
    <div className="position-absolute start-0 top-0">
      <button onClick={() => closeCallback()} type="button" className="btn-close m-1" aria-label="Close" />
    </div>
  );
}
