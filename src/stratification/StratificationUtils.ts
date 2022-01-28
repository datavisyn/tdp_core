import { BaseUtils } from '../base/BaseUtils';
import { DataUtils } from '../data';
import { IStratificationDataDescription } from './IStratification';

export class StratificationUtils {
  static createDefaultStratificationDesc(): IStratificationDataDescription {
    return <IStratificationDataDescription>BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
      type: 'stratification',
      idtype: '_rows',
      size: 0,
      groups: [],
      ngroups: 0,
    });
  }
}
