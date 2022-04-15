/// <reference types="react" />
import * as hex from 'd3-hexbin';
import * as d3v7 from 'd3v7';
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
    selected?: {
        [key: string]: boolean;
    };
    isCategorySelected: boolean;
}
export declare function SingleHex({ hexbinOption, hexData, d3Hexbin, isSizeScale, radiusScale, isOpacityScale, opacityScale, hexRadius, colorScale, selected, isCategorySelected, }: SingleHexProps): JSX.Element;
//# sourceMappingURL=SingleHex.d.ts.map