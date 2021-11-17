/**
 * @internal
 */
export class ProxyMetaData {
    constructor(proxy) {
        this.proxy = proxy;
    }
    get scaling() {
        const p = this.proxy();
        return p ? p.scaling : 'free';
    }
    get rotation() {
        const p = this.proxy();
        return p ? p.rotation : 0;
    }
    get sizeDependsOnDataDimension() {
        const p = this.proxy();
        return p ? p.sizeDependsOnDataDimension : [false, false];
    }
}
//# sourceMappingURL=ProxyMetaData.js.map