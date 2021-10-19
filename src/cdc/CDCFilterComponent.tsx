import produce from "immer";
import React from "react";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {createCDCCheckboxFilter} from "./CDCCheckboxFilter";
import {createCDCGroupingFilter} from "./CDCGroupingFilter";
import {createCDCRangeFilter} from "./CDCRangeFilter";
import {createCDCTextFilter} from "./CDCTextFilter";
import {FilterCard} from "./FilterCard";
import {getFilterFromTree, getTreeQuery, IFilter} from "./interface";
import { v4 as uuidv4 } from 'uuid';

export function CDCFilterComponent() {

  const [filters, setFilters] = React.useState<IFilter>(
    {
      ...createCDCGroupingFilter(uuidv4(),
      'Drop filters here'),
      disableDragging: true,
      disableRemoving: true
    }
  );

  React.useEffect(() => {
    const test = getTreeQuery(filters);
    if (test) {
      console.log(test);
    }
  }, [filters]);

  const filterSelection: IFilter<any>[] = [
    createCDCGroupingFilter(uuidv4(), 'Grouping Filter'),
    createCDCTextFilter(uuidv4(), 'Text Filter', {filter: [{field: 'field1', value: []}], fields:[{field: 'field1', options: ['hallo', 'hier', 'steht', 'text']}, {field: 'field2', options: ['tschüss', 'hier', 'nicht']}, {field: 'field3', options: ['test', 'noch ein test', 'hi']}]}),
    createCDCCheckboxFilter(uuidv4(), 'Checkbox Filter', {fields: ['Eins', 'zwei', 'dRei'], filter: []}),
    createCDCRangeFilter(uuidv4(), 'Range Filter', {min: 1950, max: 2021}),
  ];

  const onDelete = (filter: IFilter) => {
    setFilters(
      produce(filters, (nextFilters) => {
        const { current, parent } = getFilterFromTree(nextFilters, filter.id);
        if (current && parent && parent.children) {
          // Find the index of the current element in the parents children
          const deleteIndex = parent.children.indexOf(current);
          // Remove it from the current parent
          if (deleteIndex !== -1) {
            parent.children.splice(deleteIndex, 1);
          }
        }
      })
    );
  };

  const onDrop = (
    item: IFilter,
    { target, index }: { target: IFilter; index: number }
  ) => {
    // Add item to target children array
    setFilters((filters) =>
      produce(filters, (nextFilters) => {
        // DANGER: BE SURE TO ONLY REFERENCE SOMETHING FROM nextFilters,
        // AND NOTHING FROM 'OUTSIDE' LIKE item, or target. THESE REFERENCES
        // ARE NOT UP-TO-DATE!

        // Find target in nextFilters
        const dropTarget = getFilterFromTree(nextFilters, target.id);
        const dropItem = getFilterFromTree(nextFilters, item.id);

        // Check if the dropped item is part of the tree already
        if (dropItem.current) {
          // If we have a parent to remove us from...
          if (dropItem.parent?.children) {
            // Find the index of the current element in the parents children
            const deleteIndex = dropItem.parent.children.indexOf(
              dropItem.current
            );
            // Remove it from the current parent
            if (deleteIndex !== -1) {
              dropItem.parent?.children?.splice(deleteIndex, 1);
            }
          }
        } else {
          // Otherwise, it is a new item to be added in the next step
          dropItem.current = { ...item, id: uuidv4() };
        }

        if (dropTarget.current) {
          // Next, add it as target child
          if (!dropTarget.current.children) {
            dropTarget.current.children = [];
          }
          dropTarget.current.children.splice(index, 0, dropItem.current);
        } else {
          console.error('Something is wrong');
        }
      })
    );
  };

  const onChange = (filter: IFilter, changeFunc: (filter: IFilter) => void) => {
    setFilters(
      produce(filters, (nextFilters) => {
        const { current, parent } = getFilterFromTree(nextFilters, filter.id);
        if (current) {
          changeFunc(current);
        }
      })
    );
  };

  const onValueChanged = (filter: IFilter, value: any) => {
    onChange(filter, (f) => {
      if (f.component) {
        f.component.value = value;
      }
    });
  };
  
  return (
  <DndProvider backend={HTML5Backend}>
    <div className="row">
        <div className="col-md">
        <h6>Your filters</h6>
        <FilterCard
            filter={filters}
            onDrop={onDrop}
            onDelete={onDelete}
            onChange={onChange}
            onValueChanged={onValueChanged}
        />
        </div>
        <div className="col-md">
        <h6>New filters</h6>
            {filterSelection.map((f) => (
            <FilterCard key={f.id} filter={f} />
            ))}
        </div>
    </div>
  </DndProvider>
  )
}
