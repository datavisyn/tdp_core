import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Modal, Toast, Popover, Alert, Offcanvas, Tooltip, Tab, Collapse, Dropdown } from 'bootstrap';
import { useSyncedRef } from 'visyn_core/hooks';
function useBSClass(clazz, ...options) {
    const [instance, setInstance] = React.useState(null);
    const setRef = React.useCallback((ref) => {
        setInstance((currentInstance) => {
            // If the element ref did not change, do nothing.
            // @ts-ignore
            if (currentInstance && ref && ref === currentInstance._element) {
                return currentInstance;
            }
            // Destroy the old instance
            currentInstance?.dispose();
            // Create a new one if there is a ref
            if (ref) {
                // @ts-ignore The typings are not perfectly shared among all the bootstrap classes.
                // eslint-disable-next-line new-cap
                return new clazz(ref, ...options);
            }
            // Set instance to null if no ref is passed
            return null;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    React.useEffect(() => {
        // Whenever we are unmounting (an instance), destroy it.
        return () => {
            try {
                instance?.dispose();
            }
            catch {
                // ignore if the instance was already disposed.
            }
        };
    }, [instance]);
    return [setRef, instance];
}
// eslint-disable-next-line @typescript-eslint/naming-convention
function __useBSClass(clazz) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return (...options) => useBSClass(clazz, ...options);
}
export const useBSModal = __useBSClass(Modal);
export const useBSToast = __useBSClass(Toast);
export const useBSPopover = __useBSClass(Popover);
export const useBSAlert = __useBSClass(Alert);
export const useBSOffcanvas = __useBSClass(Offcanvas);
export const useBSTooltip = __useBSClass(Tooltip);
export const useBSTab = __useBSClass(Tab);
export const useBSCollapse = __useBSClass(Collapse);
export const useBSDropdown = __useBSClass(Dropdown);
/**
 * This is a utility wrapper component that will allow our higher order
 * component to get a ref handle on our wrapped components html.
 * @see https://gist.github.com/jimfb/32b587ee6177665fb4cf
 */
class ReferenceWrapper extends React.Component {
    render() {
        const { children } = this.props;
        return React.Children.only(children);
    }
}
ReferenceWrapper.displayName = 'BSReferenceWrapper';
/**
 * Function returning the proper BS[Modal|Toast|...] classes via currying. Given parameter is the useBS[Modal|Toast|...] hook.
 * @param hook Main BS hook for this class.
 * @param additionalHook An additional hook to support additional properties for each instance type, i.e. show/hide in modals.
 */
function BSClass(hook, additionalHook) {
    return function InnerBSClass({ children, instanceRef, ...options }) {
        // Instantiate the hook
        const [ref, instance] = hook(options);
        // Store the ref to the onInstance callback to avoid putting it into the deps
        React.useEffect(() => {
            instanceRef?.(instance);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [instance]);
        // Call the optional additional hook with all options
        // Introduced in TS4
        // https://stackoverflow.com/questions/56675333/extending-a-union-type-exactly
        additionalHook?.(instance, options);
        const callbackRef = React.useCallback((wrapperRef) => {
            try {
                // Find the DOM node of the wrapper to receive the ref of the child.
                // @see https://github.com/ctrlplusb/react-sizeme/blob/master/src/with-size.js#L28-L39 for details.
                // eslint-disable-next-line react/no-find-dom-node
                ref(ReactDOM.findDOMNode(wrapperRef));
            }
            catch (e) {
                ref(null);
            }
        }, [ref]);
        // Call the render function
        return React.createElement(ReferenceWrapper, { ref: callbackRef }, children);
    };
}
/**
 * Helper hook to attached bootstrap listeners to an instance.
 * @param instance Instance to attach the listeners to.
 * @param listeners Map of listener keys to callbacks, i.e. `{"shown.bs.modal": () => console.log("shown")}`.
 */
function useBSListeners(instance, listeners) {
    React.useEffect(() => {
        if (instance) {
            if (!('_element' in instance)) {
                console.error('_element does not exist in BS instance');
            }
            else {
                // @ts-ignore
                const element = instance._element;
                Object.entries(listeners).forEach(([key, callback]) => element.addEventListener(key, callback));
                return () => {
                    Object.entries(listeners).forEach(([key, callback]) => element.removeEventListener(key, callback));
                };
            }
        }
        return undefined;
    }, [instance, listeners]);
}
/**
 * Helper hook for instances having the show/hide mechanism.
 * @param instance BS instance.
 * @param show True if instance should be shown, false if not.
 */
function useBSShowHide(instance, show) {
    React.useEffect(() => {
        try {
            if (show) {
                instance?.show();
            }
            else {
                instance?.hide();
            }
        }
        catch (e) {
            console.error(e);
        }
    }, [show, instance]);
}
export const BSModal = BSClass(useBSModal, (instance, { show, setShow }) => {
    const setShowRef = useSyncedRef(setShow);
    useBSListeners(instance, {
        'shown.bs.modal': () => setShowRef.current?.(true),
        'hidden.bs.modal': () => setShowRef.current?.(false),
    });
    useBSShowHide(instance, show);
});
export const BSToast = BSClass(useBSToast, (instance, { show, setShow }) => {
    const setShowRef = useSyncedRef(setShow);
    useBSListeners(instance, {
        'shown.bs.toast': () => setShowRef.current?.(true),
        'hidden.bs.toast': () => setShowRef.current?.(false),
    });
    useBSShowHide(instance, show);
});
export const BSPopover = BSClass(useBSPopover, (instance, { show, setShow }) => {
    const setShowRef = useSyncedRef(setShow);
    useBSListeners(instance, {
        'shown.bs.popover': () => setShowRef.current?.(true),
        'hidden.bs.popover': () => setShowRef.current?.(false),
    });
    useBSShowHide(instance, show);
});
export const BSAlert = BSClass(useBSAlert);
export const BSOffcanvas = BSClass(useBSOffcanvas, (instance, { show, relatedTarget, setShow }) => {
    const setShowRef = useSyncedRef(setShow);
    useBSListeners(instance, {
        'shown.bs.offcanvas': () => setShowRef.current?.(true),
        'hidden.bs.offcanvas': () => setShowRef.current?.(false),
    });
    React.useEffect(() => {
        if (show) {
            instance?.show(relatedTarget);
        }
        else {
            instance?.hide();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, instance]);
});
export const BSTooltip = BSClass(useBSTooltip, (instance, { show, setShow }) => {
    const setShowRef = useSyncedRef(setShow);
    useBSListeners(instance, {
        'shown.bs.tooltip': () => setShowRef.current?.(true),
        'hidden.bs.tooltip': () => setShowRef.current?.(false),
    });
    useBSShowHide(instance, show);
});
export const BSTab = BSClass(useBSTab);
export const BSCollapse = BSClass(useBSCollapse, (instance, { show, setShow }) => {
    const setShowRef = useSyncedRef(setShow);
    useBSListeners(instance, {
        'shown.bs.collapse': () => setShowRef.current?.(true),
        'hidden.bs.collapse': () => setShowRef.current?.(false),
    });
    useBSShowHide(instance, show);
});
export const BSDropdown = BSClass(useBSDropdown, (instance, { show, setShow }) => {
    const setShowRef = useSyncedRef(setShow);
    useBSListeners(instance, {
        'shown.bs.dropdown': () => setShowRef.current?.(true),
        'hidden.bs.dropdown': () => setShowRef.current?.(false),
    });
    useBSShowHide(instance, show);
});
//# sourceMappingURL=useBootstrap.js.map