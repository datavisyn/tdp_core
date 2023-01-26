import * as React from 'react';
import * as hex from 'd3-hexbin';
import * as d3v7 from 'd3v7';
import { useMemo } from 'react';
import { Tooltip } from '@mantine/core';
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
    <g>
      <clipPath id={`${hexData.x},${hexData.y}Clip`}>
        <path
          d={d3Hexbin.hexagon(isSizeScale ? radiusScale(hexData.length) : hexRadius)}
          style={{
            transform: `translate(${hexData.x}px, ${hexData.y}px)`,
          }}
        />
      </clipPath>
      {hexbinOption === EHexbinOptions.BINS && isCategorySelected
        ? catMapKeys.sort().map((key) => {
            const currPath = cutHex(
              d3Hexbin.hexagon(isSizeScale ? radiusScale(hexData.length) : hexRadius),
              isSizeScale ? radiusScale(hexData.length) : hexRadius,
              counter,
              Math.ceil(catMap[key] / hexDivisor),
            );
            counter += Math.ceil(catMap[key] / hexDivisor);

            return (
              <g key={`${hexData.x},${hexData.y},${key}`} clipPath={isSelected ? `url(#${hexData.x},${hexData.y}Clip)` : null}>
                <path
                  d={currPath}
                  style={{
                    fill: `${colorScale ? (isSelected || Object.keys(selected).length === 0 ? colorScale(key) : 'gray') : 'black'}`,
                    transform: `translate(${hexData.x}px, ${hexData.y}px)`,
                    stroke: isSelected ? '#E29609' : 'white',
                    strokeWidth: isSelected ? 1 : 0,
                    fillOpacity: isOpacityScale ? opacityScale(hexData.length) : '1',
                  }}
                />
              </g>
            );
          })
        : null}

      {hexbinOption === EHexbinOptions.COLOR || !isCategorySelected ? (
        <g clipPath={isSelected ? `url(#${hexData.x},${hexData.y}Clip)` : null}>
          <path
            d={d3Hexbin.hexagon(isSizeScale ? radiusScale(hexData.length) : hexRadius)}
            style={{
              fill: `${colorScale ? (isSelected || Object.keys(selected).length === 0 ? colorScale(topCategory) : 'gray') : 'black'}`,
              transform: `translate(${hexData.x}px, ${hexData.y}px)`,
              stroke: isSelected ? '#E29609' : 'white',
              strokeWidth: isSelected ? (colorScale ? 1 : 2) : 0,
              fillOpacity: isOpacityScale ? opacityScale(hexData.length) : '1',
            }}
          />
        </g>
      ) : null}
      {hexbinOption === EHexbinOptions.PIE && isCategorySelected ? (
        <>
          {isOpacityScale ? (
            <g clipPath={isSelected ? `url(#${hexData.x},${hexData.y}Clip)` : null}>
              <path
                d={d3Hexbin.hexagon(isSizeScale ? radiusScale(hexData.length) : hexRadius)}
                style={{
                  fill: `${'black'}`,
                  transform: `translate(${hexData.x}px, ${hexData.y}px)`,
                  stroke: isSelected ? '#E29609' : 'white',
                  strokeWidth: isSelected ? 1 : 0,
                  fillOpacity: opacityScale(hexData.length),
                }}
              />
            </g>
          ) : null}
          <g style={{ opacity: isSelected || Object.keys(selected).length === 0 ? 1 : 0.2 }}>
            <PieChart
              data={catMapVals as number[]}
              dataCategories={catMapKeys}
              radius={isSizeScale ? radiusScale(hexData.length) / 2 : hexRadius / 2}
              transform={`translate(${hexData.x}px, ${hexData.y}px)`}
              colorScale={colorScale}
            />
          </g>
        </>
      ) : null}
    </g>
  );
}
