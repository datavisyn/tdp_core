import { ActionMetaData } from './ActionMeta';
import { IObjectRef } from './ObjectNode';
import { IGraphDataDescription } from '../graph/graph';

export interface IProvenanceGraph {
  clear(): void;
}

export interface IProvenanceGraphDataDescription extends IGraphDataDescription {
  readonly local?: boolean;
  readonly size: [number, number];
  readonly attrs: {
    graphtype: string;
    of: string;
  };
}

export interface IInverseActionCreator {
  (inputs: IObjectRef<any>[], creates: IObjectRef<any>[], removes: IObjectRef<any>[]): IAction;
}

export interface IAction {
  readonly meta: ActionMetaData;
  readonly id: string;
  readonly f: ICmdFunction;
  readonly inputs?: IObjectRef<any>[];
  readonly parameter?: any;
}

export interface ICmdResult {
  /**
   * the command to revert this command
   */
  inverse: IAction | IInverseActionCreator;
  /**
   * the created references
   */
  created?: IObjectRef<any>[];
  /**
   * the removed references
   */
  removed?: IObjectRef<any>[];

  /**
   * then number of actual milliseconds consumed
   */
  consumed?: number;
}

/**
 * abstract definition of a command
 */
export interface ICmdFunction {
  (inputs: IObjectRef<any>[], parameters: any, graph: IProvenanceGraph, within: number): PromiseLike<ICmdResult> | ICmdResult;
}
/**
 * a factory to create from an id the corresponding command
 */
export interface ICmdFunctionFactory {
  (id: string): ICmdFunction;
}
