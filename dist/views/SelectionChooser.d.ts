import { IFormElement, IFormElementDesc } from '../form/interfaces';
import { ISelection } from '../base/interfaces';
import { IDTypeLike } from '../idtype';
export interface ISelectionChooserOptions {
    /**
     * Readable IDType the selection is being mapped to. If there is a 1:n mapping or in case of different readable and target IDTypes this IDType is used as the options group
     */
    readableIDType: IDTypeLike;
    /**
     * In case of 1:n mappings between the selection's IDType and the readableIDType (or in case of different readable and target IDTypes) the readableSubOptionIDType can be used map the n options to readable names
     */
    readableTargetIDType: IDTypeLike;
    label: string;
    appendOriginalLabel: boolean;
    selectNewestByDefault: boolean;
}
/**
 * helper class for chooser logic
 */
export declare class SelectionChooser {
    private readonly accessor;
    private static readonly INVALID_MAPPING;
    private readonly target;
    private readonly readAble;
    private readonly readableTargetIDType;
    readonly desc: IFormElementDesc;
    private readonly formID;
    private readonly options;
    private currentOptions;
    constructor(accessor: (id: string) => IFormElement, targetIDType?: IDTypeLike, options?: Partial<ISelectionChooserOptions>);
    init(selection: ISelection): Promise<boolean>;
    update(selection: ISelection): Promise<boolean>;
    chosen(): {
        id: number;
        name: string;
        label: string;
    } | null;
    private toItems;
    private updateImpl;
    private updateItems;
    /**
     * change the selected value programmatically
     */
    setSelection(value: any): void;
}
//# sourceMappingURL=SelectionChooser.d.ts.map