import type { CSSProperties, FC } from 'react'
import { memo, useEffect, useState } from 'react'
import { Visual } from '../vanilla/visual'



export interface IElementDragPreviewProps {
    element: Visual
}


export const ElementDragPreview: FC<IElementDragPreviewProps> = memo(
  function ElementDragPreview(props: IElementDragPreviewProps) {
    var copy = props.element.svg?.clone(true, true)
    copy?.x(0);
    copy?.y(0);
    copy?.show();

    return (
      <div style={{display: 'inline-block', background: "rgba(255, 211, 92, 0.66)"}} >
        <svg style={{width: props.element.contentWidth, height: props.element.contentHeight}} pointerEvents={"none"}
          dangerouslySetInnerHTML={{__html: copy?.node.outerHTML!}}></svg>
      </div>
    )
  },
)
