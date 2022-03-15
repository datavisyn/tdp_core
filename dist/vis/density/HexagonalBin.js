import * as hex from 'd3-hexbin';
import * as d3 from 'd3v7';
import { uniqueId } from 'lodash';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { PieChart } from './PieChart';
import { cutHex, getHexData } from './utils';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
const margin = {
    left: 50,
    right: 100,
    top: 50,
    bottom: 50,
};
function Legend({ categories, filteredCategories, colorScale, onClick, }) {
    return (React.createElement("div", { className: "ms-2 d-flex flex-column" }, categories.map((c) => {
        return (React.createElement("div", { className: `p-1 mt-2 d-flex align-items-center ${filteredCategories.includes(c) ? '' : 'bg-light'} cursor-pointer`, style: { borderRadius: 10 }, key: c, onClick: () => onClick(c) },
            React.createElement("div", { style: { borderRadius: 100, width: '10px', height: '10px', backgroundColor: colorScale(c) } }),
            React.createElement("div", { className: "ms-1" }, c)));
    })));
}
export function HexagonalBin({ config, columns }) {
    const ref = useRef(null);
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const [xZoomedScaleDomain, setXZoomedScaleDomain] = useState(null);
    const [yZoomedScaleDomain, setYZoomedScaleDomain] = useState(null);
    const [xZoomTransform, setXZoomTransform] = useState(0);
    const [yZoomTransform, setYZoomTransform] = useState(0);
    const [zoomScale, setZoomScale] = useState(1);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const { value: allColumns, status: colsStatus, error: colsError } = useAsync(getHexData, [columns, config.numColumnsSelected, config.color]);
    const id = React.useMemo(() => uniqueId('HexPlot'), []);
    const currentColorColumn = useMemo(() => {
        if (colsStatus === 'success' && config.color && allColumns.colorColVals) {
            return {
                allValues: allColumns.colorColVals.resolvedValues,
                filteredValues: allColumns.colorColVals.resolvedValues.filter((val) => !filteredCategories.includes(val.val)),
            };
        }
        return null;
    }, [allColumns === null || allColumns === void 0 ? void 0 : allColumns.colorColVals, config.color, colsStatus, filteredCategories]);
    const currentX = useMemo(() => {
        if (colsStatus === 'success' && allColumns) {
            if (config.color && allColumns.colorColVals) {
                return {
                    allValues: allColumns.numColVals[0].resolvedValues,
                    filteredValues: allColumns.numColVals[0].resolvedValues.filter((val, i) => {
                        return !filteredCategories.includes(allColumns.colorColVals.resolvedValues[i].val);
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
                        return !filteredCategories.includes(allColumns.colorColVals.resolvedValues[i].val);
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
        const ro = new ResizeObserver((entries) => {
            setHeight(entries[0].contentRect.height - margin.top - margin.bottom);
            setWidth(entries[0].contentRect.width - margin.left - margin.right);
        });
        if (ref) {
            ro.observe(ref.current);
        }
    }, []);
    const xScale = useMemo(() => {
        if (currentX === null || currentX === void 0 ? void 0 : currentX.allValues) {
            const min = d3.min(currentX.allValues.map((c) => c.val));
            const max = d3.max(currentX.allValues.map((c) => c.val));
            return d3.scaleLinear().domain([min, max]).range([0, width]);
        }
        return null;
    }, [currentX === null || currentX === void 0 ? void 0 : currentX.allValues, width]);
    const yScale = useMemo(() => {
        if (currentY === null || currentY === void 0 ? void 0 : currentY.allValues) {
            const min = d3.min(currentY.allValues.map((c) => c.val));
            const max = d3.max(currentY.allValues.map((c) => c.val));
            return d3.scaleLinear().domain([min, max]).range([height, 0]);
        }
        return null;
    }, [currentY === null || currentY === void 0 ? void 0 : currentY.allValues, height]);
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
                xScale(c.val),
                yScale(currentY.filteredValues[i].val),
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
        if (colsStatus !== 'success' || !(currentColorColumn === null || currentColorColumn === void 0 ? void 0 : currentColorColumn.allValues)) {
            return null;
        }
        const colorOptions = currentColorColumn.allValues.map((val) => val.val);
        return d3.scaleOrdinal(d3.schemeCategory10).domain(Array.from(new Set(colorOptions)));
    }, [colsStatus, currentColorColumn === null || currentColorColumn === void 0 ? void 0 : currentColorColumn.allValues]);
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
    }, [id, xScale, yScale, zoomScale, xZoomTransform, yZoomTransform]);
    return (React.createElement("div", { ref: ref, className: "mw-100" },
        React.createElement("svg", { id: id, style: { width: width + margin.left + margin.right, height: height + margin.top + margin.bottom } },
            React.createElement("defs", null,
                React.createElement("clipPath", { id: "clip" },
                    React.createElement("rect", { style: { transform: `translate(${margin.left}px, ${margin.top}px)` }, x: xZoomedScaleDomain ? -xZoomedScaleDomain[0] : 0, y: yZoomedScaleDomain ? -yZoomedScaleDomain[0] : 0, width: width, height: height }))),
            React.createElement("g", { clipPath: "url(#clip)", style: { transform: `translate(${xZoomTransform}px, ${yZoomTransform}px) scale(${zoomScale})` } },
                React.createElement("g", { style: { transform: `translate(${margin.left}px, ${margin.top}px)` } }, hexes.map((singleHex) => {
                    const catMap = {};
                    singleHex.forEach((point) => {
                        catMap[point[2]] = catMap[point[2]] ? catMap[point[2]] + 1 : 1;
                    });
                    const hexDivisor = singleHex.length / 6;
                    let counter = 0;
                    return Object.keys(catMap)
                        .sort()
                        .map((key) => {
                        const currPath = cutHex(d3Hexbin.hexagon(config.isSizeScale ? radiusScale(singleHex.length) : null), config.isSizeScale ? radiusScale(singleHex.length) : config.hexRadius, counter, Math.ceil(catMap[key] / hexDivisor));
                        counter += Math.ceil(catMap[key] / hexDivisor);
                        return (React.createElement(React.Fragment, null,
                            React.createElement("path", { key: `${singleHex.x}, ${singleHex.y}, ${key}`, d: currPath, style: {
                                    // fill: `${colorScale ? colorScale(key) : '#69b3a2'}`,
                                    transform: `translate(${singleHex.x}px, ${singleHex.y}px)`,
                                    stroke: 'white',
                                    strokeWidth: '0.2',
                                    fillOpacity: config.isOpacityScale ? opacityScale(singleHex.length) : '1',
                                } }),
                            React.createElement(PieChart, { data: Object.values(catMap), dataCategories: Object.keys(catMap), radius: config.isSizeScale ? radiusScale(singleHex.length) / 2 : config.hexRadius / 2, transform: `translate(${singleHex.x}px, ${singleHex.y}px)`, colorScale: colorScale })));
                    });
                }))),
            React.createElement(XAxis, { vertPosition: height + margin.top, domain: xZoomedScaleDomain || (xScale === null || xScale === void 0 ? void 0 : xScale.domain()), range: [margin.left, width + margin.left] }),
            React.createElement(YAxis, { horizontalPosition: margin.left, domain: yZoomedScaleDomain || (yScale === null || yScale === void 0 ? void 0 : yScale.domain()), range: [margin.top, height + margin.top] })),
        React.createElement("div", { className: "position-absolute", style: { left: margin.left + width, top: margin.top } },
            React.createElement(Legend, { categories: colorScale ? colorScale.domain() : [], filteredCategories: colorScale ? filteredCategories : [], colorScale: colorScale || null, onClick: (s) => filteredCategories.includes(s)
                    ? setFilteredCategories(filteredCategories.filter((f) => f !== s))
                    : setFilteredCategories([...filteredCategories, s]) }))));
}
//# sourceMappingURL=HexagonalBin.js.map