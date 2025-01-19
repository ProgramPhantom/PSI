import React, {useEffect, useState, useRef, useLayoutEffect, ReactNode, ReactElement, useSyncExternalStore, DOMElement} from 'react'
import DropField from './dnd/DropField';
import { Visual } from './vanilla/visual';
import Positional from './vanilla/positional';
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch"
import { CanvasDragLayer } from './dnd/CanvasDragLayer';
import { CanvasDropContainer } from './dnd/CanvasDropContainer';
import CanvasDraggableElement from './dnd/CanvasDraggableElement';
import ENGINE from './vanilla/engine';


interface ICanvasProps {
    select: (element?: Positional<Visual>) => void
}

const Canvas: React.FC<ICanvasProps> = (props) => {
    console.log("CREATING CANVAS")
    useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot)

    const [zoom, setZoom] = useState(5);
    const [dragging, setDragging] = useState(false);
    const [panning, setPanning] = useState(false);
    const [selectedElement, setSelectedElement] = useState<Visual | undefined>(undefined);

    function canvasClicked(click: React.MouseEvent<HTMLDivElement>) {

        var targetId: string | undefined;
        if ((click.target as HTMLDivElement).tagName === "path") {
            targetId = (click.target as HTMLDivElement).parentElement?.id;
        } else {
            targetId = (click.target as HTMLDivElement).id;
        }


        if (targetId === undefined) { 
            console.warn(`Cannot find id for ${click}`);
            return
        }
        
        var element: Positional<Visual> | undefined = ENGINE.handler.selectPositional(targetId);

        console.log("mouse down")
        console.log(element)
        console.log(targetId)
        if (element === undefined && selectedElement !== undefined) { // Clicking off
            
            selectedElement!.svg?.show();
            setSelectedElement(undefined)
            setDragging(false)

        } else if (element !== undefined && selectedElement !== undefined) {  // Click straight to a new element
            selectedElement!.svg?.show();
            setSelectedElement(element.element!)
            element?.element.svg?.hide();
            
            
        } else if (element !== undefined) { // From nothing selected to element
            setSelectedElement(element.element!)
            element?.element.svg?.hide();
            
        }
        
        
        if (element !== undefined) {
            props.select(element)
        } else {
            props.select(undefined)
        }
        // MountSequence();
    }

    return (
        <>
        {/* width: "0px", height: "0px", visibility: "hidden"*/}
        <div id={"drawDiv"} style={{width: "0px", height: "0px", visibility: "hidden"}}></div>


        <div style={{width: "100%", height: "100%",  display: "flex"}} 
                onMouseUp={(e) => {canvasClicked(e); }}
                onDragEnd={() => {setDragging(false)}}
                >

            <CanvasDropContainer >
                <TransformWrapper initialScale={zoom} onZoomStop={(z) => {setZoom(z.state.scale)}}
                                centerOnInit={true} 
                                limitToBounds={false} 
                                centerZoomedOut={true}
                                disabled={dragging}
                                onPanningStart={() => {setPanning(true)}}
                                onPanningStop={() => {setPanning(false)}}
                                >
                    <TransformComponent wrapperStyle={{width: "100%", height: "100%"}}>
                        <div style={{width: "100%", height: "100%", display: "inline-block", position: "relative"}}>
                            
                                <div dangerouslySetInnerHTML={{"__html": ENGINE.surface.node.outerHTML}}>
                                    
                                </div>
                                <DropField sequence={ENGINE.handler}></DropField>

                                {
                                    selectedElement !== undefined ?
                                    <div style={{position: "absolute", 
                                        width: selectedElement.contentWidth,
                                        height: selectedElement.contentHeight, 
                                        left: selectedElement.contentX, 
                                        top: selectedElement.contentY,}} 
                                        onMouseDown={() => {setDragging(true)}} 
                                        >

                                        <CanvasDraggableElement handler={ENGINE.handler} 
                                                                name={selectedElement.refName} 
                                                                element={selectedElement} 
                                                                x={selectedElement.x} 
                                                                y={selectedElement.y}>

                                        </CanvasDraggableElement>
                                        </div>
                                     : <></>
                                }   
                                

                        </div>
                    </TransformComponent>
                </TransformWrapper>

                <CanvasDragLayer scale={zoom} />
            </CanvasDropContainer>
        </div>
        
        
        </>
    )
}

export default Canvas