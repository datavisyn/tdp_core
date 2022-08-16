import * as React from 'react';
import { useAsync } from '../hooks';
import { ViewUtils } from '../views';
const loadInstantView = (view, selection) => view.load().then((r) => r.factory(selection, { document }));
/**
 * Component rendering a navigation of all registered Instant-Views for the given selection idtype.
 */
export function InstantViewWrapper({ selection, style, }) {
    const { value: views } = useAsync((selection === null || selection === void 0 ? void 0 : selection.idtype) ? ViewUtils.findInstantViews : () => [], (selection === null || selection === void 0 ? void 0 : selection.idtype) ? [selection.idtype] : undefined);
    const [activeView, setActiveView] = React.useState(null);
    const hasViewAndSelection = activeView && selection;
    const { value: activeViewNode, status } = useAsync(hasViewAndSelection ? loadInstantView : () => null, hasViewAndSelection ? [activeView, selection] : undefined);
    const viewWrapperRef = React.useRef(null);
    React.useEffect(() => {
        if (viewWrapperRef.current) {
            // After the view is loaded, clear the existing content and add the new view node.
            viewWrapperRef.current.innerHTML = '';
            if (activeViewNode) {
                viewWrapperRef.current.appendChild(activeViewNode.node);
            }
        }
    }, [activeViewNode]);
    React.useEffect(() => {
        // Preselect the first one if possible
        setActiveView(views === null || views === void 0 ? void 0 : views[0]);
    }, [views]);
    return views && views.length > 0 ? (React.createElement("section", { className: "tdp-instant-views m-1 p-1 position-relative overflow-auto d-flex flex-column", hidden: !views || views.length === 0, style: style },
        React.createElement("ul", { className: "nav nav-tabs mb-1", role: "tablist", hidden: views.length === 1 }, views.map((view) => (React.createElement("li", { key: view.id, className: "nav-item" },
            React.createElement("button", { type: "button", className: `nav-link ${view.id === (activeView === null || activeView === void 0 ? void 0 : activeView.id) ? 'active' : ''}`, role: "tab", onClick: (e) => {
                    e.preventDefault();
                    setActiveView(view);
                } }, view.name))))),
        React.createElement("div", { className: `tab-content ${status === 'pending' ? 'tdp-busy' : ''}`, ref: viewWrapperRef }))) : null;
}
//# sourceMappingURL=InstantViewWrapper.js.map