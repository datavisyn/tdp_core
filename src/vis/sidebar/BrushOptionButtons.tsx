import * as React from 'react';
import { EScatterSelectSettings } from '../interfaces';

interface BrushOptionProps {
  callback: (dragMode: EScatterSelectSettings) => void;
  dragMode: EScatterSelectSettings;
}

export function BrushOptionButtons({ callback, dragMode }: BrushOptionProps) {
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
        <i className="far fa-square" />
      </label>

      <input
        checked={dragMode === EScatterSelectSettings.LASSO}
        onChange={() => callback(EScatterSelectSettings.LASSO)}
        type="checkbox"
        className="btn-check"
        id="lassoBrushSelection"
        autoComplete="off"
      />
      <label className="btn btn-outline-primary" htmlFor="lassoBrushSelection" title="Lasso Brush">
        <i className="fas fa-paint-brush" />
      </label>
      <input
        checked={dragMode === EScatterSelectSettings.ZOOM}
        onChange={() => callback(EScatterSelectSettings.ZOOM)}
        type="checkbox"
        className="btn-check"
        id="zoomBrushSelection"
        autoComplete="off"
      />
      <label className="btn btn-outline-primary" htmlFor="zoomBrushSelection" title="Zoom">
        <i className="fas fa-search-plus" />
      </label>
      <input
        checked={dragMode === EScatterSelectSettings.PAN}
        onChange={() => callback(EScatterSelectSettings.PAN)}
        type="checkbox"
        className="btn-check"
        id="panSelection"
        autoComplete="off"
      />
      <label className="btn btn-outline-primary" htmlFor="panSelection" title="Pan">
        <i className="fas fa-arrows-alt" />
      </label>
    </div>
  );
}
