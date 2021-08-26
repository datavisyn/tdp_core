import * as React from 'react';
import { Modal, Toast, Popover, Alert, Offcanvas, Tooltip, Tab, Collapse, Dropdown } from 'bootstrap';
export declare const useBSModal: (options?: Partial<Modal.Options>) => [(element: HTMLElement | null) => void, Modal];
export declare const useBSToast: (options?: Partial<Toast.Options>) => [(element: HTMLElement | null) => void, Toast];
export declare const useBSPopover: (options?: Partial<Popover.Options>) => [(element: HTMLElement | null) => void, Popover];
export declare const useBSAlert: () => [(element: HTMLElement | null) => void, Alert];
export declare const useBSOffcanvas: () => [(element: HTMLElement | null) => void, Offcanvas];
export declare const useBSTooltip: (options?: Partial<Tooltip.Options>) => [(element: HTMLElement | null) => void, Tooltip];
export declare const useBSTab: () => [(element: HTMLElement | null) => void, Tab];
export declare const useBSCollapse: (options?: Partial<Collapse.Options>) => [(element: HTMLElement | null) => void, Collapse];
export declare const useBSDropdown: (options?: Partial<Dropdown.Options>) => [(element: HTMLElement | null) => void, Dropdown];
export declare const BSModal: ({ children, ref: onInstance, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    ref?: (instance: Modal) => void;
} & Partial<Modal.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSToast: ({ children, ref: onInstance, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    ref?: (instance: Toast) => void;
} & Partial<Toast.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSPopover: ({ children, ref: onInstance, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    ref?: (instance: Popover) => void;
} & Partial<Popover.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSAlert: ({ children, ref: onInstance, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    ref?: (instance: Alert) => void;
}) => JSX.Element;
export declare const BSOffcanvas: ({ children, ref: onInstance, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    ref?: (instance: Offcanvas) => void;
} & {
    show?: boolean;
    relatedTarget?: HTMLElement;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSTooltip: ({ children, ref: onInstance, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    ref?: (instance: Tooltip) => void;
} & Partial<Tooltip.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSTab: ({ children, ref: onInstance, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    ref?: (instance: Tab) => void;
}) => JSX.Element;
export declare const BSCollapse: ({ children, ref: onInstance, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    ref?: (instance: Collapse) => void;
} & Partial<Collapse.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
export declare const BSDropdown: ({ children, ref: onInstance, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    ref?: (instance: Dropdown) => void;
} & Partial<Dropdown.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => JSX.Element;
