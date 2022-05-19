export interface IProxyViewProps {
    /**
     * Selection of the previous view
     */
    site: string;
    argument: string;
    currentId: string;
}
/**
 * This simple proxy view is intended to be used inside of a visyn view component which does the required mapping between
 * types. See {link} for an example.
 */
export declare function ProxyViewComponent({ site, argument, currentId }: IProxyViewProps): JSX.Element;
//# sourceMappingURL=ProxyViewComponent.d.ts.map