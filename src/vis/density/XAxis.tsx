import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';

// code taken from https://wattenberger.com/blog/react-and-d3
export function XAxis({ domain = [0, 100], range = [10, 290], yRange, vertPosition = 0 }) {
  const ticks = useMemo(() => {
    const xScale = d3.scaleLinear().domain(domain).range(range);
    return xScale.ticks(5).map((value) => ({
      value,
      xOffset: xScale(value),
    }));
  }, [domain, range]);
  return (
    <>
      <path transform={`translate(0, ${vertPosition})`} d={['M', range[0], 0, 'H', range[1]].join(' ')} fill="none" stroke="currentColor" />
      {ticks.map(({ value, xOffset }) => (
        <g key={value} transform={`translate(${xOffset}, ${vertPosition})`}>
          <line y2="6" stroke="currentColor" />
          <line y2={`${-(yRange[1] - yRange[0])}`} stroke={`${value === 0 ? 'black' : 'lightgray'}`} />
          <text
            key={value}
            style={{
              fontSize: '10px',
              textAnchor: 'middle',
              transform: 'translateY(20px)',
            }}
          >
            {value}
          </text>
        </g>
      ))}
    </>
  );
}
