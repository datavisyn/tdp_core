import * as React from 'react';
declare type OmitFirst<T extends any[]> = ((...p: T) => void) extends (p1: infer P1, ...rest: infer R) => void ? R : never;
export declare const useBSModal: (...options: ConstructorParameters<T>[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSToast: (...options: ConstructorParameters<T>[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSPopover: (...options: ConstructorParameters<T>[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSAlert: (...options: ConstructorParameters<T>[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSOffcanvas: (...options: ConstructorParameters<T>[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSTooltip: (...options: ConstructorParameters<T>[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSTab: (...options: ConstructorParameters<T>[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSCollapse: (...options: ConstructorParameters<T>[]) => [(element: HTMLElement | null) => void, any];
export declare const useBSDropdown: (...options: ConstructorParameters<T>[]) => [(element: HTMLElement | null) => void, any];
export declare const BSModal: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: ReturnType<HookType>) => void;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSToast: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: ReturnType<HookType>) => void;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSPopover: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: ReturnType<HookType>) => void;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSAlert: ({ children, instanceRef, ...options }: any) => JSX.Element;
export declare const BSOffcanvas: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: ReturnType<HookType>) => void;
} & {
    show?: boolean;
    relatedTarget?: HTMLElement;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSTooltip: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: ReturnType<HookType>) => void;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSTab: ({ children, instanceRef, ...options }: any) => JSX.Element;
export declare const BSCollapse: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: ReturnType<HookType>) => void;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSDropdown: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: ReturnType<HookType>) => void;
} & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export {};
//# sourceMappingURL=useBootstrap.d.ts.map