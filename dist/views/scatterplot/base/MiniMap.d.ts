import { Scatterplot } from './Scatterplot';
import { EScaleAxes } from './AScatterplot';
export interface IMiniMapOptions {
    scale: EScaleAxes;
}
export declare class MiniMap {
    private parent;
    private readonly brush;
    private readonly props;
    private readonly xscale;
    private readonly yscale;
    private readonly node;
    constructor(plot: Scatterplot<any>, parent: HTMLElement, props?: Partial<IMiniMapOptions>);
    private brushed;
    private update;
    /**
     * Utility method to scale two elements of a tuple type instead of calling the map function on a Tuple type
     * @param {IMinMax} minMax
     * @param {ScaleLinear<number, number>} scale
     * @returns {[number , number]}
     */
    private scale;
}
//# sourceMappingURL=MiniMap.d.ts.map