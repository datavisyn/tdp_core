import * as React from 'react';

interface BrushOptionProps {
  callback: (b: boolean) => void;
  isRectBrush: boolean;
}

export function BrushOptionButtons({ callback, isRectBrush }: BrushOptionProps) {
  return (
    <div className="btn-group" role="group">
      <input checked={isRectBrush} onChange={() => callback(true)} type="checkbox" className="btn-check" id="rectBrushSelection" autoComplete="off" />
      <label className="btn btn-outline-primary" htmlFor="rectBrushSelection" title="Rectangular Brush">
        <i className="far fa-square" />
      </label>

      <input checked={!isRectBrush} onChange={() => callback(false)} type="checkbox" className="btn-check" id="lassoBrushSelection" autoComplete="off" />
      <label className="btn btn-outline-primary" htmlFor="lassoBrushSelection" title="Lasso Brush">
        <i className="fas fa-paint-brush" />
      </label>
    </div>
  );
}
