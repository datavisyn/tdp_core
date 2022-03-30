import * as hex from 'd3-hexbin';
import { HexbinBin } from 'd3-hexbin';
import * as d3 from 'd3v7';
import { D3ZoomEvent } from 'd3v7';
import { uniqueId } from 'lodash';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { VisColumn, IDensityConfig, EScatterSelectSettings } from '../interfaces';
import { SingleHex } from './SingleHex';
import { getHexData } from './utils';
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
  const xZoomedScale = useRef<d3.ScaleLinear<number, number, never>>(null);
  const yZoomedScale = useRef<d3.ScaleLinear<number, number, never>>(null);
  const [xZoomTransform, setXZoomTransform] = useState(0);
  const [yZoomTransform, setYZoomTransform] = useState(0);
  const [xRescaleFunc, setXRescaleFunc] = useState<any>(null);
  const [yRescaleFunc, setYRescaleFunc] = useState<any>(null);
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
      console.log('setting sizes');
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

      const newScale = d3
        .scaleLinear()
        .domain([min, max])
        .range([margin.left, margin.left + width]);

      if (xRescaleFunc) {
        xZoomedScale.current = xRescaleFunc(newScale);
      }

      return newScale;
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentX?.allValues, width]);

  // create y scale
  const yScale = useMemo(() => {
    if (currentY?.allValues) {
      const min = d3.min<number>(currentY.allValues.map((c) => c.val as number));
      const max = d3.max<number>(currentY.allValues.map((c) => c.val as number));

      const newScale = d3
        .scaleLinear()
        .domain([min, max])
        .range([margin.top + height, margin.top]);

      if (yRescaleFunc) {
        yZoomedScale.current = yRescaleFunc(newScale);
      }

      return newScale;
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const hexes: HexbinBin<[number, number, string, string]>[] = useMemo(() => {
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

    // TODO: Im cheating a bit here by appending the id/color value to each hex, breaking the types.
    // is there a better way to type this?
    return d3Hexbin(inputForHexbin) as unknown as HexbinBin<[number, number, string, string]>[];
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

  // // apply zoom/panning
  useEffect(() => {
    const zoom = d3.zoom();

    if (!xScale || !yScale || config.dragMode === EScatterSelectSettings.RECTANGLE) {
      return;
    }

    zoom.on('zoom', (event: D3ZoomEvent<any, any>) => {
      const { transform } = event;

      const newX = transform.rescaleX(xScale);
      const newY = transform.rescaleY(yScale);

      // Question: I dont think this should be a ref, because it doesnt actually cause a re render. Only the other setters below make it work, if i moved them above this code there would be bugs.
      // But when I made it a useState object it didnt work with the object.
      xZoomedScale.current = newX;
      yZoomedScale.current = newY;

      setXRescaleFunc(() => (x) => transform.rescaleX(x));
      setYRescaleFunc(() => (y) => transform.rescaleY(y));

      setZoomScale(transform.k);
      setXZoomTransform(transform.x);
      setYZoomTransform(transform.y);
    });

    d3.select(`#${id}zoom`).call(zoom);
  }, [id, xScale, yScale, height, width, config.dragMode]);

  // // apply brushing
  useEffect(() => {
    if (config.dragMode !== EScatterSelectSettings.RECTANGLE) {
      d3.select(`#${id}brush`).selectAll('rect').remove();
      return;
    }

    const brush = d3.brush().extent([
      [margin.left, margin.top],
      [margin.left + width, margin.top + height],
    ]);
    // it does look like we are creating a ton of brush events without cleaning them up right here.
    // But d3.call will remove the previous brush event when called, so this actually works as expected.
    d3.select(`#${id}brush`).call(
      brush.on('end', (event) => {
        if (!event.sourceEvent) return;
        if (!event.selection) {
          selectionCallback([]);
          return;
        }

        // To figure out if brushing is finding hexes after changing the axis via pan/zoom, need to do this.
        // Invert your "zoomed" scale to find the actual scaled values inside of your svg coords. Use the original scale to find the values.
        const startX = xScale(xZoomedScale.current.invert(event.selection[0][0]));
        const startY = xScale(xZoomedScale.current.invert(event.selection[0][1]));
        const endX = xScale(xZoomedScale.current.invert(event.selection[1][0]));
        const endY = xScale(xZoomedScale.current.invert(event.selection[1][1]));

        // to find the selected hexes
        const selectedHexes = hexes.filter((currHex) =>
          xZoomedScale.current
            ? currHex.x >= startX && currHex.x <= endX && currHex.y >= startY && currHex.y <= endY
            : currHex.x >= event.selection[0][0] &&
              currHex.x <= event.selection[1][0] &&
              currHex.y >= event.selection[0][1] &&
              currHex.y <= event.selection[1][1],
        );

        const allSelectedPoints = selectedHexes.map((currHex) => currHex.map((points) => points[3])).flat();

        selectionCallback(allSelectedPoints);

        d3.select(this).call(brush.move, null);
      }),
    );
  }, [width, height, id, hexes, selectionCallback, config.dragMode, xZoomTransform, yZoomTransform, zoomScale, xScale, yScale]);

  // TODO: svg elements seem weird with style/classNames. I can directly put on a transform to a g, for example, but it seems to work
  // differently than if i use style to do so
  return (
    <div ref={ref} className="mw-100">
      <svg id={id} style={{ width: width + margin.left + margin.right, height: height + margin.top + margin.bottom }}>
        <defs>
          <clipPath id="clip">
            <rect style={{ transform: `translate(${margin.left}px, ${margin.top}px)` }} width={width} height={height} />
          </clipPath>
        </defs>
        <g clipPath="url(#clip)">
          <g id={`${id}brush`}>
            <g style={{ transform: `translate(${xZoomTransform}px, ${yZoomTransform}px) scale(${zoomScale})` }}>
              <g>{hexObjects}</g>
            </g>
          </g>
        </g>
        {xScale ? <XAxis vertPosition={height + margin.top} yRange={[margin.top, height + margin.top]} xScale={xZoomedScale.current || xScale} /> : null}
        {yScale ? <YAxis horizontalPosition={margin.left} xRange={[margin.left, width + margin.left]} yScale={yZoomedScale.current || yScale} /> : null}

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
        <rect id={`${id}zoom`} style={{ width, height, opacity: 0, pointerEvents: config.dragMode === EScatterSelectSettings.PAN ? 'auto' : 'none' }} />
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