import * as React from 'react';
import {IFilter, IFilterComponent, itemTypes} from './interface';
import {useDrag} from 'react-dnd';
import {DropZone} from './DropZone';

interface IFilterCardProps {
  filter: IFilter;
  onDrop?: any;
  onDelete?: (filter: IFilter) => void;
  onChange?: (filter: IFilter, changeFunc: (filter: IFilter) => void) => void;
  onValueChanged?: (filter: IFilter, value: any) => void;
  filterComponents: {[key: string]: IFilterComponent<any>};
  disableFilter: boolean;
}

export function FilterCard({filter, onDrop, onDelete, onChange, onValueChanged, filterComponents, disableFilter}: IFilterCardProps) {
  const [{isDragging, draggedItem}, drag, preview] = useDrag(() => ({
    type: itemTypes.FILTERCARD,
    item: filter,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      draggedItem: (monitor.getItem() as unknown) as IFilter | undefined
    })
  }));

  const hasChildren = filter.children && filter.children.length >= 0;
  const filterComponent = filterComponents[filter.componentId];

  if (!filterComponent) {
    return <>ERROR!!</>;
  }

  return (
    <div
      className={`card mb-2 ${isDragging ? 'bg-light' : ''}`}
      ref={preview}
      style={filter.disableRemoving && filter.disableDragging ? {height: '93%'} : {}}
    >
      <div className="card-body">
        <h6
          ref={filter.disableDragging || disableFilter ? undefined : drag}
          className="card-title d-flex"
          style={filter.disableDragging || disableFilter ? {} : {cursor: 'move'}}
        >
          {filter.disableDragging || disableFilter ? null : (
            <i
              style={{marginRight: 5}}
              className="fas fa-arrows-alt"
            ></i>
          )}
          <span className="flex-fill">{filter.name}</span>
          <div>
            <div className="input-group">
              {onChange && hasChildren && filter?.children?.length > 1 ? (
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
                  <option value="NOT">NOT (AND)</option>
                </select>
              ) : null}
              {!filter.disableRemoving && onDelete && !disableFilter ? (
                <button
                  className="btn btn-text-secondary btn-sm"
                  onClick={() => onDelete(filter)}
                >
                  <i className="fas fa-times" />
                </button>
              ) : null}
            </div>
          </div>
        </h6>
        {/*<h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>*/}
        {/*<p className="card-text">
          Some quick example text to build on the card title and make up the
          bulk of the card's content.
          </p>*/}

        {filterComponent ? (
          <div>
            <filterComponent.clazz
              disabled={disableFilter}
              value={filter.componentValue}
              onValueChanged={
                onValueChanged
                  ? (value) => onValueChanged(filter, value)
                  : undefined
              }
            />
          </div>
        ) : null}
        {onDrop && (hasChildren || !filter.disableDropping) && !disableFilter ? (
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
  );
}
