import type { CSSProperties, FC } from 'react'
import { memo, useEffect, useState } from 'react'
import { Visual } from '../vanilla/visual'
import { Element } from '@svgdotjs/svg.js'



export interface IElementDragPreviewProps {
    element: Visual
}

/* This is the custom drag preview. It is what you see while you are dragging. */
export const ElementDragPreview: FC<IElementDragPreviewProps> = memo(
  function ElementDragPreview(props: IElementDragPreviewProps) {
    var visual = props.element.getInternalRepresentation();

    return (
      <div style={{display: 'inline-block', background: "rgba(255, 211, 92, 0.66)"}} >
        <svg style={{width: props.element.contentWidth, height: props.element.contentHeight}} pointerEvents={"none"}
          dangerouslySetInnerHTML={{__html: visual?.node.outerHTML!}}></svg>
      </div>
    )
  },
)
