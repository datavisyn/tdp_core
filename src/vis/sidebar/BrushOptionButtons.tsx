import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintBrush, faSquare, faSearchPlus, faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { SegmentedControl } from '@mantine/core';
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
        { label: <FontAwesomeIcon icon={faSquare} />, value: EScatterSelectSettings.RECTANGLE },
        { label: <FontAwesomeIcon icon={faPaintBrush} />, value: EScatterSelectSettings.LASSO },
        { label: <FontAwesomeIcon icon={faArrowsAlt} />, value: EScatterSelectSettings.PAN },
        { label: <FontAwesomeIcon icon={faSearchPlus} />, value: EScatterSelectSettings.ZOOM },
      ]}
    />
  );
}
