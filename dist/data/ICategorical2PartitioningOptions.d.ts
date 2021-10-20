/**
 * This file defines interfaces for various data types and their metadata.
 */
import { CompositeRange1D } from '../range';
export interface ICategorical2PartitioningOptions {
    /**
     * name of the partitioning
     * default: 'Partitioning'
     */
    name?: string;
    /**
     * default: true
     */
    skipEmptyCategories?: boolean;
    /**
     * colors for categories, more will be rotated
     * default: ['gray']
     */
    colors?: string[];
    /**
     * labels for categories, need to match exactly
     * default: null
     */
    labels?: string[];
}
export declare class Categorical2PartioningUtils {
    /**
     * converts the given categorical data to a grouped range
     * @param data
     * @param categories
     * @param options
     * @return {CompositeRange1D}
     */
    static categorical2partitioning<T>(data: T[], categories: T[], options?: ICategorical2PartitioningOptions): CompositeRange1D;
}
