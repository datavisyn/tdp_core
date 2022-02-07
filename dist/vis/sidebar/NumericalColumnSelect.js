import * as React from 'react';
import Select, { components } from 'react-select';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { EColumnTypes } from '../interfaces';
import { formatOptionLabel } from './utils';
function arrayMove(array, from, to) {
    const slicedArray = array.slice();
    slicedArray.splice(to < 0 ? array.length + to : to, 0, slicedArray.splice(from, 1)[0]);
    return slicedArray;
}
// tslint:disable-next-line:variable-name
const SortableMultiValue = SortableElement((props) => {
    // this prevents the menu from being opened/closed when the user clicks
    // on a value to begin dragging it. ideally, detecting a click (instead of
    // a drag) would still focus the control and toggle the menu
    const onMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const innerProps = { ...props.innerProps, onMouseDown };
    return React.createElement(components.MultiValue, Object.assign({}, props, { innerProps: innerProps }));
});
// tslint:disable-next-line:variable-name
const SortableMultiValueLabel = SortableHandle((props) => React.createElement(components.MultiValueLabel, Object.assign({}, props)));
// tslint:disable-next-line:variable-name
const SortableSelect = SortableContainer(Select);
export function NumericalColumnSelect(props) {
    const selectNumOptions = React.useMemo(() => {
        return props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => c.info);
    }, [props.columns.length]);
    const onSortEnd = ({ oldIndex, newIndex }) => {
        const newValue = arrayMove(props.currentSelected, oldIndex, newIndex);
        props.callback(newValue);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Numerical Columns"),
        React.createElement(SortableSelect, { useDragHandle: true, axis: "xy", onSortEnd: onSortEnd, distance: 4, getHelperDimensions: ({ node }) => node.getBoundingClientRect(), closeMenuOnSelect: false, isMulti: true, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, onChange: (e) => {
                props.callback(e.map((c) => c));
            }, components: {
                MultiValue: SortableMultiValue,
                MultiValueLabel: SortableMultiValueLabel,
            }, name: "numColumns", options: selectNumOptions, value: props.currentSelected })));
}
//# sourceMappingURL=NumericalColumnSelect.js.map