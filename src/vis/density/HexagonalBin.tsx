import { selection } from 'd3';
import * as hex from 'd3-hexbin';
import * as d3 from 'd3v7';
import { D3BrushEvent } from 'd3v7';
import { uniqueId } from 'lodash';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { VisColumn, IDensityConfig } from '../interfaces';
import { PieChart } from './PieChart';
import { SingleHex } from './SingleHex';
import { cutHex, getHexData } from './utils';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';

interface HexagonalBinProps {
  config: IDensityConfig;
  columns: VisColumn[];
  selectionCallback?: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
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

export function HexagonalBin({ config, columns, selectionCallback = () => null, selected = {} }: HexagonalBinProps) {
  const ref = useRef(null);
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [xZoomedScaleDomain, setXZoomedScaleDomain] = useState(null);
  const [yZoomedScaleDomain, setYZoomedScaleDomain] = useState(null);
  const [xZoomTransform, setXZoomTransform] = useState(0);
  const [yZoomTransform, setYZoomTransform] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);

  const { value: allColumns, status: colsStatus, error: colsError } = useAsync(getHexData, [columns, config.numColumnsSelected, config.color]);

  const id = React.useMemo(() => uniqueId('HexPlot'), []);

  // getting current categorical column values, original and filtered
  const currentColorColumn = useMemo(() => {
    if (colsStatus === 'success' && config.color && allColumns.colorColVals) {
      return {
        allValues: allColumns.colorColVals.resolvedValues,
        filteredValues: allColumns.colorColVals.resolvedValues.filter((val) => !filteredCategories.includes(val.val as string)),
      };
    }

    return null;
  }, [allColumns?.colorColVals, config.color, colsStatus, filteredCategories]);

  // getting currentX data values, both original and filtered.
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

  // getting currentY data values, both original and filtered.
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

  // resize observer for setting size of the svg and updating on size change
  useEffect(() => {
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      setHeight(entries[0].contentRect.height - margin.top - margin.bottom);
      setWidth(entries[0].contentRect.width - margin.left - margin.right);
    });

