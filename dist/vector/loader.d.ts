import { Range } from '../range/Range';
import { IValueType } from '../data';
import { IVectorDataDescription } from './IVector';
/**
 * @internal
 */
export interface IVectorLoaderResult<T> {
    readonly rowIds: Range;
    readonly rows: string[];
    readonly data: T[];
}
/**
 * @internal
 */
export interface IVectorLoader<T> {
    (desc: IVectorDataDescription<any>): Promise<IVectorLoaderResult<T>>;
}
export declare class VectorLoaderUtils {
    /**
     * @internal
     */
    static viaAPILoader<T>(): (desc: IVectorDataDescription<any>) => Promise<any>;
    /**
     * @internal
     */
    static viaDataLoader<T>(rows: string[], rowIds: number[], data: IValueType[]): () => Promise<IVectorLoaderResult<T>>;
}
