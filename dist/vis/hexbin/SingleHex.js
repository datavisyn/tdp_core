import * as React from 'react';
import { useMemo } from 'react';
import { Tooltip } from '@mantine/core';
import { PieChart } from './PieChart';
import { cutHex } from './utils';
import { EHexbinOptions } from '../interfaces';
export function SingleHex({ hexbinOption, hexData, d3Hexbin, isSizeScale, radiusScale, isOpacityScale, opacityScale, hexRadius, colorScale, selected = {}, isCategorySelected, }) {
    const { catMap, catMapKeys, catMapVals } = useMemo(() => {
        const currMap = {};
        hexData.forEach((point) => {
            currMap[point[2]] = currMap[point[2]] ? currMap[point[2]] + 1 : 1;
        });
        return { catMap: currMap, catMapKeys: Object.keys(currMap), catMapVals: Object.values(currMap) };
    }, [hexData]);
    const isSelected = useMemo(() => {
        return hexData.find((point) => selected[point[3]] !== true) === undefined;
    }, [hexData, selected]);
    const topCategory = useMemo(() => {
        let highestVal = 0;
        let highestCategory = '';
        for (const i in catMap) {
            if (catMap[i] > highestVal) {
                highestVal = catMap[i];
                highestCategory = i;
            }
        }
        return highestCategory;
    }, [catMap]);
    const hexDivisor = hexData.length / 6;
    let counter = 0;
    return (React.createElement(Tooltip, { withinPortal: true, label: "Hello" },
        React.createElement("g", null,
            hexbinOption === EHexbinOptions.BINS && isCategorySelected
                ? catMapKeys.sort().map((key) => {
                    const currPath = cutHex(d3Hexbin.hexagon(isSizeScale ? radiusScale(hexData.length) : hexRadius), isSizeScale ? radiusScale(hexData.length) : hexRadius, counter, Math.ceil(catMap[key] / hexDivisor));
                    counter += Math.ceil(catMap[key] / hexDivisor);
                    return (React.createElement("path", { id: `${hexData.x},${hexData.y},${key}`, key: `${hexData.x},${hexData.y},${key}`, clipPath: `url(#${hexData.x}, ${hexData.y},${key})`, d: currPath, style: {
                            fill: `${colorScale ? colorScale(key) : 'black'}`,
                            clipPath: `url(#${hexData.x},${hexData.y})`,
                            transform: `translate(${hexData.x}px, ${hexData.y}px)`,
                            stroke: isSelected ? '#E29609' : 'white',
                            strokeWidth: isSelected ? 10 : 0,
                            fillOpacity: isOpacityScale ? opacityScale(hexData.length) : '1',
                        } }));
                })
                : null,
            hexbinOption === EHexbinOptions.COLOR || !isCategorySelected ? (React.createElement("path", { d: d3Hexbin.hexagon(isSizeScale ? radiusScale(hexData.length) : hexRadius), id: `${hexData.x},${hexData.y}`, key: `${hexData.x},${hexData.y}`, clipPath: `url(#${hexData.x},${hexData.y})`, style: {
                    fill: `${colorScale ? colorScale(topCategory) : 'black'}`,
                    clipPath: `url(#${hexData.x},${hexData.y})`,
                    transform: `translate(${hexData.x}px, ${hexData.y}px)`,
                    stroke: isSelected ? '#E29609' : 'white',
                    strokeWidth: isSelected ? 10 : 0,
                    fillOpacity: isOpacityScale ? opacityScale(hexData.length) : '1',
                } })) : null,
            hexbinOption === EHexbinOptions.PIE && isCategorySelected ? (React.createElement(React.Fragment, null,
                isOpacityScale ? (React.createElement("path", { d: d3Hexbin.hexagon(isSizeScale ? radiusScale(hexData.length) : hexRadius), id: `${hexData.x},${hexData.y}`, key: `${hexData.x},${hexData.y}`, clipPath: `url(#${hexData.x},${hexData.y})`, style: {
                        fill: `${'black'}`,
                        clipPath: `url(#${hexData.x},${hexData.y})`,
                        transform: `translate(${hexData.x}px, ${hexData.y}px)`,
                        stroke: isSelected ? '#E29609' : 'white',
                        strokeWidth: isSelected ? 10 : 0,
                        fillOpacity: opacityScale(hexData.length),
                    } })) : null,
                React.createElement(PieChart, { data: catMapVals, dataCategories: catMapKeys, radius: isSizeScale ? radiusScale(hexData.length) / 2 : hexRadius / 2, transform: `translate(${hexData.x}px, ${hexData.y}px)`, colorScale: colorScale }))) : null)));
}
//# sourceMappingURL=SingleHex.js.map