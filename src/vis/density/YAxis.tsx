import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';

// code taken from https://wattenberger.com/blog/react-and-d3
export function YAxis({ domain = [0, 100], range = [10, 290], horizontalPosition = 0 }) {
  const ticks = useMemo(() => {
    const yScale = d3.scaleLinear().domain(domain.reverse()).range(range).nice();
    return yScale.ticks().map((value) => ({
      value,
      yOffset: yScale(value),
    }));
  }, [domain.join('-'), range.join('-')]);
  return (
    <>
      <path transform={`translate(${horizontalPosition}, 0)`} d={['M', 0, range[0], 'V', range[1]].join(' ')} fill="none" stroke="currentColor" />
      {ticks.map(({ value, yOffset }) => (
        <g key={value} transform={`translate(${horizontalPosition}, ${yOffset})`}>
          <line x2="-6" stroke="currentColor" />
          <text
            key={value}
            style={{
              fontSize: '10px',
              textAnchor: 'end',
              transform: 'translateX(-8px)',
            }}
          >
            {value}
          </text>
        </g>
      ))}
    </>
  );
}
