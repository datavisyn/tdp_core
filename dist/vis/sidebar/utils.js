import * as React from 'react';
import Highlighter from 'react-highlight-words';
export const formatOptionLabel = (option, ctx) => {
    return (React.createElement(React.Fragment, null,
        React.createElement(Highlighter, { searchWords: [ctx.inputValue], autoEscape: true, textToHighlight: option.name }),
        option.description && React.createElement("span", { className: "small text-muted ms-1" }, option.description)));
};
export function getCol(columns, info) {
    if (!info) {
        return null;
    }
    return columns.filter((c) => c.info.id === info.id)[0];
}
//# sourceMappingURL=utils.js.map