    if (ref) {
      ro.observe(ref.current);
    }
  }, []);

  // create x scale
  const xScale = useMemo(() => {
    if (currentX?.allValues) {
      const min = d3.min<number>(currentX.allValues.map((c) => c.val as number));
      const max = d3.max<number>(currentX.allValues.map((c) => c.val as number));

      return d3.scaleLinear().domain([min, max]).range([0, width]);
    }

    return null;
  }, [currentX?.allValues, width]);

  // create y scale
  const yScale = useMemo(() => {
    if (currentY?.allValues) {
      const min = d3.min<number>(currentY.allValues.map((c) => c.val as number));
      const max = d3.max<number>(currentY.allValues.map((c) => c.val as number));

      return d3.scaleLinear().domain([min, max]).range([height, 0]);
    }

    return null;
  }, [currentY?.allValues, height]);

  // creating d3 hexbin object to do hex math for me
  const d3Hexbin = useMemo(() => {
    return hex
      .hexbin()
      .radius(config.hexRadius)
      .extent([
        [0, 0],
        [width, height],
      ]);
  }, [config.hexRadius, height, width]);

  // generating the actual hexes
  const hexes = useMemo(() => {
    const inputForHexbin = [];

    if (currentX && currentY) {
      currentX.filteredValues.forEach((c, i) => {
        inputForHexbin.push([
          xScale(c.val as number),
          yScale(currentY.filteredValues[i].val as number),
          currentColorColumn ? currentColorColumn.filteredValues[i].val : '',
          c.id,
        ]);
      });
    }

    return d3Hexbin(inputForHexbin);
  }, [currentColorColumn, currentX, d3Hexbin, xScale, yScale, currentY]);

  // simple radius scale for the hexes
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

  // simple opacity scale for the hexes
  const opacityScale = useMemo(() => {
    if (colsStatus === 'success') {
      const min = d3.min(hexes.map((h) => h.length));
      const max = d3.max(hexes.map((h) => h.length));

      return d3.scaleLinear().domain([min, max]).range([0.1, 1]);
    }

    return null;
  }, [colsStatus, hexes]);

  // Create a default color scale
  const colorScale = useMemo(() => {
    if (colsStatus !== 'success' || !currentColorColumn?.allValues) {
      return null;
    }

    const colorOptions = currentColorColumn.allValues.map((val) => val.val as string);

    return d3.scaleOrdinal<string, string>(d3.schemeCategory10).domain(Array.from(new Set<string>(colorOptions)));
  }, [colsStatus, currentColorColumn?.allValues]);

  // memoize the actual hexes since they do not need to change on zoom/drag
  const hexObjects = React.useMemo(() => {
    return (
      <>
        {hexes.map((singleHex) => {
          return (
            <SingleHex
              key={`${singleHex.x}, ${singleHex.y}`}
              selected={selected}
              hexbinOption={config.hexbinOptions}
              hexData={singleHex}
              d3Hexbin={d3Hexbin}
              isSizeScale={config.isSizeScale}
              radiusScale={radiusScale}
              isOpacityScale={config.isOpacityScale}
              opacityScale={opacityScale}
              hexRadius={config.hexRadius}
              colorScale={colorScale}
            />
          );
        })}
      </>
    );
  }, [colorScale, config.hexRadius, config.isOpacityScale, config.isSizeScale, d3Hexbin, hexes, opacityScale, radiusScale, selected, config.hexbinOptions]);

  // apply zoom/panning
  useEffect(() => {
    if (!xScale || !yScale) {
      return;
    }

    const zoom = d3.zoom().on('zoom', (event) => {
      const { transform } = event;

      setZoomScale(transform.k);
      setXZoomTransform(transform.x);
      setYZoomTransform(transform.y);

      const newX = transform.rescaleX(xScale);
      const newY = transform.rescaleY(yScale);

      setXZoomedScaleDomain(newX.domain());
      setYZoomedScaleDomain(newY.domain());
    });

    d3.select(`#${id}`).call(d3.zoom().on('zoom', null));
    d3.select(`#${id}`).call(zoom);
  }, [id, xScale, yScale, zoomScale, xZoomTransform, yZoomTransform, height, width]);

  // apply brushing
  // useEffect(() => {
  //   const brush = d3.brush().extent([
  //     [margin.left, margin.top],
  //     [margin.left + width, margin.top + height],
  //   ]);

  //   d3.select(`#${id}brush`).call(
  //     brush.on('end', function (event) {
  //       if (!event.sourceEvent) return;
  //       if (!event.selection) {
  //         selectionCallback([]);
  //       }
  //       const selectedHexes = hexes.filter(
  //         (currHex) =>
  //           currHex.x >= event.selection[0][0] - margin.left &&
  //           currHex.x <= event.selection[1][0] - margin.left &&
  //           currHex.y >= event.selection[0][1] - margin.top &&
  //           currHex.y <= event.selection[1][1] - margin.top,
  //       );

  //       const allSelectedPoints = selectedHexes.map((currHex) => currHex.map((points) => points[3])).flat();

  //       selectionCallback(allSelectedPoints);

  //       console.log(event, this);
  //       d3.select(this).call(brush.move, null);
  //     }),
  //   );
  // }, [width, height, id, hexes, selectionCallback]);

  return (
    <div ref={ref} className="mw-100">
      <svg id={id} style={{ width: width + margin.left + margin.right, height: height + margin.top + margin.bottom }}>
        <defs>
          <clipPath id="clip">
            <rect style={{ transform: `translate(${margin.left}px, ${margin.top}px)` }} width={width} height={height} />
          </clipPath>
        </defs>
        <g clipPath="url(#clip)">
          <g id={`${id}brush`} style={{ transform: `translate(${xZoomTransform}px, ${yZoomTransform}px) scale(${zoomScale})` }}>
            <g style={{ transform: `translate(${margin.left}px, ${margin.top}px)` }}>{hexObjects}</g>
          </g>
        </g>
        <XAxis
          vertPosition={height + margin.top}
          yRange={[margin.top, height + margin.top]}
          domain={xZoomedScaleDomain || xScale?.domain()}
          range={[margin.left, width + margin.left]}
        />
        <YAxis
          horizontalPosition={margin.left}
          xRange={[margin.left, width + margin.left]}
          domain={yZoomedScaleDomain || yScale?.domain()}
          range={[margin.top, height + margin.top]}
        />
        <text
          style={{
            dominantBaseline: 'middle',
            textAnchor: 'middle',
            transform: `translate(${margin.left + width / 2}px, ${margin.top + height + 30}px)`,
          }}
        >
         {config.numColumnsSelected[0]?.name}
        </text>
        <text
          style={{
            dominantBaseline: 'middle',
            textAnchor: 'middle',
            transform: `translate(10px, ${margin.top + height / 2}px) rotate(-90deg)`,
          }}
        >
         {config.numColumnsSelected[1]?.name}
        </text>
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
