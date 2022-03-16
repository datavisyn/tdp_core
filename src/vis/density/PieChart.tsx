import * as d3 from 'd3v7';
import { uniqueId } from 'lodash';
import * as React from 'react';
import { useMemo } from 'react';

export interface PieChartProps {
  data: number[];
  dataCategories: string[];
  radius: number;
  transform: string;
  colorScale: d3.ScaleOrdinal<string, string, never>;
}

export function PieChart({ data, dataCategories, radius, transform, colorScale }: PieChartProps) {
  const pie = useMemo(() => {
    return d3.pie();
  }, []);

  const arc = useMemo(() => {
    return d3.arc().innerRadius(0).outerRadius(radius);
  }, [radius]);

  const id = React.useMemo(() => uniqueId('PieNum'), []);

  return (
    <g style={{ transform }}>
      {pie(data).map((slice, i) => {
        return <path key={`${id}, ${i}`} d={arc(slice)} style={{ fill: colorScale ? colorScale(dataCategories[i]) : 'cornflowerblue' }} />;
      })}
    </g>
  );
}
