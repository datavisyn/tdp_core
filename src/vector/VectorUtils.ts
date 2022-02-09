import { IVectorDataDescription } from './IVector';
import { IValueTypeDesc } from '../data/valuetype';
import { DataUtils } from '../data/DataUtils';
import { BaseUtils } from '../base/BaseUtils';

export class VectorUtils {
  static createDefaultVectorDesc(): IVectorDataDescription<IValueTypeDesc> {
    return <IVectorDataDescription<IValueTypeDesc>>BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
      type: 'vector',
      idtype: '_rows',
      size: 0,
      value: {
        type: 'string',
      },
    });
  }
}
