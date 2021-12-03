
import {IDataDescription} from './DataDescription';
import {UniqueIdManager} from '../app/UniqueIdManager';
import {UserSession} from '../app/UserSession';
import {IDataType, ADataType} from './datatype';
import {BaseUtils} from '../base/BaseUtils';


export class DataUtils {
  /**
   * creates a default data description
   * @return {{type: string, id: string, name: string, fqname: string, description: string, creator: string, ts: number}}
   */
  static createDefaultDataDesc(namespace = 'localData'): IDataDescription {
    const id = UniqueIdManager.getInstance().uniqueString(namespace);
    return {
      type: 'default',
      id,
      name: id,
      fqname: id,
      description: '',
      creator: UserSession.getInstance().currentUserNameOrAnonymous(),
      ts: Date.now()
    };
}
  /**
   * utility to assign a dataset to an html element, similar to d3
   * @param node
   * @param data
   */
  static assignData(node: Element, data: IDataType) {
    (<any>node).__data__ = data;
  }
  /**
   * transpose the given matrix
   * @param m
   * @returns {*}
   */
  static transpose(m: any[][]) {
    if (m.length === 0 || m[0].length === 0) {
      return [];
    }
    const r = m[0].map((i) => [i]);
    for (let i = 1; i < m.length; ++i) {
      m[i].forEach((v, i) => r[i].push(v));
    }
    return r;
  }

  /**
   * utility function to create a datatype, designed for JavaScript usage
   * @param name
   * @param functions the functions to add
   * @return {function(IDataDescription): undefined}
   */
  static defineDataType(name: string, functions: any) {
    function DataType(this: any, desc: IDataDescription) {
      ADataType.call(this, desc);
      if (typeof(this.init) === 'function') {
        this.init.apply(this, Array.from(arguments));
      }
    }

    BaseUtils.extendClass(DataType, ADataType);
    DataType.prototype.toString = () => name;
    DataType.prototype = BaseUtils.mixin(DataType.prototype, functions);

    return DataType;
  }
}
