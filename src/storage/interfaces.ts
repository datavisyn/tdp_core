import { ISecureItem } from 'visyn_core/security';

export enum ENamedSetType {
  NAMEDSET,
  CUSTOM,
  PANEL,
  FILTER,
}

export interface IBaseNamedSet {
  /**
   * type of the named set
   */
  type: ENamedSetType;

  /**
   * Filter name
   */
  name: string;

  /**
   * Filter description
   */
  description: string;

  /**
   * idtype name to match the filter for an entry point
   */
  idType: string;
  /**
   * extra key/value pair
   */
  subTypeKey?: string;
  subTypeValue?: string;

  /**
   * Use the subType value for the given key from the session
   */
  subTypeFromSession?: boolean;
}

export interface IPanelNamedSet extends IBaseNamedSet {
  type: ENamedSetType.PANEL;
  id: string;
}

export interface IStoredNamedSet extends IBaseNamedSet, ISecureItem {
  type: ENamedSetType.NAMEDSET;

  /**
   * Id with random characters (generated when storing it on the server)
   */
  id: string;

  /**
   * List of comma separated ids
   */
  ids: string;
}

export interface IFilterNamedSet extends IBaseNamedSet {
  type: ENamedSetType.FILTER;

  filter: { [key: string]: any };
}

export interface ICustomNamedSet extends IBaseNamedSet {
  type: ENamedSetType.CUSTOM;
}

export declare type INamedSet = IFilterNamedSet | IPanelNamedSet | IStoredNamedSet | ICustomNamedSet;
