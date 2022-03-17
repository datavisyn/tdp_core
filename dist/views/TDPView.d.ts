/** *******************************************************
 * Copyright (c) 2022 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 ******************************************************** */
import * as React from 'react';
import { IViewPluginDesc } from '../base';
import { IReactHandler } from './AReactView';
export interface ITDPViewProps {
    viewId: string;
    inputSelection?: string[];
    itemSelection?: string[];
    onItemSelectionChanged?(selection: string[], idType: string): void;
}
export interface ITDPViewState {
    viewPlugin: IViewPluginDesc;
}
export declare class TDPView extends React.Component<Readonly<ITDPViewProps>, ITDPViewState> implements IReactHandler {
    private node;
    private viewPromise;
    private view;
    private viewId;
    constructor(props: ITDPViewProps, context?: any);
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    private readonly listener;
    private createContext;
    private buildSelection;
    private triggerSelection;
    private selectNative;
    render(): JSX.Element;
}
//# sourceMappingURL=TDPView.d.ts.map