import * as React from 'react';
import { itemTypes } from './interfaces';
import { useDrag } from 'react-dnd';
import { DropZone } from './DropZone';
export function FilterCard({ filter, onDrop, onDelete, onChange, onValueChanged, onFieldChanged, filterComponents, disableFilter, isInvalid, disableDragging, disableRemoving }) {
    var _a, _b, _c;
    const [{ isDragging, draggedItem }, drag, preview] = useDrag(() => ({
        type: itemTypes.FILTERCARD,
        item: filter,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
            draggedItem: monitor.getItem()
        })
    }));
    const hasChildren = filter.children && filter.children.length >= 0;
    const filterComponent = filterComponents[filter.type];
    if (!filterComponent) {
        return React.createElement(React.Fragment, null, "ERROR!!");
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: `card mb-2 ${isDragging ? 'bg-light' : ''}${isInvalid ? ' form-control is-invalid' : ''}`, ref: preview, style: disableRemoving && disableDragging ? { height: '93%' } : {} },
            React.createElement("div", { className: "card-body" },
                React.createElement("div", { className: "row" },
                    React.createElement("div", { className: "col-1 pe-0", style: disableDragging || disableFilter ? {} : { cursor: 'move' }, ref: disableDragging || disableFilter ? undefined : drag }, disableDragging || disableFilter ? null : (React.createElement("i", { style: { marginRight: 5 }, className: "fas fa-arrows-alt" }))),
                    React.createElement("div", { className: "col-10" }, (filterComponent === null || filterComponent === void 0 ? void 0 : filterComponent.component) ? (React.createElement("div", null,
                        React.createElement(filterComponent.component.clazz, { disabled: disableFilter, value: filter.value, config: filterComponent.config, field: filter.field, onFieldChanged: onFieldChanged
                                ? (field) => onFieldChanged(filter, field)
                                : undefined, onValueChanged: onValueChanged
                                ? (value) => onValueChanged(filter, value)
                                : undefined }),
                        filter.type === 'group' ?
                            React.createElement("div", { className: "input-group d-flex w-100 justify-content-between" },
                                React.createElement("h6", null, "Group Filter"),
                                onChange && hasChildren && ((_a = filter === null || filter === void 0 ? void 0 : filter.children) === null || _a === void 0 ? void 0 : _a.length) > 1 ? (React.createElement("small", null,
                                    React.createElement("select", { className: "form-select form-select-sm", style: { width: '6em' }, value: filter.operator || 'AND', disabled: disableFilter, onChange: (e) => {
                                            onChange(filter, (f) => {
                                                f.operator = e.currentTarget.value;
                                            });
                                        } },
                                        React.createElement("option", { value: "AND" }, "AND"),
                                        React.createElement("option", { value: "OR" }, "OR")))) : null) : null)) : null),
                    React.createElement("div", { className: "col-1 ps-0" }, !disableRemoving && onDelete && !disableFilter ? (React.createElement("button", { className: "btn btn-text-secondary btn-sm", onClick: () => onDelete(filter) },
                        React.createElement("i", { className: "fas fa-times" }))) : null)),
                onDrop && (hasChildren || !filterComponent.component.disableDropping) && !disableFilter ? (React.createElement(DropZone, { onDrop: onDrop, filter: filter, index: 0, canDrop: draggedItem !== ((_b = filter.children) === null || _b === void 0 ? void 0 : _b[0]) })) : null, (_c = filter.children) === null || _c === void 0 ? void 0 :
                _c.map((child, i, allChildren) => (React.createElement(React.Fragment, { key: child.id },
                    React.createElement(FilterCard, { key: child.id, filter: child, onDrop: onDrop, onDelete: onDelete, onValueChanged: onValueChanged, onFieldChanged: onFieldChanged, onChange: onChange, filterComponents: filterComponents, disableFilter: disableFilter }),
                    onDrop && hasChildren && !disableFilter ? (React.createElement(DropZone, { onDrop: onDrop, filter: filter, index: i + 1, canDrop: draggedItem !== allChildren[i + 1] && draggedItem !== child && !disableFilter })) : null))))),
        isInvalid ?
            React.createElement("div", { className: "invalid-feedback mb-2" }, "Filter must not be empty!") :
            null));
}
//# sourceMappingURL=FilterCard.js.map