import { IStoredNamedSet } from './interfaces';
import { ISecureItem } from 'phovea_core';
export declare class StoreUtils {
    static editDialog(namedSet: IStoredNamedSet, result: (name: string, description: string, sec: Partial<ISecureItem>) => void): void;
}
