import { IPluginDesc } from 'visyn_core/plugin';
import { IVisPluginDesc } from './IVisPluginDesc';
import { IVisInstance } from './visInstance';
import { IDataType } from '../../data/datatype';
export declare class VisUtils {
    static extrapolateFilter(r: {
        filter?: string | ((data: IDataType) => boolean);
    }): void;
    static extrapolateIconify(r: {
        iconify?(node: HTMLElement): void;
    }): void;
    static extrapolateSize(r: {
        scaling?: string;
        sizeDependsOnDataDimension: boolean | [boolean, boolean];
    }): void;
    static extrapolateRotation(r: {
        rotation: string | number | null;
    }): void;
    static toVisPlugin(plugin: IPluginDesc): IVisPluginDesc;
    /**
     * list a vis plugins and check in addition whether the match the given data type
     * @param data the data type to visualize
     * @returns {IPluginDesc[]}
     */
    static listVisPlugins(data: IDataType): IVisPluginDesc[];
    static assignVis(node: Element, vis: IVisInstance): void;
}
//# sourceMappingURL=VisUtils.d.ts.map