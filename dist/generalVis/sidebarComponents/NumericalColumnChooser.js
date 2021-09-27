import * as React from 'react';
import { useMemo } from 'react';
import Highlighter from 'react-highlight-words';
import Select from 'react-select';
import { EColumnTypes } from '../types/generalTypes';
export function NumericalColumnChooser(props) {
    const selectNumOptions = useMemo(() => {
        return props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => c.info);
    }, [props.columns.length]);
    const formatOptionLabel = (option, ctx) => {
        return (React.createElement(React.Fragment, null,
            React.createElement(Highlighter, { searchWords: [ctx.inputValue], autoEscape: true, textToHighlight: option.name }),
            option.description &&
                React.createElement("span", { className: "small text-muted ms-1" }, option.description)));
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Numerical Columns"),
        React.createElement(Select, { closeMenuOnSelect: false, isMulti: true, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, onChange: (e) => props.callback(e.map((c) => c)), name: "numColumns", options: selectNumOptions, value: selectNumOptions.filter((c) => props.currentSelected.filter((d) => d.id === c.id).length > 0) })));
}
//# sourceMappingURL=NumericalColumnChooser.js.map