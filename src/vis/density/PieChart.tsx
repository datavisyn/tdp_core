import * as d3 from 'd3v7';
import * as React from 'react';

export interface PieChartProps {
  data: number[];
  dataCategories: string[];
  radius: number;
  transform: string;
  colorScale: any;
}

export function PieChart({ data, dataCategories, radius, transform, colorScale }: PieChartProps) {
  const pie = d3.pie();

  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  return (
    <g style={{ transform }}>
      {pie(data).map((slice, i) => {
        return <path d={arc(slice)} style={{ fill: colorScale ? colorScale(dataCategories[i]) : 'cornflowerblue' }} />;
      })}
    </g>
  );
}
