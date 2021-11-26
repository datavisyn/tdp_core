import * as React from 'react';
import { getFilterFromTree, ITEM_TYPES } from '../interfaces';
import { useDrop } from 'react-dnd';
export function DropZone({ canDrop, onDrop, filter, index }) {
    const [{ isOver, draggedItem }, drop] = useDrop(() => ({
        accept: ITEM_TYPES.FILTERCARD,
        drop: (item) => {
            onDrop(item, { target: filter, index });
        },
        canDrop: () => canDrop,
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            draggedItem: monitor.getItem()
        })
    }), [canDrop, onDrop, filter, index]);
    // Check if the dragged item is actually our parent, because then we are no target
    const isDraggedItemParent = React.useMemo(() => {
        // If we can find the current filter given our dragged item as parent, we are a child
        return draggedItem && !!getFilterFromTree(draggedItem, filter.id).current;
    }, [draggedItem, filter]);
    const isVisible = !isDraggedItemParent && draggedItem !== filter && draggedItem && canDrop;
    return (React.createElement("div", { ref: drop, style: { opacity: 0.1 }, className: `border mt-1 mb-1 ${isVisible && isOver ? 'bg-primary' : isVisible ? 'bg-dark' : ''}` },
        React.createElement(React.Fragment, null, "\u00A0")));
}
//# sourceMappingURL=DropZone.js.map