import * as React from 'react';
import * as hex from 'd3-hexbin';
import * as d3v7 from 'd3v7';
import { useMemo } from 'react';
import { PieChart } from './PieChart';
import { cutHex } from './utils';
import { EHexbinOptions } from '../interfaces';

export interface SingleHexProps {
  hexbinOption: EHexbinOptions;
  hexData: hex.HexbinBin<[number, number, string, string]>;
  d3Hexbin: hex.Hexbin<[number, number]>;
  isSizeScale: boolean;
  radiusScale: d3v7.ScaleLinear<number, number, never> | null;
  isOpacityScale: boolean;
  opacityScale: d3v7.ScaleLinear<number, number, never> | null;
  hexRadius: number;
  colorScale: d3v7.ScaleOrdinal<string, string, never>;
  selected?: { [key: string]: boolean };
  isCategorySelected: boolean;
}

export function SingleHex({
  hexbinOption,
  hexData,
  d3Hexbin,
  isSizeScale,
  radiusScale,
  isOpacityScale,
  opacityScale,
  hexRadius,
  colorScale,
  selected = {},
  isCategorySelected,
}: SingleHexProps) {
  const { catMap, catMapKeys, catMapVals } = useMemo(() => {
    const currMap = {};

    hexData.forEach((point: [number, number, string, string]) => {
      currMap[point[2]] = currMap[point[2]] ? currMap[point[2]] + 1 : 1;
    });

    return { catMap: currMap, catMapKeys: Object.keys(currMap), catMapVals: Object.values(currMap) };
  }, [hexData]);

  const isSelected = useMemo(() => {
    return hexData.find((point: [number, number, string, string]) => selected[point[3]] !== true) === undefined;
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

  return (
    <>
      {hexbinOption === EHexbinOptions.BINS && isCategorySelected
        ? catMapKeys.sort().map((key) => {
            const currPath = cutHex(
              d3Hexbin.hexagon(isSizeScale ? radiusScale(hexData.length) : hexRadius - 0.5),
              isSizeScale ? radiusScale(hexData.length) : hexRadius,
              counter,
              Math.ceil(catMap[key] / hexDivisor),
            );
            counter += Math.ceil(catMap[key] / hexDivisor);

            return (
              <React.Fragment key={`${hexData.x}, ${hexData.y}, ${key}`}>
                <path
                  d={currPath}
                  style={{
                    fill: `${colorScale ? colorScale(key) : 'black'}`,
                    transform: `translate(${hexData.x}px, ${hexData.y}px)`,
                    stroke: isSelected ? '#E29609' : 'white',
                    strokeWidth: 2,
                    fillOpacity: isOpacityScale ? opacityScale(hexData.length) : '1',
                  }}
                />
              </React.Fragment>
            );
          })
        : null}

      {hexbinOption === EHexbinOptions.COLOR || !isCategorySelected ? (
        <path
          d={d3Hexbin.hexagon(isSizeScale ? radiusScale(hexData.length) : hexRadius - 0.5)}
          style={{
            fill: `${colorScale ? colorScale(topCategory) : 'black'}`,
            transform: `translate(${hexData.x}px, ${hexData.y}px)`,
            stroke: isSelected ? '#E29609' : 'white',
            strokeWidth: 2,
            fillOpacity: isOpacityScale ? opacityScale(hexData.length) : '1',
          }}
        />
      ) : null}
      {hexbinOption === EHexbinOptions.PIE && isCategorySelected ? (
        <>
          {isOpacityScale ? (
            <path
              d={d3Hexbin.hexagon(isSizeScale ? radiusScale(hexData.length) : hexRadius - 0.5)}
              style={{
                fill: `${'black'}`,
                transform: `translate(${hexData.x}px, ${hexData.y}px)`,
                stroke: isSelected ? '#E29609' : 'white',
                strokeWidth: 2,
                fillOpacity: opacityScale(hexData.length),
              }}
            />
          ) : null}
          <PieChart
            data={catMapVals as number[]}
            dataCategories={catMapKeys}
            radius={isSizeScale ? radiusScale(hexData.length) / 2 : hexRadius / 2}
            transform={`translate(${hexData.x}px, ${hexData.y}px)`}
            colorScale={colorScale}
          />
        </>
      ) : null}
    </>
  );
}
