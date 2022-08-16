/// <reference types="react" />
export interface IProxyViewProps {
    /**
     * Site that you want to view
     */
    site: string;
}
/**
 * This simple proxy view is intended to be used inside of a visyn view component which does the required mapping between
 * types. Shows a loading icon while the website is loading.
 */
export declare function ProxyViewComponent({ site }: IProxyViewProps): JSX.Element;
//# sourceMappingURL=ProxyViewComponent.d.ts.map