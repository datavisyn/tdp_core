import * as React from 'react';
import datavisynLogoWhite from '../../assets/datavisyn_white.svg';
import datavisynLogoBlack from '../../assets/datavisyn_black.svg';

export function DatavisynLogo({ color }: { color: 'white' | 'black' }) {
  return (
    <a href="https://datavisyn.io/" rel="noreferrer" target="_blank">
      <img src={color === 'white' ? datavisynLogoWhite : datavisynLogoBlack} alt="logo" style={{ height: '24px' }} />
    </a>
  );
}
