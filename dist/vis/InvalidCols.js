import * as React from 'react';
export function InvalidCols({ message }) {
    return (React.createElement("div", { className: "card w-25 h-10 justify-content-center" },
        React.createElement("div", { className: "card-header" }, "Invalid Columns Selected"),
        React.createElement("div", { className: "card-body" },
            React.createElement("p", { className: "card-text" }, message))));
}
//# sourceMappingURL=InvalidCols.js.map