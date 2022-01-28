import { IVisMetaData } from '../../vis/IVisMetaData';

/**
 * @internal
 */
export class ProxyMetaData implements IVisMetaData {
  constructor(private proxy: () => IVisMetaData) {}

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
