/**
 * This file defines interfaces for various data types and their metadata.
 */

import {BaseUtils} from '../base';



export interface IValueTypeDesc {
  type: string;
}

export interface INumberValueTypeDesc extends IValueTypeDesc {
  readonly type: 'int'|'real';
  /**
   * min, max
   */
  readonly range: [number, number];
  /**
   * missing value
   */
  readonly missing?: number;
}

export interface ICategory {
  readonly name: string;
  readonly color?: string;
  readonly label?: string;
}

export interface ICategoricalValueTypeDesc extends IValueTypeDesc {
  readonly type: 'categorical';
  readonly categories: (ICategory|string)[];
}

export interface IStringValueTypeDesc extends IValueTypeDesc {
  readonly type: 'string';
}

export declare type IValueType = number | string | any;

function isNumeric(obj: any) {
  return (obj - parseFloat(obj) + 1) >= 0;
}

export class ValueTypeUtils {

  static VALUE_TYPE_CATEGORICAL = 'categorical';
  static VALUE_TYPE_STRING = 'string';
  static VALUE_TYPE_REAL = 'real';
  static VALUE_TYPE_INT = 'int';

  /**
   * guesses the type of the given value array returning its description
   * @param arr
   * @return {any}
   */
  static guessValueTypeDesc(arr: IValueType[]): IValueTypeDesc {
    if (arr.length === 0) {
      return {type: 'string'}; //doesn't matter
    }
    const test = arr[0];
    if (typeof test === 'number' || isNumeric(test)) {
      return <INumberValueTypeDesc>{type: ValueTypeUtils.VALUE_TYPE_REAL, range: BaseUtils.extent(arr.map(parseFloat))};
    }
    const values = new Set(<string[]>arr);
    if (values.size < arr.length * 0.2 || values.size < 8) {
      //guess as categorical
      return <ICategoricalValueTypeDesc>{type: 'categorical', categories: Array.from(values.values())};
    }
    return <IStringValueTypeDesc>{type: 'string'};
  }


  private static maskImpl(arr: number|number[], missing: number): number|number[] {
    if (Array.isArray(arr)) {
      const vs = <number[]>arr;
      if (vs.indexOf(missing) >= 0) {
        return vs.map((v) => v === missing ? NaN : v);
      }
    }
    return arr === missing ? NaN : arr;
  }

  static mask(arr: number|number[], desc: INumberValueTypeDesc): number|number[] {
    if (desc.type === ValueTypeUtils.VALUE_TYPE_INT && 'missing' in desc) {
      return ValueTypeUtils.maskImpl(arr, desc.missing);
    }
    if (desc.type === ValueTypeUtils.VALUE_TYPE_INT || desc.type === ValueTypeUtils.VALUE_TYPE_REAL) {
      // replace null values with Number.NaN
      return ValueTypeUtils.maskImpl(arr, null);
    }
    return arr;
  }
}
