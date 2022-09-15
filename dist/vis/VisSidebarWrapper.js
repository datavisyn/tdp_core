import { Drawer } from '@mantine/core';
import * as React from 'react';
export function VisSidebarWrapper({ id, children, open = true, target, onClose, }) {
    return (React.createElement(Drawer, { closeOnClickOutside: true, padding: "sm", lockScroll: false, overlayOpacity: 0, styles: { drawer: { position: 'absolute', overflow: 'auto' }, root: { position: 'absolute', padding: 0 }, header: { margin: 0 } }, withinPortal: true, position: "right", shadow: "xl", target: target, opened: open, onClose: () => onClose(), size: "sm" }, children));
}
//# sourceMappingURL=VisSidebarWrapper.js.map