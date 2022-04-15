import * as React from 'react';
import { EScatterSelectSettings } from '../interfaces';

interface HexBrushOptionsProps {
  callback: (dragMode: EScatterSelectSettings) => void;
  dragMode: EScatterSelectSettings;
}

export function HexBrushOptions({ callback, dragMode }: HexBrushOptionsProps) {
  return (
    <div className="btn-group" role="group">
      <input
        checked={dragMode === EScatterSelectSettings.RECTANGLE}
        onChange={() => callback(EScatterSelectSettings.RECTANGLE)}
        type="checkbox"
        className="btn-check"
        id="rectBrushSelection"
        autoComplete="off"
      />
      <label className="btn btn-outline-primary" htmlFor="rectBrushSelection" title="Rectangular Brush">
        <i className="fas fa-paint-brush" />
      </label>

      <input
        checked={dragMode === EScatterSelectSettings.PAN}
        onChange={() => callback(EScatterSelectSettings.PAN)}
        type="checkbox"
        className="btn-check"
        id="lassoBrushSelection"
        autoComplete="off"
      />
      <label className="btn btn-outline-primary" htmlFor="lassoBrushSelection" title="Lasso Brush">
        <i className="fas fa-arrows-alt" />
      </label>
    </div>
  );
}
