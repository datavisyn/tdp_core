import * as hex from 'd3-hexbin';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { cutHex, getHexData } from './utils';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
const margin = {
    left: 50,
    right: 50,
    top: 50,
    bottom: 50,
};
function Legend({ categories, colorScale, onClick }) {
    return React.createElement("div", null, "Hello World");
}
export function HexagonalBin({ config, columns }) {
    const ref = useRef(null);
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const { value: allColumns, status: colsStatus, error: colsError } = useAsync(getHexData, [columns, config]);
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
        if (colsStatus === 'success') {
            const min = d3.min(allColumns.numColVals[0].resolvedValues.map((c) => c.val));
            const max = d3.max(allColumns.numColVals[0].resolvedValues.map((c) => c.val));
            return d3.scaleLinear().domain([min, max]).range([0, width]);
        }
        return null;
    }, [colsStatus, allColumns === null || allColumns === void 0 ? void 0 : allColumns.numColVals, width]);
    const yScale = useMemo(() => {
        if (colsStatus === 'success') {
            const min = d3.min(allColumns.numColVals[1].resolvedValues.map((c) => c.val));
            const max = d3.max(allColumns.numColVals[1].resolvedValues.map((c) => c.val));
            return d3.scaleLinear().domain([min, max]).range([height, 0]);
        }
        return null;
    }, [colsStatus, allColumns === null || allColumns === void 0 ? void 0 : allColumns.numColVals, height]);
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
                xScale(c.val),
                yScale(allColumns.numColVals[1].resolvedValues[i].val),
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
        .scaleLinear()
        .domain([0, d3.max(hexes.map((h) => h.length))])
        .range(['transparent', '#69b3a2']);
    const colorScale = useMemo(() => {
        if (colsStatus !== 'success' || !allColumns.colorColVals) {
            return null;
        }
        const colorOptions = allColumns.colorColVals.resolvedValues.map((val) => val.val);
        return d3.scaleOrdinal(d3.schemeCategory10).domain(Array.from(new Set(colorOptions)));
    }, [colsStatus, allColumns === null || allColumns === void 0 ? void 0 : allColumns.colorColVals]);
    d3.scaleOrdinal().domain(Array.from(new Set())).range(['transparent', '#69b3a2']);
    return (React.createElement("div", { ref: ref, className: "mw-100" },
        React.createElement("svg", { style: { width: width + margin.left + margin.right, height: height + margin.top + margin.bottom } },
            React.createElement("clipPath", { id: "clip" },
                React.createElement("rect", { transform: `translate(${margin.left}px, ${margin.top}px)`, width: width, height: height })),
            React.createElement("g", { clipPath: "url(#clip)", style: { transform: `translate(${margin.left}px, ${margin.top}px)` } }, hexes.map((singleHex) => {
                const catMap = {};
                singleHex.forEach((point) => {
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
                    return (React.createElement("path", { key: `${singleHex.x}, ${singleHex.y}, ${key}`, d: currPath, style: {
                            fill: `${colorScale ? colorScale(key) : baseColorScale(singleHex.length)}`,
                            transform: `translate(${singleHex.x}px, ${singleHex.y}px)`,
                            stroke: 'black',
                            strokeWidth: '0.2',
                        } }));
                });
            })),
            React.createElement(XAxis, { vertPosition: height + margin.top, domain: xScale === null || xScale === void 0 ? void 0 : xScale.domain(), range: [margin.left, width + margin.left] }),
            React.createElement(YAxis, { horizontalPosition: margin.left, domain: yScale === null || yScale === void 0 ? void 0 : yScale.domain(), range: [margin.top, height + margin.top] })),
        React.createElement("div", { className: "position-absolute", style: { left: margin.left + width, top: margin.top } },
            React.createElement(Legend, null))));
}
//# sourceMappingURL=HexagonalBin.js.map