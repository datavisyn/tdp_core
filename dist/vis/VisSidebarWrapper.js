import { Drawer } from '@mantine/core';
import * as React from 'react';
export function VisSidebarWrapper({ id, children, open = true, target, onClose, }) {
    return (React.createElement(Drawer, { closeOnClickOutside: true, padding: "sm", lockScroll: false, overlayOpacity: 0, zIndex: 50, styles: { drawer: { position: 'absolute', overflow: 'hidden' }, root: { position: 'absolute', padding: 0, overflow: 'hidden' }, header: { margin: 0 } }, position: "right", withinPortal: true, shadow: "xl", target: target, opened: open, onClose: () => onClose(), size: "sm" }, children));
}
//# sourceMappingURL=VisSidebarWrapper.js.map