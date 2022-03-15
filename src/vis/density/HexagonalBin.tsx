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
  right: 100,
  top: 50,
  bottom: 50,
};

function Legend({
  categories,
  filteredCategories,
  colorScale,
  onClick,
}: {
  categories: string[];
  filteredCategories: string[];
  colorScale: any;
  onClick: (string) => void;
}) {
  return (
    <div className="ms-2 d-flex flex-column">
      {categories.map((c) => {
        return (
          <div
            className={`p-1 mt-2 d-flex align-items-center ${filteredCategories.includes(c) ? '' : 'bg-light'} cursor-pointer`}
            style={{ borderRadius: 10 }}
            key={c}
            onClick={() => onClick(c)}
          >
            <div style={{ borderRadius: 100, width: '10px', height: '10px', backgroundColor: colorScale(c) }} />
            <div className="ms-1">{c}</div>
          </div>
        );
      })}
    </div>
  );
}

export function HexagonalBin({ config, columns }: HexagonalBinProps) {
  const ref = useRef(null);
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);

  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);

  const { value: allColumns, status: colsStatus, error: colsError } = useAsync(getHexData, [columns, config.numColumnsSelected, config.color]);

  const currentColorColumn = useMemo(() => {
    if (colsStatus === 'success' && config.color && allColumns.colorColVals) {
      return {
        allValues: allColumns.colorColVals.resolvedValues,
        filteredValues: allColumns.colorColVals.resolvedValues.filter((val) => !filteredCategories.includes(val.val as string)),
      };
    }

    return null;
  }, [allColumns?.colorColVals, config.color, colsStatus, filteredCategories]);

  const currentX = useMemo(() => {
    if (colsStatus === 'success' && allColumns) {
      if (config.color && allColumns.colorColVals) {
        return {
          allValues: allColumns.numColVals[0].resolvedValues,
          filteredValues: allColumns.numColVals[0].resolvedValues.filter((val, i) => {
            return !filteredCategories.includes(allColumns.colorColVals.resolvedValues[i].val as string);
          }),
        };
      }
      return {
        allValues: allColumns.numColVals[0].resolvedValues,
        filteredValues: allColumns.numColVals[0].resolvedValues,
      };
    }

    return null;
  }, [allColumns, config.color, colsStatus, filteredCategories]);

  const currentY = useMemo(() => {
    if (colsStatus === 'success' && allColumns) {
      if (config.color && allColumns.colorColVals) {
        return {
          allValues: allColumns.numColVals[1].resolvedValues,
          filteredValues: allColumns.numColVals[1].resolvedValues.filter((val, i) => {
            return !filteredCategories.includes(allColumns.colorColVals.resolvedValues[i].val as string);
          }),
        };
      }
      return {
        allValues: allColumns.numColVals[1].resolvedValues,
        filteredValues: allColumns.numColVals[1].resolvedValues,
      };
    }

    return null;
  }, [allColumns, colsStatus, config.color, filteredCategories]);

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
    if (currentX?.allValues) {
      const min = d3.min<number>(currentX.allValues.map((c) => c.val as number));
      const max = d3.max<number>(currentX.allValues.map((c) => c.val as number));

      return d3.scaleLinear().domain([min, max]).range([0, width]);
    }

    return null;
  }, [currentX?.allValues, width]);

  const yScale = useMemo(() => {
    if (currentY?.allValues) {
      const min = d3.min<number>(currentY.allValues.map((c) => c.val as number));
      const max = d3.max<number>(currentY.allValues.map((c) => c.val as number));

      return d3.scaleLinear().domain([min, max]).range([height, 0]);
    }

    return null;
  }, [currentY?.allValues, height]);

  const d3Hexbin = hex
    .hexbin()
    .radius(config.hexRadius)
    .extent([
      [0, 0],
      [width, height],
    ]);

  const inputForHexbin = [];

  if (currentX) {
    currentX.filteredValues.forEach((c, i) => {
      inputForHexbin.push([
        xScale(c.val as number),
        yScale(currentY.filteredValues[i].val as number),
        currentColorColumn ? currentColorColumn.filteredValues[i].val : '',
      ]);
    });
  }

  const hexes = d3Hexbin(inputForHexbin);

  const radiusScale = useMemo(() => {
    if (colsStatus === 'success') {
      const min = d3.min(hexes.map((h) => h.length));
      const max = d3.max(hexes.map((h) => h.length));

      return d3
        .scaleLinear()
        .domain([min, max])
        .range([config.hexRadius / 2, config.hexRadius]);
    }

    return null;
  }, [colsStatus, hexes, config.hexRadius]);

  const opacityScale = useMemo(() => {
    if (colsStatus === 'success') {
      const min = d3.min(hexes.map((h) => h.length));
      const max = d3.max(hexes.map((h) => h.length));

      return d3.scaleLinear().domain([min, max]).range([0.3, 1]);
    }

    return null;
  }, [colsStatus, hexes]);

  const colorScale = useMemo(() => {
    if (colsStatus !== 'success' || !currentColorColumn?.allValues) {
      return null;
    }

    const colorOptions = currentColorColumn.allValues.map((val) => val.val as string);

    return d3.scaleOrdinal<string, string>(d3.schemeCategory10).domain(Array.from(new Set<string>(colorOptions)));
  }, [colsStatus, currentColorColumn?.allValues]);

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

            const hexDivisor = singleHex.length / 6;

            let counter = 0;

            return Object.keys(catMap)
              .sort()
              .map((key) => {
                const currPath = cutHex(
                  d3Hexbin.hexagon(config.isSizeScale ? radiusScale(singleHex.length) : null),
                  config.isSizeScale ? radiusScale(singleHex.length) : config.hexRadius,
                  counter,
                  Math.ceil(catMap[key] / hexDivisor),
                );
                counter += Math.ceil(catMap[key] / hexDivisor);
                return (
                  <path
                    key={`${singleHex.x}, ${singleHex.y}, ${key}`}
                    d={currPath}
                    style={{
                      fill: `${colorScale ? colorScale(key) : '#69b3a2'}`,
                      transform: `translate(${singleHex.x}px, ${singleHex.y}px)`,
                      stroke: 'black',
                      strokeWidth: '0.2',
                      fillOpacity: config.isOpacityScale ? opacityScale(singleHex.length) : '1',
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
        <Legend
          categories={colorScale ? colorScale.domain() : []}
          filteredCategories={colorScale ? filteredCategories : []}
          colorScale={colorScale || null}
          onClick={(s) =>
            filteredCategories.includes(s)
              ? setFilteredCategories(filteredCategories.filter((f) => f !== s))
              : setFilteredCategories([...filteredCategories, s])
          }
        />
      </div>
    </div>
  );
}
