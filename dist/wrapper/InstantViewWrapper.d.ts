/*********************************************************
 * Copyright (c) 2018 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 *********************************************************/
import 'phovea_ui/dist/webpack/_bootstrap';
import { IInstanceViewExtensionDesc, IItemSelection } from '../base/interfaces';
export declare class InstantViewWrapper {
    readonly node: HTMLElement;
    private selection;
    constructor(doc?: Document);
    pushView(view: IInstanceViewExtensionDesc): void;
    hide(): void;
    private clear;
    setSelection(selection?: IItemSelection): void;
}
