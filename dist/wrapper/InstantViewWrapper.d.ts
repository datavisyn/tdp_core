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
import 'bootstrap-sass/assets/stylesheets/_bootstrap.scss';
import 'bootstrap-sass/assets/javascripts/bootstrap.js';
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
