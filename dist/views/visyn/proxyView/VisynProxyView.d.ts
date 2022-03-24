import { VisynSimpleViewPluginType } from 'tdp_core';
export declare type ProxyViewPluginType = VisynSimpleViewPluginType<{
    currentId: string;
}, {
    /**
     * hello world
     */
    url: string;
}>;
export declare function ProxyView({ parameters, onParametersChanged, desc }: ProxyViewPluginType['props']): JSX.Element;
export declare function ProxyViewHeader({ selection, onParametersChanged }: ProxyViewPluginType['props']): JSX.Element;
export declare const create: () => ProxyViewPluginType['definition'];
//# sourceMappingURL=VisynProxyView.d.ts.map