import * as React from 'react';
import { Alert, Collapse, Dropdown, Modal, Offcanvas, Popover, Tab, Toast, Tooltip } from 'bootstrap';
export declare const useBSModal: (options?: Partial<Modal.Options>) => [(element: HTMLElement | null) => void, Modal];
export declare const useBSToast: (options?: Partial<Toast.Options>) => [(element: HTMLElement | null) => void, Toast];
export declare const useBSPopover: (options?: Partial<Popover.Options>) => [(element: HTMLElement | null) => void, Popover];
export declare const useBSAlert: () => [(element: HTMLElement | null) => void, Alert];
export declare const useBSOffcanvas: () => [(element: HTMLElement | null) => void, Offcanvas];
export declare const useBSTooltip: (options?: Partial<Tooltip.Options>) => [(element: HTMLElement | null) => void, Tooltip];
export declare const useBSTab: () => [(element: HTMLElement | null) => void, Tab];
export declare const useBSCollapse: (options?: Partial<Collapse.Options>) => [(element: HTMLElement | null) => void, Collapse];
export declare const useBSDropdown: (options?: Partial<Dropdown.Options>) => [(element: HTMLElement | null) => void, Dropdown];
export declare const BSModal: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: Modal) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES];
} & Partial<Modal.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => React.JSX.Element;
export declare const BSToast: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: Toast) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES];
} & Partial<Toast.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => React.JSX.Element;
export declare const BSPopover: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: Popover) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES];
} & Partial<Popover.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => React.JSX.Element;
export declare const BSAlert: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: Alert) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES];
} & Record<string, unknown>) => React.JSX.Element;
export declare const BSOffcanvas: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: Offcanvas) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES];
} & Record<string, unknown> & {
    show?: boolean;
    relatedTarget?: HTMLElement;
    setShow?: (show: boolean) => void;
}) => React.JSX.Element;
export declare const BSTooltip: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: Tooltip) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES];
} & Partial<Tooltip.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => React.JSX.Element;
export declare const BSTab: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: Tab) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES];
} & Record<string, unknown>) => React.JSX.Element;
export declare const BSCollapse: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: Collapse) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES];
} & Partial<Collapse.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => React.JSX.Element;
export declare const BSDropdown: ({ children, instanceRef, ...options }: {
    /**
     * Child element of the BS class, i.e. the `<div class="modal">...</div>` in the case of BSModal.
     */
    children: React.ReactElement;
    /**
     * Optional ref to get access to the instance of the BS class.
     */
    instanceRef?: (instance: Dropdown) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES];
} & Partial<Dropdown.Options> & {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => React.JSX.Element;
//# sourceMappingURL=useBootstrap.d.ts.map