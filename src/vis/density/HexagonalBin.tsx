import * as hex from 'd3-hexbin';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { VisColumn, IDensityConfig } from '../interfaces';
import { cutHex, getHexData } from './utils';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';

interface HexagonalBinProps {
  config: IDensityConfig;
  columns: VisColumn[];
}

const margin = {
  left: 50,
  right: 50,
  top: 50,
  bottom: 50,
};

function Legend({ categories, colorScale, onClick }) {
  return <div>Hello World</div>;
}

export function HexagonalBin({ config, columns }: HexagonalBinProps) {
  const ref = useRef(null);
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);

  const { value: allColumns, status: colsStatus, error: colsError } = useAsync(getHexData, [columns, config]);

  useEffect(() => {
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      setHeight(entries[0].contentRect.height - margin.top - margin.bottom);
      setWidth(entries[0].contentRect.width - margin.left - margin.right);
    });

    if (ref) {
      ro.observe(ref.current);
    }
  }, []);

  const xScale = useMemo(() => {
    if (colsStatus === 'success') {
      const min = d3.min<number>(allColumns.numColVals[0].resolvedValues.map((c) => c.val as number));
      const max = d3.max<number>(allColumns.numColVals[0].resolvedValues.map((c) => c.val as number));

      return d3.scaleLinear().domain([min, max]).range([0, width]);
    }

    return null;
  }, [colsStatus, allColumns?.numColVals, width]);

  const yScale = useMemo(() => {
    if (colsStatus === 'success') {
      const min = d3.min<number>(allColumns.numColVals[1].resolvedValues.map((c) => c.val as number));
      const max = d3.max<number>(allColumns.numColVals[1].resolvedValues.map((c) => c.val as number));

      return d3.scaleLinear().domain([min, max]).range([height, 0]);
    }

    return null;
  }, [colsStatus, allColumns?.numColVals, height]);

  const d3Hexbin = hex
    .hexbin()
    .radius(16)
    .extent([
      [0, 0],
      [width, height],
    ]);

  const inputForHexbin = [];

  if (colsStatus === 'success') {
    allColumns.numColVals[0].resolvedValues.forEach((c, i) => {
      inputForHexbin.push([
        xScale(c.val as number),
        yScale(allColumns.numColVals[1].resolvedValues[i].val as number),
        allColumns.colorColVals ? allColumns.colorColVals.resolvedValues[i].val : '',
      ]);
    });
  }

  const hexes = d3Hexbin(inputForHexbin);

  const radiusScale = useMemo(() => {
    if (colsStatus === 'success') {
      const min = d3.min(hexes.map((h) => h.length));
      const max = d3.max(hexes.map((h) => h.length));

      return d3.scaleLinear().domain([min, max]).range([2, 16]);
    }

    return null;
  }, [colsStatus, hexes]);

  const baseColorScale = d3
    .scaleLinear<string, string>()
    .domain([0, d3.max(hexes.map((h) => h.length))])
    .range(['transparent', '#69b3a2']);

  const colorScale = useMemo(() => {
    if (colsStatus !== 'success' || !allColumns.colorColVals) {
      return null;
    }
    const colorOptions = allColumns.colorColVals.resolvedValues.map((val) => val.val as string);

    return d3.scaleOrdinal<string, string>(d3.schemeCategory10).domain(Array.from(new Set<string>(colorOptions)));
  }, [colsStatus, allColumns?.colorColVals]);

  d3.scaleOrdinal<string, string>().domain(Array.from(new Set<string>())).range(['transparent', '#69b3a2']);

  return (
    <div ref={ref} className="mw-100">
      <svg style={{ width: width + margin.left + margin.right, height: height + margin.top + margin.bottom }}>
        <clipPath id="clip">
          <rect transform={`translate(${margin.left}px, ${margin.top}px)`} width={width} height={height} />
        </clipPath>
        <g clipPath="url(#clip)" style={{ transform: `translate(${margin.left}px, ${margin.top}px)` }}>
          {hexes.map((singleHex) => {
            const catMap = {};

            singleHex.forEach((point: [number, number, string]) => {
              catMap[point[2]] = catMap[point[2]] ? catMap[point[2]] + 1 : 1;
            });

            const maxIndex = d3.maxIndex(Object.keys(catMap), (key) => catMap[key]);

            const hexDivisor = singleHex.length / 6;

            let counter = 0;

            return Object.keys(catMap)
              .sort()
              .map((key) => {
                const currPath = cutHex(d3Hexbin.hexagon(), 16, counter, Math.ceil(catMap[key] / hexDivisor));
                counter += Math.ceil(catMap[key] / hexDivisor);
                return (
                  <path
                    key={`${singleHex.x}, ${singleHex.y}, ${key}`}
                    d={currPath}
                    style={{
                      fill: `${colorScale ? colorScale(key) : baseColorScale(singleHex.length)}`,
                      transform: `translate(${singleHex.x}px, ${singleHex.y}px)`,
                      stroke: 'black',
                      strokeWidth: '0.2',
                      // opacity: colorScale ? '.7' : '1',
                    }}
                  />
                );
              });
          })}
        </g>
        <XAxis vertPosition={height + margin.top} domain={xScale?.domain()} range={[margin.left, width + margin.left]} />
        <YAxis horizontalPosition={margin.left} domain={yScale?.domain()} range={[margin.top, height + margin.top]} />
      </svg>
      <div className="position-absolute" style={{ left: margin.left + width, top: margin.top }}>
        <Legend />
      </div>
    </div>
  );
}
