import { IVisMetaData } from '../../provvis';
/**
 * @internal
 */
export declare class ProxyMetaData implements IVisMetaData {
    private proxy;
    constructor(proxy: () => IVisMetaData);
    get scaling(): string;
    get rotation(): number;
    get sizeDependsOnDataDimension(): boolean[];
}
//# sourceMappingURL=ProxyMetaData.d.ts.map