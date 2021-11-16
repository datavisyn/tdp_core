import * as React from 'react';
import {IFilter, IFilterComponent, itemTypes} from '../interfaces';
import {useDrag} from 'react-dnd';
import {DropZone} from './DropZone';

interface IFilterCardProps {
  filter: IFilter;
  onDrop?: any;
  onDelete?: (filter: IFilter) => void;
  onChange?: (filter: IFilter, changeFunc: (filter: IFilter) => void) => void;
  onValueChanged?: (filter: IFilter, value: any) => void;
  onFieldChanged?: (filter: IFilter, field: any) => void;
  filterComponents: {[key: string]: {component: IFilterComponent<any>, config?: any}};
  disableFilter: boolean;
  isInvalid?: boolean;
  disableRemoving?: boolean;
  disableDragging?: boolean;
}

export function FilterCard({filter, onDrop, onDelete, onChange, onValueChanged, onFieldChanged, filterComponents, disableFilter, isInvalid, disableDragging, disableRemoving}: IFilterCardProps) {
  const [{isDragging, draggedItem}, drag, preview] = useDrag(() => ({
    type: itemTypes.FILTERCARD,
    item: filter,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      draggedItem: (monitor.getItem() as unknown) as IFilter | undefined
    })
  }), [filter, onDrop, onDelete, onChange, onValueChanged, onFieldChanged, filterComponents]);

  const hasChildren = filter.children && filter.children.length >= 0;
  const filterComponent = filterComponents[filter.type];

  if (!filterComponent) {
    return <>ERROR!!</>;
  }

  return (<>
    <div
      className={`card mb-2 ${isDragging ? 'bg-light' : ''}${isInvalid ? ' form-control is-invalid' : ''}`}
      ref={preview}
      style={disableRemoving && disableDragging ? {height: '93%'} : {}}
    >
      <div className="card-body">
        <div className="row">
          <div className="col-1 pe-0"
            style={disableDragging || disableFilter ? {} : {cursor: 'move'}}
            ref={disableDragging || disableFilter ? undefined : drag}
          >
            {disableDragging || disableFilter ? null : (
              <i
                style={{marginRight: 5}}
                className="fas fa-arrows-alt"
              ></i>
            )}
          </div>
          <div className="col-10">
            {filterComponent?.component ? (
              <div>
                <filterComponent.component.clazz
                  disabled={disableFilter}
                  value={filter.value}
                  config={filterComponent.config}
                  field={filter.field}
                  onFieldChanged={
                    onFieldChanged
                      ? (field) => onFieldChanged(filter, field)
                      : undefined
                  }
                  onValueChanged={
                    onValueChanged
                      ? (value) => onValueChanged(filter, value)
                      : undefined
                  }
                />
                {filter.type === 'group' ?
                  <div className="input-group d-flex w-100 justify-content-between">
                    <h6>Group Filter</h6>
                    {onChange && hasChildren && filter?.children?.length > 1 ? (
                      <small>
                        <select
                          className="form-select form-select-sm"
                          style={{width: '6em'}}
                          value={filter.operator || 'AND'}
                          disabled={disableFilter}
                          onChange={(e) => {
                            onChange(filter, (f) => {
                              f.operator = e.currentTarget.value as any;
                            });
                          }}
                        >
                          <option value="AND">AND</option>
                          <option value="OR">OR</option>
                        </select>
                      </small>
                    ) : null}
                  </div> : null}
              </div>
            ) : null}
          </div>
          <div className="col-1 ps-0">
            {!disableRemoving && onDelete && !disableFilter ? (
              <button
                className="btn btn-text-secondary btn-sm"
                onClick={() => onDelete(filter)}
              >
                <i className="fas fa-times" />
              </button>
            ) : null}
          </div>
        </div>
        {onDrop && (hasChildren || !filterComponent.component.disableDropping) && !disableFilter ? (
          <DropZone
            onDrop={onDrop}
            filter={filter}
            index={0}
            canDrop={draggedItem !== filter.children?.[0]}
          />
        ) : null}
        {filter.children?.map((child, i, allChildren) => (
          <React.Fragment key={child.id}>
            <FilterCard
              key={child.id}
              filter={child}
              onDrop={onDrop}
              onDelete={onDelete}
              onValueChanged={onValueChanged}
              onFieldChanged={onFieldChanged}
              onChange={onChange}
              filterComponents={filterComponents}
              disableFilter={disableFilter}
            />
            {onDrop && hasChildren && !disableFilter ? (
              <DropZone
                onDrop={onDrop}
                filter={filter}
                index={i + 1}
                canDrop={
                  draggedItem !== allChildren[i + 1] && draggedItem !== child && !disableFilter
                }
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
    {isInvalid ?
      <div className="invalid-feedback mb-2">
        Filter must not be empty!
      </div> :
      null}
  </>);
}
