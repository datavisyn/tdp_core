import * as React from 'react';
import { ReactNode } from 'react';

export function VisSidebarWrapper({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div className="position-relative h-100 flex-shrink-1 bg-light overflow-auto">
      <button
        className="btn btn-primary-outline"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target={`#generalVisBurgerMenu${id}`}
        aria-expanded="true"
        aria-controls="generalVisBurgerMenu"
      >
        <i className="fas fa-bars" />
      </button>
      <div className="collapse show collapse-horizontal" id={`generalVisBurgerMenu${id}`}>
        {children}
      </div>
    </div>
  );
}
