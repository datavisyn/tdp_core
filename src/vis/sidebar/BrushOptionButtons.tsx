import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintBrush, faSquare, faSearchPlus, faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { SegmentedControl, Tooltip } from '@mantine/core';
import * as React from 'react';
import { EScatterSelectSettings } from '../interfaces';

interface BrushOptionProps {
  callback: (dragMode: EScatterSelectSettings) => void;
  dragMode: EScatterSelectSettings;
}

export function BrushOptionButtons({ callback, dragMode }: BrushOptionProps) {
  return (
    <SegmentedControl
      value={dragMode}
      onChange={callback}
      data={[
        {
          label: (
            <Tooltip withinPortal withArrow arrowSize={6} label="Rectangular brush">
              <FontAwesomeIcon icon={faSquare} />
            </Tooltip>
          ),
          value: EScatterSelectSettings.RECTANGLE,
        },
        {
          label: (
            <Tooltip withinPortal withArrow arrowSize={6} label="Lasso brush">
              <FontAwesomeIcon icon={faPaintBrush} />
            </Tooltip>
          ),
          value: EScatterSelectSettings.LASSO,
        },
        {
          label: (
            <Tooltip withinPortal withArrow arrowSize={6} label="Zoom/Pan">
              <FontAwesomeIcon icon={faArrowsAlt} />
            </Tooltip>
          ),
          value: EScatterSelectSettings.PAN,
        },
        {
          label: (
            <Tooltip withinPortal withArrow arrowSize={6} label="Rectangular zoom">
              <FontAwesomeIcon icon={faSearchPlus} />
            </Tooltip>
          ),
          value: EScatterSelectSettings.ZOOM,
        },
      ]}
    />
  );
}
