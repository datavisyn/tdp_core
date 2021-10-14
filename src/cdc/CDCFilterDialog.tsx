import * as React from 'react';
import ReactDOM from 'react-dom';
import {BSModal, useBSModal, BSTooltip} from '../hooks';
import { getFilterFromTree, getTreeQuery, IFilter, IFilterComponent } from "./interface";
import { FilterCard } from "./FilterCard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import produce from "immer";
import { v4 as uuidv4 } from "uuid";
import {createCDCGroupingFilter} from './GroupingFilter';
import {createCDCTextFilter} from './TextFilter';
import {createCDCCheckboxFilter} from './CheckboxFilter';
import {createCDCRangeFilter} from './RangeFilter';

export function CDCFilterDialog() {
  const [filters, setFilters] = React.useState<IFilter>(
    {
      ...createCDCGroupingFilter(uuidv4(),
      "Drop filters here"),
      disableDragging: true,
      disableRemoving: true
    }
  );

  //TODO filters + setFilters als prop
  
  const filterSelection: IFilter<any>[] = [
    createCDCGroupingFilter(uuidv4(), "grouping-filter"),
    createCDCTextFilter(uuidv4(), "text-filter", {filter: [{field: "field1", value: []}], fields:[{field: "field1", options: ["hallo", "hier", "steht", "text"]}, {field: "field2", options: ["tschüss", "hier", "nicht"]}, {field: "field3", options: ["test", "noch ein test", "hi"]}]}),
    createCDCCheckboxFilter(uuidv4(), "checkbox-filter", {fields: ["Eins", "zwei", "dRei"], filter: []}),
    createCDCRangeFilter(uuidv4(), "range-filter", {min: 1950, max: 2021}),
  ];
  
  React.useEffect(() => {
    const test = getTreeQuery(filters);
    if (test) {
      console.log(test);
    }
  }, [filters]);
  
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
        // AND NOTHING FROM "OUTSIDE" LIKE item, or target. THESE REFERENCES
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
          console.error("Something is wrong");
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

  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  
  return <div>
      <a href="#" style={{marginTop: 5, color: "white", cursor: "pointer"}} onClick={() => setShowDialog(true)}><i className="fas fa-filter" style={{marginRight: 4}}></i> Alert Filter</a>
      <BSModal show={showDialog}>
        <div className="modal fade" tabIndex={-1}>
          <div className="modal-dialog" style={{maxWidth: "90%"}}>
            <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Modal title</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <DndProvider backend={HTML5Backend}>
                <div className="row">
                  <div className="col-md">
                    <h5>Your filters</h5>
                    <FilterCard
                      filter={filters}
                      onDrop={onDrop}
                      onDelete={onDelete}
                      onChange={onChange}
                      onValueChanged={onValueChanged}
                    />
                  </div>
                  <div className="col-md">
                    <h5>Add new filters</h5>
                    {filterSelection.map((f) => (
                      <FilterCard key={f.id} filter={f} />
                    ))}
                  </div>
                </div>
              </DndProvider>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Save changes</button>
            </div>
            </div>
          </div>
        </div>
      </BSModal>
  </div>
}

export class CDCFilterDialogClass {
  private node: HTMLElement;

  constructor(parent: HTMLElement) {
    this.node = document.createElement("ul");
    this.node.classList.add("navbar-nav");
    parent.appendChild(this.node);
    this.init();
  }

  private init() {
    ReactDOM.render(
      <CDCFilterDialog />,
      this.node
    );
  }
}