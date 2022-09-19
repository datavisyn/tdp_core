import { Container, Stack, Chip, Tooltip, Box } from '@mantine/core';
import * as hex from 'd3-hexbin';
import * as d3v7 from 'd3v7';
import { uniqueId } from 'lodash';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { EScatterSelectSettings } from '../interfaces';
import { SingleHex } from './SingleHex';
import { getHexData } from './utils';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
function Legend({ categories, filteredCategories, colorScale, onClick, }) {
    return (React.createElement(Stack, { sx: { width: '80px' }, spacing: 10 }, categories.map((c) => {
        return (React.createElement(Tooltip, { withinPortal: true, key: c, label: c, withArrow: true, arrowSize: 6 },
            React.createElement(Box, null,
                React.createElement(Chip, { variant: "filled", onClick: () => onClick(c), checked: false, styles: {
                        label: {
                            width: '100%',
                            backgroundColor: filteredCategories.includes(c) ? 'lightgrey' : `${colorScale(c)} !important`,
                            textAlign: 'center',
                            paddingLeft: '10px',
                            paddingRight: '10px',
                            overflow: 'hidden',
                            color: filteredCategories.includes(c) ? 'black' : 'white',
                            textOverflow: 'ellipsis',
                        },
                    } }, c))));
    })));
}
export function Hexplot({ config, columns, selectionCallback = () => null, selected = {} }) {
    const ref = useRef(null);
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const xZoomedScale = useRef(null);
    const yZoomedScale = useRef(null);
    const [xZoomTransform, setXZoomTransform] = useState(0);
    const [yZoomTransform, setYZoomTransform] = useState(0);
    const [xRescaleFunc, setXRescaleFunc] = useState(null);
    const [yRescaleFunc, setYRescaleFunc] = useState(null);
    const [zoomScale, setZoomScale] = useState(1);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const { value: allColumns, status: colsStatus, error: colsError } = useAsync(getHexData, [columns, config.numColumnsSelected, config.color]);
    const id = React.useMemo(() => uniqueId('HexPlot'), []);
    // getting current categorical column values, original and filtered
    const currentColorColumn = useMemo(() => {
        if (colsStatus === 'success' && config.color && allColumns.colorColVals) {
            return {
                allValues: allColumns.colorColVals.resolvedValues,
                filteredValues: allColumns.colorColVals.resolvedValues.filter((val) => !filteredCategories.includes(val.val)),
            };
        }
        return null;
    }, [allColumns?.colorColVals, config.color, colsStatus, filteredCategories]);
    const margin = useMemo(() => {
        return {
            left: 52,
            right: config.color ? 80 : 25,
            top: 25,
            bottom: 53,
        };
    }, [config.color]);
    // getting currentX data values, both original and filtered.
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
    // getting currentY data values, both original and filtered.
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
    // resize observer for setting size of the svg and updating on size change
    useEffect(() => {
        const ro = new ResizeObserver((entries) => {
            setHeight(entries[0].contentRect.height - margin.top - margin.bottom);
            setWidth(entries[0].contentRect.width - margin.left - margin.right);
        });
        if (ref) {
            ro.observe(ref.current);
        }
        return () => {
            ro.disconnect();
        };
    }, [margin]);
    // create x scale
    const xScale = useMemo(() => {
        if (currentX?.allValues) {
            const min = d3v7.min(currentX.allValues.map((c) => c.val));
            const max = d3v7.max(currentX.allValues.map((c) => c.val));
            const newScale = d3v7
                .scaleLinear()
                .domain([min - min / 20, max + max / 20])
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
            const min = d3v7.min(currentY.allValues.map((c) => c.val));
            const max = d3v7.max(currentY.allValues.map((c) => c.val));
            const newScale = d3v7
                .scaleLinear()
                .domain([min - min / 20, max + max / 20])
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
    const hexes = useMemo(() => {
        const inputForHexbin = [];
        if (currentX && currentY) {
            currentX.filteredValues.forEach((c, i) => {
                inputForHexbin.push([
                    xScale(c.val),
                    yScale(currentY.filteredValues[i].val),
                    currentColorColumn ? currentColorColumn.filteredValues[i].val : '',
                    c.id,
                ]);
            });
        }
        // TODO: Im cheating a bit here by appending the id/color value to each hex, breaking the types.
        // is there a better way to type this?
        return d3Hexbin(inputForHexbin);
    }, [currentColorColumn, currentX, d3Hexbin, xScale, yScale, currentY]);
    // simple radius scale for the hexes
    const radiusScale = useMemo(() => {
        if (colsStatus === 'success') {
            const min = d3v7.min(hexes.map((h) => h.length));
            const max = d3v7.max(hexes.map((h) => h.length));
            return d3v7
                .scaleLinear()
                .domain([min, max])
                .range([config.hexRadius / 2, config.hexRadius]);
        }
        return null;
    }, [colsStatus, hexes, config.hexRadius]);
    // simple opacity scale for the hexes
    const opacityScale = useMemo(() => {
        if (colsStatus === 'success') {
            const min = d3v7.min(hexes.map((h) => h.length));
            const max = d3v7.max(hexes.map((h) => h.length));
            return d3v7.scaleLinear().domain([min, max]).range([0.1, 1]);
        }
        return null;
    }, [colsStatus, hexes]);
    // Create a default color scale
    const colorScale = useMemo(() => {
        if (colsStatus !== 'success' || !currentColorColumn?.allValues) {
            return null;
        }
        const colorOptions = currentColorColumn.allValues.map((val) => val.val);
        return d3v7.scaleOrdinal(d3v7.schemeCategory10).domain(Array.from(new Set(colorOptions)));
    }, [colsStatus, currentColorColumn?.allValues]);
    // memoize the actual hexes since they do not need to change on zoom/drag
    const hexObjects = React.useMemo(() => {
        return (React.createElement(React.Fragment, null, hexes.map((singleHex) => {
            return (React.createElement(SingleHex, { key: `${singleHex.x}, ${singleHex.y}`, selected: selected, hexbinOption: config.hexbinOptions, hexData: singleHex, d3Hexbin: d3Hexbin, isSizeScale: config.isSizeScale, radiusScale: radiusScale, isOpacityScale: config.isOpacityScale, opacityScale: opacityScale, hexRadius: config.hexRadius, colorScale: colorScale, isCategorySelected: !!config.color }));
        })));
    }, [
        colorScale,
        config.hexRadius,
        config.isOpacityScale,
        config.isSizeScale,
        d3Hexbin,
        hexes,
        opacityScale,
        radiusScale,
        selected,
        config.hexbinOptions,
        config.color,
    ]);
    // // apply zoom/panning
    useEffect(() => {
        const zoom = d3v7.zoom();
        if (!xScale || !yScale || config.dragMode === EScatterSelectSettings.RECTANGLE) {
            return;
        }
        zoom.on('zoom', (event) => {
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
        d3v7.select(`#${id}zoom`).call(zoom);
    }, [id, xScale, yScale, height, width, config.dragMode]);
    // apply brushing
    useEffect(() => {
        if (config.dragMode !== EScatterSelectSettings.RECTANGLE) {
            d3v7.select(`#${id}brush`).selectAll('rect').remove();
            return;
        }
        const brush = d3v7.brush().extent([
            [margin.left, margin.top],
            [margin.left + width, margin.top + height],
        ]);
        // it does look like we are creating a ton of brush events without cleaning them up right here.
        // But d3v7.call will remove the previous brush event when called, so this actually works as expected.
        d3v7.select(`#${id}brush`).call(
        // this is a real function and not a => so that I can use d3v7.select(this) inside to clear the brush
        brush.on('end', function (event) {
            if (!event.sourceEvent)
                return;
            if (!event.selection) {
                selectionCallback([]);
                return;
            }
            // To figure out if brushing is finding hexes after changing the axis via pan/zoom, need to do this.
            // Invert your "zoomed" scale to find the actual scaled values inside of your svg coords. Use the original scale to find the values.
            const startX = xZoomedScale.current ? xScale(xZoomedScale.current.invert(event.selection[0][0])) : event.selection[0][0];
            const startY = yZoomedScale.current ? yScale(yZoomedScale.current.invert(event.selection[0][1])) : event.selection[0][1];
            const endX = xZoomedScale.current ? xScale(xZoomedScale.current.invert(event.selection[1][0])) : event.selection[1][0];
            const endY = yZoomedScale.current ? yScale(yZoomedScale.current.invert(event.selection[1][1])) : event.selection[1][1];
            // to find the selected hexes
            const selectedHexes = hexes.filter((currHex) => xZoomedScale.current
                ? currHex.x >= startX && currHex.x <= endX && currHex.y >= startY && currHex.y <= endY
                : currHex.x >= event.selection[0][0] &&
                    currHex.x <= event.selection[1][0] &&
                    currHex.y >= event.selection[0][1] &&
                    currHex.y <= event.selection[1][1]);
            const allSelectedPoints = selectedHexes.map((currHex) => currHex.map((points) => points[3])).flat();
            selectionCallback(allSelectedPoints);
            d3v7.select(this).call(brush.move, null);
        }));
    }, [width, height, id, hexes, selectionCallback, config.dragMode, xZoomTransform, yZoomTransform, zoomScale, xScale, yScale, margin]);
    // TODO: svg elements seem weird with style/classNames. I can directly put on a transform to a g, for example, but it seems to work
    // differently than if i use style to do so
    return (React.createElement(Container, { ref: ref, fluid: true, sx: { width: '100%' } },
        React.createElement("svg", { className: "hexbinSvg", id: id, width: width + margin.left + margin.right, height: height + margin.top + margin.bottom },
            React.createElement("defs", null,
                React.createElement("clipPath", { id: "clip" },
                    React.createElement("rect", { style: { transform: `translate(${margin.left}px, ${margin.top}px)` }, width: width, height: height }))),
            React.createElement("g", { clipPath: "url(#clip)" },
                React.createElement("g", { id: `${id}brush` },
                    React.createElement("g", { style: { transform: `translate(${xZoomTransform}px, ${yZoomTransform}px) scale(${zoomScale})` } },
                        React.createElement("g", null, hexObjects)))),
            xScale ? React.createElement(XAxis, { vertPosition: height + margin.top, yRange: [margin.top, height + margin.top], xScale: xZoomedScale.current || xScale }) : null,
            yScale ? React.createElement(YAxis, { horizontalPosition: margin.left, xRange: [margin.left, width + margin.left], yScale: yZoomedScale.current || yScale }) : null,
            React.createElement("text", { dominantBaseline: "middle", textAnchor: "middle", style: {
                    transform: `translate(${margin.left + width / 2}px, ${margin.top + height + 30}px)`,
                } }, config.numColumnsSelected[0]?.name),
            React.createElement("text", { dominantBaseline: "middle", textAnchor: "middle", style: {
                    transform: `translate(10px, ${margin.top + height / 2}px) rotate(-90deg)`,
                } }, config.numColumnsSelected[1]?.name),
            React.createElement("rect", { id: `${id}zoom`, width: width, height: height, opacity: 0, pointerEvents: config.dragMode === EScatterSelectSettings.PAN ? 'auto' : 'none' })),
        React.createElement("div", { className: "position-absolute", style: { right: 0, top: margin.top + 60 } },
            React.createElement(Legend, { categories: colorScale ? colorScale.domain() : [], filteredCategories: colorScale ? filteredCategories : [], colorScale: colorScale || null, onClick: (s) => filteredCategories.includes(s)
                    ? setFilteredCategories(filteredCategories.filter((f) => f !== s))
                    : setFilteredCategories([...filteredCategories, s]) }))));
}
//# sourceMappingURL=Hexplot.js.map