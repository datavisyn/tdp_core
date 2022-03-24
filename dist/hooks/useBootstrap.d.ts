export declare const useBSModal: (...options: unknown[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSToast: (...options: unknown[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSPopover: (...options: unknown[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSAlert: (...options: unknown[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSOffcanvas: (...options: unknown[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSTooltip: (...options: unknown[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSTab: (...options: unknown[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSCollapse: (...options: unknown[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSDropdown: (...options: unknown[]) => [(element: HTMLElement | null) => void, any];
export declare const BSModal: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: any;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: any;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSToast: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: any;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: any;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSPopover: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: any;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: any;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSAlert: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: any;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: any;
} & Record<string, unknown>) => JSX.Element;
export declare const BSOffcanvas: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: any;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: any;
} & {
    show?: boolean;
    relatedTarget?: HTMLElement;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSTooltip: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: any;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: any;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSTab: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: any;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: any;
} & Record<string, unknown>) => JSX.Element;
export declare const BSCollapse: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: any;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: any;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSDropdown: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: any;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: any;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
//# sourceMappingURL=useBootstrap.d.ts.map