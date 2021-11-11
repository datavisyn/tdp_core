import * as React from 'react';
import { getFilterFromTree, IFilter, itemTypes } from '../interfaces';
import { useDrop } from 'react-dnd';

interface IDropZoneProps {
  // TODO: Typings
  onDrop: any;
  canDrop: boolean;
  filter: IFilter;
  index: number;
}

export function DropZone({canDrop, onDrop, filter, index}: IDropZoneProps) {
  // TODO: Add proper types such that draggedItem can be infered
  const [{ isOver, draggedItem }, drop] = useDrop(
    () => ({
      accept: itemTypes.FILTERCARD,
      drop: (item: IFilter, monitor) => {
        onDrop(item, { target: filter, index });
      },
      canDrop: (item: IFilter) => canDrop,
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        draggedItem: (monitor.getItem() as unknown) as IFilter | undefined
      })
    }),
    []
  );

  // Check if the dragged item is actually our parent, because then we are no target
  const isDraggedItemParent = React.useMemo(() => {
    // If we can find the current filter given our dragged item as parent, we are a child
    return draggedItem && !!getFilterFromTree(draggedItem, filter.id).current;
  }, [draggedItem, filter]);

  const isVisible =
    !isDraggedItemParent && draggedItem !== filter && draggedItem && canDrop;

  return (
    <div
      ref={drop}
      style={{ opacity: 0.1 }}
      className={`border mt-1 mb-1 ${
        isVisible && isOver ? 'bg-primary' : isVisible ? 'bg-dark' : ''
      }`}
    >
      <>&nbsp;</>
    </div>
  );
}
