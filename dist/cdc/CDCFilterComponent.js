import produce from "immer";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createCDCCheckboxFilter } from "./CDCCheckboxFilter";
import { createCDCGroupingFilter } from "./CDCGroupingFilter";
import { createCDCRangeFilter } from "./CDCRangeFilter";
import { createCDCTextFilter } from "./CDCTextFilter";
import { FilterCard } from "./FilterCard";
import { getFilterFromTree, getTreeQuery } from "./interface";
import { v4 as uuidv4 } from 'uuid';
export function CDCFilterComponent() {
    const [filters, setFilters] = React.useState({
        ...createCDCGroupingFilter(uuidv4(), 'Drop filters here'),
        disableDragging: true,
        disableRemoving: true
    });
    React.useEffect(() => {
        const test = getTreeQuery(filters);
        if (test) {
            console.log(test);
        }
    }, [filters]);
    const filterSelection = [
        createCDCGroupingFilter(uuidv4(), 'Grouping Filter'),
        createCDCTextFilter(uuidv4(), 'Text Filter', { filter: [{ field: 'field1', value: [] }], fields: [{ field: 'field1', options: ['hallo', 'hier', 'steht', 'text'] }, { field: 'field2', options: ['tschüss', 'hier', 'nicht'] }, { field: 'field3', options: ['test', 'noch ein test', 'hi'] }] }),
        createCDCCheckboxFilter(uuidv4(), 'Checkbox Filter', { fields: ['Eins', 'zwei', 'dRei'], filter: [] }),
        createCDCRangeFilter(uuidv4(), 'Range Filter', { min: 1950, max: 2021 }),
    ];
    const onDelete = (filter) => {
        setFilters(produce(filters, (nextFilters) => {
            const { current, parent } = getFilterFromTree(nextFilters, filter.id);
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
        setFilters((filters) => produce(filters, (nextFilters) => {
            // DANGER: BE SURE TO ONLY REFERENCE SOMETHING FROM nextFilters,
            // AND NOTHING FROM 'OUTSIDE' LIKE item, or target. THESE REFERENCES
            // ARE NOT UP-TO-DATE!
            var _a, _b, _c;
            // Find target in nextFilters
            const dropTarget = getFilterFromTree(nextFilters, target.id);
            const dropItem = getFilterFromTree(nextFilters, item.id);
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
    const onChange = (filter, changeFunc) => {
        setFilters(produce(filters, (nextFilters) => {
            const { current, parent } = getFilterFromTree(nextFilters, filter.id);
            if (current) {
                changeFunc(current);
            }
        }));
    };
    const onValueChanged = (filter, value) => {
        onChange(filter, (f) => {
            if (f.component) {
                f.component.value = value;
            }
        });
    };
    return (React.createElement(DndProvider, { backend: HTML5Backend },
        React.createElement("div", { className: "row" },
            React.createElement("div", { className: "col-md" },
                React.createElement("h6", null, "Your filters"),
                React.createElement(FilterCard, { filter: filters, onDrop: onDrop, onDelete: onDelete, onChange: onChange, onValueChanged: onValueChanged })),
            React.createElement("div", { className: "col-md" },
                React.createElement("h6", null, "New filters"),
                filterSelection.map((f) => (React.createElement(FilterCard, { key: f.id, filter: f })))))));
}
//# sourceMappingURL=CDCFilterComponent.js.map