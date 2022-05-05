import * as React from 'react';
export function VisSidebarWrapper({ id, children }) {
    return (React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light overflow-auto" },
        React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#generalVisBurgerMenu${id}`, "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
            React.createElement("i", { className: "fas fa-bars" })),
        React.createElement("div", { className: "collapse show collapse-horizontal", id: `generalVisBurgerMenu${id}` }, children)));
}
//# sourceMappingURL=VisSidebarWrapper.js.map