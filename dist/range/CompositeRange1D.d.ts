import { Range1D, ICompositeRange1D } from './Range1D';
import { Range1DGroup } from './Range1DGroup';
export declare class CompositeRange1D extends Range1D implements ICompositeRange1D {
    readonly name: string;
    readonly groups: Range1DGroup[];
    constructor(name: string, groups: Range1DGroup[], base?: Range1D);
    preMultiply(sub: Range1D, size?: number): ICompositeRange1D;
    union(other: Range1D, size?: number): ICompositeRange1D;
    intersect(other: Range1D, size?: number): ICompositeRange1D;
    without(without: Range1D, size?: number): ICompositeRange1D;
    clone(): ICompositeRange1D;
    sort(cmp?: (a: number, b: number) => number): ICompositeRange1D;
    toSet(size?: number): ICompositeRange1D;
    toString(): string;
    fromLikeComposite(groups: Range1DGroup[]): ICompositeRange1D;
    /**
     * TODO document
     * @param name
     * @param groups
     * @return {CompositeRange1D}
     */
    static composite(name: string, groups: Range1DGroup[]): CompositeRange1D;
}
//# sourceMappingURL=CompositeRange1D.d.ts.map