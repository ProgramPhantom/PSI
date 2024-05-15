import React, { ReactElement, PropsWithChildren } from 'react';
import {useDraggable} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';


function SortableItem(props: PropsWithChildren<{id: string}>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: 100, height: 100, fill: "red", background: "red"
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.id}
    </div>
  );
}

export default SortableItem