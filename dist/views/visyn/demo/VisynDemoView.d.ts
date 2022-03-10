/// <reference types="react" />
import { VisColumn, IVisConfig } from '../../../vis';
import { IVisynViewPluginDesc, IVisynViewProps, IVisynViewPluginDefinition } from '../interfaces';
declare type VisynDemoViewParameters = {
    columns: VisColumn[] | null;
    config: IVisConfig | null;
    dataLength: number;
};
declare type VisynDemoViewProps = IVisynViewProps<IVisynViewPluginDesc, VisynDemoViewParameters>;
export declare function VisynDemoView({ desc, parameters, onParametersChanged }: VisynDemoViewProps): JSX.Element;
export declare function VisynDemoViewSidebar({ parameters, onParametersChanged }: VisynDemoViewProps): JSX.Element;
export declare function VisynDemoViewHeader({ parameters, selection, onParametersChanged }: VisynDemoViewProps): JSX.Element;
export declare function createVisynDemoView(): IVisynViewPluginDefinition;
export {};
//# sourceMappingURL=VisynDemoView.d.ts.map