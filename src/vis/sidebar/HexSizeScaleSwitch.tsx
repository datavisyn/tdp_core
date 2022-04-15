import * as React from 'react';

interface HexSizeSwitchProps {
  callback: (b: boolean) => void;
  currentValue: boolean;
}

export function HexSizeSwitch({ callback, currentValue }: HexSizeSwitchProps) {
  return (
    <div className="ps-2 pt-1 m-0">
      <div className="form-check form-switch">
        <input onChange={() => callback(!currentValue)} checked={currentValue} className="form-check-input" type="checkbox" id="hexSizeSwitch" />
        <label className="form-check-label" htmlFor="hexSizeSwitch">
          Hex Size Scale
        </label>
      </div>
    </div>
  );
}
