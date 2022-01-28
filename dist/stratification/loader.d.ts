import { Range, CompositeRange1D } from '../range';
import { IStratificationDataDescription } from './IStratification';
export interface ILoadedStratification {
    readonly rowIds: Range;
    readonly rows: string[];
    readonly range: CompositeRange1D;
}
export interface IStratificationLoader {
    (desc: IStratificationDataDescription): Promise<ILoadedStratification>;
}
export declare class StratificationLoaderUtils {
    static viaAPILoader(): IStratificationLoader;
    static viaDataLoader(rows: string[], rowIds: number[], range: CompositeRange1D): IStratificationLoader;
}
//# sourceMappingURL=loader.d.ts.map