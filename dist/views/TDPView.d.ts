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
import { IReactHandler } from './AReactView';
import * as React from 'react';
import { IViewPluginDesc } from '../base';
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
    private readonly listener;
    constructor(props: ITDPViewProps, context?: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(): void;
    private createContext;
    private buildSelection;
    private triggerSelection;
    render(): JSX.Element;
    private selectNative;
}
//# sourceMappingURL=TDPView.d.ts.map