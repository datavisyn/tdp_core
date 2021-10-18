import * as React from 'react';
import { itemTypes } from './interface';
import { useDrag } from 'react-dnd';
import { DropZone } from './DropZone';
export function FilterCard({ filter, onDrop, onDelete, onChange, onValueChanged }) {
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
    return (React.createElement("div", { className: `card mb-2 ${isDragging ? 'bg-light' : ''}`, ref: preview, style: filter.disableRemoving && filter.disableDragging ? { height: '93%' } : {} },
        React.createElement("div", { className: "card-body" },
            React.createElement("h6", { ref: filter.disableDragging ? undefined : drag, className: "card-title d-flex", style: filter.disableDragging ? {} : { cursor: 'move' } },
                filter.disableDragging ? null : (React.createElement("i", { style: { marginRight: 5 }, className: "fas fa-arrows-alt" })),
                React.createElement("span", { className: "flex-fill" }, filter.name),
                React.createElement("div", null,
                    React.createElement("div", { className: "input-group" },
                        onChange && hasChildren && ((_a = filter === null || filter === void 0 ? void 0 : filter.children) === null || _a === void 0 ? void 0 : _a.length) > 1 ? (React.createElement("select", { className: "form-select form-select-sm", style: { width: '6em' }, value: filter.operator || 'AND', onChange: (e) => {
                                onChange(filter, (f) => {
                                    f.operator = e.currentTarget.value;
                                });
                            } },
                            React.createElement("option", { value: "AND" }, "AND"),
                            React.createElement("option", { value: "OR" }, "OR"),
                            React.createElement("option", { value: "NOT" }, "NOT (AND)"))) : null,
                        !filter.disableRemoving && onDelete ? (React.createElement("button", { className: "btn btn-danger btn-sm", onClick: () => onDelete(filter) },
                            React.createElement("i", { className: "fas fa-times" }))) : null))),
            filter.component ? (React.createElement("div", null,
                React.createElement(filter.component.clazz, { value: filter.component.value, onValueChanged: onValueChanged
                        ? (value) => onValueChanged(filter, value)
                        : undefined }))) : null,
            onDrop && (hasChildren || !filter.disableDropping) ? (React.createElement(DropZone, { onDrop: onDrop, filter: filter, index: 0, canDrop: draggedItem !== ((_b = filter.children) === null || _b === void 0 ? void 0 : _b[0]) })) : null, (_c = filter.children) === null || _c === void 0 ? void 0 :
            _c.map((child, i, allChildren) => (React.createElement(React.Fragment, { key: child.id },
                React.createElement(FilterCard, { key: child.id, filter: child, onDrop: onDrop, onDelete: onDelete, onValueChanged: onValueChanged, onChange: onChange }),
                onDrop && hasChildren ? (React.createElement(DropZone, { onDrop: onDrop, filter: filter, index: i + 1, canDrop: draggedItem !== allChildren[i + 1] && draggedItem !== child })) : null))))));
}
//# sourceMappingURL=FilterCard.js.map