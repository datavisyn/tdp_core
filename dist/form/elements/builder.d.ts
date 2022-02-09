import { IParams } from '../../base/rest';
import { IFormElementDesc } from '../interfaces';
export interface INameLookupOptions {
    /**
     * @default <table>
     */
    formID: string;
    /**
     * @default <table.capitalize>
     */
    label: string;
    /**
     * @default false
     */
    multiple: boolean;
    /**
     * @default name
     */
    column: string;
    /**
     * @default <table>_items
     */
    view: string;
    /**
     * @default true
     */
    required: boolean;
    /**
     * @default {}
     */
    params: IParams;
    /**
     * @default false
     */
    useSession: boolean;
}
export declare class NameLookupUtils {
    /**
     * utility to create a name lookup select2 field
     * @param {string} database
     * @param {string} table
     * @param {Partial<INameLookupOptions>} options
     * @returns {IFormElementDesc}
     */
    static nameLookupDesc(database: string, table: string, options?: Partial<INameLookupOptions>): IFormElementDesc;
}
//# sourceMappingURL=builder.d.ts.map