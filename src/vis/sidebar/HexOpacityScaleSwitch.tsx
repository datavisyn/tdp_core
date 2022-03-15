import * as React from 'react';

interface HexOpacitySwitchProps {
  callback: (b: boolean) => void;
  currentValue: boolean;
}

export function HexOpacitySwitch({ callback, currentValue }: HexOpacitySwitchProps) {
  return (
    <div className="ps-2 pt-1 m-0">
      <div className="form-check form-switch">
        <input onChange={() => callback(!currentValue)} checked={currentValue} className="form-check-input" type="checkbox" id="hexOpacitySwitch" />
        <label className="form-check-label" htmlFor="hexOpacitySwitch">
          Hex Opacity Scale
        </label>
      </div>
    </div>
  );
}
