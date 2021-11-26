import * as React from 'react';
export function ErrorMessage({ error, onRetry }) {
    return error ? (React.createElement("div", { className: "alert alert-danger flex-fill d-flex align-items-center", role: "alert" },
        React.createElement("i", { className: "fas fa-exclamation-triangle text-danger me-1" }),
        React.createElement("div", { className: "flex-fill" }, error.message),
        onRetry ? (React.createElement("button", { type: "button", className: "btn btn-sm btn-outline-danger", onClick: onRetry }, "Retry")) : null)) : null;
}
//# sourceMappingURL=ErrorMessage.js.map