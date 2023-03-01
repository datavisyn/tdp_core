export declare class RemoveNodeObserver {
    private readonly documents;
    observe(node: Node, callback: (node: Node) => void, thisArg?: any): void;
}
/**
 * utility function to get notified, when the given dom element is removed from its parent
 * @param node
 * @param callback
 */
export declare function onDOMNodeRemoved(node: Element | Element[], callback: () => void, thisArg?: any): void;
//# sourceMappingURL=RemoveNodeObserver.d.ts.map