import * as React from 'react';
import datavisynLogoWhite from '../../assets/datavisyn_white.svg';
import datavisynLogoBlack from '../../assets/datavisyn_black.svg';
import datavisynLogoColor from '../../assets/datavisyn_color.svg';

export function DatavisynLogo({ color }: { color: 'white' | 'black' | 'color' }) {
  const source = color === 'white' ? datavisynLogoWhite : color === 'black' ? datavisynLogoBlack : datavisynLogoColor;
  return (
    <a href="https://datavisyn.io/" rel="noreferrer" target="_blank">
      <img src={source} alt="logo" style={{ height: '24px' }} />
    </a>
  );
}
