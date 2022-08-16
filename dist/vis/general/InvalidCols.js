import * as React from 'react';
export function InvalidCols({ headerMessage, bodyMessage }) {
    return (React.createElement("div", { className: "card w-25 h-10 justify-content-center" },
        React.createElement("div", { className: "card-header" }, headerMessage),
        React.createElement("div", { className: "card-body" },
            React.createElement("p", { className: "card-text" }, bodyMessage))));
}
//# sourceMappingURL=InvalidCols.js.map