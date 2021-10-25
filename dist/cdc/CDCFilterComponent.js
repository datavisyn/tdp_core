import produce from "immer";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FilterCard } from "./FilterCard";
import { getFilterFromTree } from "./interface";
import { v4 as uuidv4 } from 'uuid';
export function CDCFilterComponent({ filterSelection, filter, setFilter, filterComponents, disableFilter }) {
    const onDelete = (newFilter) => {
        setFilter((filter) => produce(filter, (nextFilter) => {
            const { current, parent } = getFilterFromTree(nextFilter, newFilter.id);
            if (current && parent && parent.children) {
                // Find the index of the current element in the parents children
                const deleteIndex = parent.children.indexOf(current);
                // Remove it from the current parent
                if (deleteIndex !== -1) {
                    parent.children.splice(deleteIndex, 1);
                }
            }
        }));
    };
    const onDrop = (item, { target, index }) => {
        // Add item to target children array
        setFilter((filter) => produce(filter, (nextFilter) => {
            // DANGER: BE SURE TO ONLY REFERENCE SOMETHING FROM nextFilter,
            // AND NOTHING FROM 'OUTSIDE' LIKE item, or target. THESE REFERENCES
            // ARE NOT UP-TO-DATE!
            var _a, _b, _c;
            // Find target in nextFilter
            const dropTarget = getFilterFromTree(nextFilter, target.id);
            const dropItem = getFilterFromTree(nextFilter, item.id);
            // Check if the dropped item is part of the tree already
            if (dropItem.current) {
                // If we have a parent to remove us from...
                if ((_a = dropItem.parent) === null || _a === void 0 ? void 0 : _a.children) {
                    // Find the index of the current element in the parents children
                    const deleteIndex = dropItem.parent.children.indexOf(dropItem.current);
                    // Remove it from the current parent
                    if (deleteIndex !== -1) {
                        (_c = (_b = dropItem.parent) === null || _b === void 0 ? void 0 : _b.children) === null || _c === void 0 ? void 0 : _c.splice(deleteIndex, 1);
                    }
                }
            }
            else {
                // Otherwise, it is a new item to be added in the next step
                dropItem.current = { ...item, id: uuidv4() };
            }
            if (dropTarget.current) {
                // Next, add it as target child
                if (!dropTarget.current.children) {
                    dropTarget.current.children = [];
                }
                dropTarget.current.children.splice(index, 0, dropItem.current);
            }
            else {
                console.error('Something is wrong');
            }
        }));
    };
    const onChange = (newFilter, changeFunc) => {
        setFilter((filter) => produce(filter, (nextFilter) => {
            const { current, parent } = getFilterFromTree(nextFilter, newFilter.id);
            if (current) {
                changeFunc(current);
            }
        }));
    };
    const onValueChanged = (filter, value) => {
        onChange(filter, (f) => {
            f.componentValue = value;
        });
    };
    return (React.createElement(DndProvider, { backend: HTML5Backend },
        React.createElement("div", { className: "row" },
            React.createElement("div", { className: "col-md" },
                React.createElement("h6", null, "Your filters"),
                React.createElement(FilterCard, { filter: filter, onDrop: onDrop, onDelete: onDelete, onChange: onChange, onValueChanged: onValueChanged, filterComponents: filterComponents, disableFilter: disableFilter })),
            filterSelection ?
                React.createElement("div", { className: "col-md" },
                    React.createElement("h6", null, "New filters"),
                    filterSelection.map((f) => (React.createElement(FilterCard, { key: f.id, filter: f, filterComponents: filterComponents, disableFilter: disableFilter }))))
                : null)));
}
//# sourceMappingURL=CDCFilterComponent.js.map