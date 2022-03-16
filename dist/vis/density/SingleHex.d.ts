/// <reference types="react" />
import * as hex from 'd3-hexbin';
import * as d3 from 'd3v7';
import { EHexbinOptions } from '../interfaces';
export interface SingleHexProps {
    hexbinOption: EHexbinOptions;
    hexData: hex.HexbinBin<[number, number, string, string]>;
    d3Hexbin: hex.Hexbin<[number, number]>;
    isSizeScale: boolean;
    radiusScale: d3.ScaleLinear<number, number, never> | null;
    isOpacityScale: boolean;
    opacityScale: d3.ScaleLinear<number, number, never> | null;
    hexRadius: number;
    colorScale: d3.ScaleOrdinal<string, string, never>;
    selected?: {
        [key: string]: boolean;
    };
}
export declare function SingleHex({ hexbinOption, hexData, d3Hexbin, isSizeScale, radiusScale, isOpacityScale, opacityScale, hexRadius, colorScale, selected, }: SingleHexProps): JSX.Element;
//# sourceMappingURL=SingleHex.d.ts.map