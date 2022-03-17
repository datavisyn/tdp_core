import * as React from 'react';
import Select, { components } from 'react-select';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { formatOptionLabel } from './utils';
function arrayMove(array, from, to) {
    const slicedArray = array.slice();
    slicedArray.splice(to < 0 ? array.length + to : to, 0, slicedArray.splice(from, 1)[0]);
    return slicedArray;
}
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
const SortableMultiValueLabel = SortableHandle((props) => React.createElement(components.MultiValueLabel, Object.assign({}, props)));
const SortableSelect = SortableContainer(Select);
export function AllColumnSelect({ callback, columns, currentSelected }) {
    const selectNumOptions = React.useMemo(() => {
        return columns.map((c) => c.info);
    }, [columns]);
    const onSortEnd = ({ oldIndex, newIndex }) => {
        const newValue = arrayMove(currentSelected, oldIndex, newIndex);
        callback(newValue);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Columns"),
        React.createElement(SortableSelect, { useDragHandle: true, axis: "xy", onSortEnd: onSortEnd, distance: 4, getHelperDimensions: ({ node }) => node.getBoundingClientRect(), closeMenuOnSelect: false, isMulti: true, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, onChange: (newValue) => {
                callback(newValue);
            }, components: {
                MultiValue: SortableMultiValue,
                MultiValueLabel: SortableMultiValueLabel,
            }, name: "numColumns", options: selectNumOptions, value: currentSelected })));
}
//# sourceMappingURL=AllColumnSelect.js.map