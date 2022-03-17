/** *******************************************************
 * Copyright (c) 2022 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 ******************************************************** */
import { ISymbol } from './symbol';
export interface ILollipopOptions {
    strokeColor: string;
    fillColor: string | ((item: any) => string);
    hoverColor: string;
    selectedColor: string;
    symbolSize: number;
}
export declare class LollipopSymbol {
    static defaultOptions(): ILollipopOptions;
    static lollipopSymbol(params?: Partial<ILollipopOptions>): ISymbol<any>;
    static circleSymbol(params?: Partial<ILollipopOptions>): ISymbol<any>;
}
//# sourceMappingURL=LollipopSymbol.d.ts.map