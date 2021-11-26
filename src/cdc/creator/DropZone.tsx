import * as React from 'react';
import { getFilterFromTree, IFilter, ITEM_TYPES } from '../interfaces';
import { useDrop } from 'react-dnd';

interface IDropZoneProps {
  onDrop: (item: IFilter, {target, index}: {target: IFilter; index: number}) => void;
  canDrop: boolean;
  filter: IFilter;
  index: number;
}

export function DropZone({canDrop, onDrop, filter, index}: IDropZoneProps) {
  const [{ isOver, draggedItem }, drop] = useDrop<IFilter, void, {
    isOver: boolean;
    draggedItem: IFilter | undefined
  }>(
    () => ({
      accept: ITEM_TYPES.FILTERCARD,
      drop: (item) => {
        onDrop(item, { target: filter, index });
      },
      canDrop: () => canDrop,
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        draggedItem: monitor.getItem()
      })
    }),
    [canDrop, onDrop, filter, index]
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
