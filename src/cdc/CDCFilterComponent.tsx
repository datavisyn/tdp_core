import produce from 'immer';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {FilterCard} from './FilterCard';
import {getFilterFromTree, IFilter, IFilterComponent} from './interface';
import {v4 as uuidv4} from 'uuid';

interface ICDCFilterComponentProps {
  filterSelection?: IFilter<any>[];
  filter: IFilter;
  setFilter: React.Dispatch<React.SetStateAction<IFilter>>;
  filterComponents: {[key: string]: IFilterComponent<any>};
  disableFilter?: boolean;
}

export function CDCFilterComponent({filterSelection, filter, setFilter, filterComponents, disableFilter}: ICDCFilterComponentProps) {
  const onDelete = (newFilter: IFilter) => {
    setFilter((filter) => produce(filter, (nextFilter) => {
      const {current, parent} = getFilterFromTree(nextFilter, newFilter.id);
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
    {target, index}: {target: IFilter; index: number}
  ) => {
    // Add item to target children array
    setFilter((filter) => produce(filter, (nextFilter) => {
      // DANGER: BE SURE TO ONLY REFERENCE SOMETHING FROM nextFilter,
      // AND NOTHING FROM 'OUTSIDE' LIKE item, or target. THESE REFERENCES
      // ARE NOT UP-TO-DATE!

      // Find target in nextFilter
      const dropTarget = getFilterFromTree(nextFilter, target.id);
      const dropItem = getFilterFromTree(nextFilter, item.id);

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
        dropItem.current = {...item, id: uuidv4()};
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
    }));
  };

  const onChange = (newFilter: IFilter, changeFunc: (filter: IFilter) => void) => {
    setFilter((filter) => produce(filter, (nextFilter) => {
      const {current, parent} = getFilterFromTree(nextFilter, newFilter.id);
      if (current) {
        changeFunc(current);
      }
    }));
  };

  const onValueChanged = (filter: IFilter, value: any) => {
    onChange(filter, (f) => {
      f.componentValue = value;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="row">
        <div className="col-md">
          <h6>Your filters</h6>
          <FilterCard
            filter={filter}
            onDrop={onDrop}
            onDelete={onDelete}
            onChange={onChange}
            onValueChanged={onValueChanged}
            filterComponents={filterComponents}
            disableFilter={disableFilter}
          />
        </div>
        {filterSelection ?
          <div className="col-md">
            <h6>New filters</h6>
            {filterSelection.map((f) => (
              <FilterCard key={f.id} filter={f} filterComponents={filterComponents} disableFilter={disableFilter} />
            ))}
          </div>
          : null}
      </div>
    </DndProvider>
  );
}
