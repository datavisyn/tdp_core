/**
 * metadata for a visualization
 */
export interface IVisMetaData {
    /**
     * scaling behavior
     * possible values:
     * - free (default) - no restrictions
     * - aspect - the initial aspect ratio must be kept, i.e. same scaling values in both dimensions
     * - width-only - only the width can be scaled
     * - height-only - only the height can be scaled
     */
    readonly scaling: string;
    /**
     * defines the rotation change angles
     * - no / 0 ... no rotation (default)
     * - free / null / NaN ... any rotation
     * - transpose / 90 ... 90 degree
     * - swap / 180 ... 180 degree
     * - <number> any degree
     */
    readonly rotation: number;
    /**
     * indicator, whether the size of this vis depends on the dimensions of the data, i.e. an axis no, a heatmap yes
     */
    readonly sizeDependsOnDataDimension: boolean[];
}
//# sourceMappingURL=IVisMetaData.d.ts.map