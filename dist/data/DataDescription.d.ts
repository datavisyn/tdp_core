/**
 * This file defines interfaces for various data types and their metadata.
 */
import { ISecureItem } from '../security';
/**
 * Interface defining metadata for a dataset.
 */
export interface IDataDescriptionMetaData extends ISecureItem {
    /**
     * the type of the datatype, e.g. matrix, vector, stratification, ...
     */
    readonly type: string;
    /**
     * the name of the dataset
     */
    readonly name: string;
    readonly description: string;
    /**
     * a fully qualified name, e.g. project_name/name
     */
    readonly fqname: string;
    /**
     * custom properties that can be added on the fly
     * @see https://www.typescriptlang.org/docs/handbook/interfaces.html#indexable-types
     * Note: This property needs to be writable to set it later on (e.g. in VectorTable)
     */
    [extras: string]: any;
    /**
     * creation time stamp
     */
    readonly ts: number;
}
/**
 * basic description elements
 */
export interface IDataDescription extends IDataDescriptionMetaData {
    /**
     * the unique id
     */
    readonly id: string;
}
//# sourceMappingURL=DataDescription.d.ts.map