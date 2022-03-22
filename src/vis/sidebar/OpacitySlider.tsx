import * as React from 'react';

interface OpacitySliderProps {
  callback: (n: number) => void;
  currentValue: number;
}

export function OpacitySlider({ callback, currentValue }: OpacitySliderProps) {
  return (
    <div className="ps-2 pt-0 m-0">
      <label htmlFor="alphaSlider" className="form-label m-0 p-0">
        Opacity
      </label>
      <input
        type="range"
        onChange={(e) => callback(+e.currentTarget.value)}
        className="form-range"
        value={currentValue}
        min="=0"
        max="1"
        step=".1"
        id="alphaSlider"
      />
    </div>
  );
}
