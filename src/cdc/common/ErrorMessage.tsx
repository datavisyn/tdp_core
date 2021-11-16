import * as React from 'react';

export function ErrorMessage({error, onRetry}: {error: Error | null; onRetry?: () => void}) {
  return error ? (
    <div className="alert alert-danger flex-fill d-flex align-items-center" role="alert">
      <i className="fas fa-exclamation-triangle text-danger me-1"/>
      <div className="flex-fill">{error.message}</div>
      {onRetry ? (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  ) : null;
}
