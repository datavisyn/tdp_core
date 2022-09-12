import * as React from 'react';
import datavisynLogo from './datavisyn_white.svg';

export function DatavisynLogo() {
  return (
    <a href="https://datavisyn.io/" rel="noreferrer" target="_blank">
      <img src={datavisynLogo} alt="logo" style={{ height: '24px' }} />
    </a>
  );
}
