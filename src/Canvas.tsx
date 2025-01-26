import React, {useEffect, useState, useRef, useLayoutEffect, ReactNode, ReactElement, useSyncExternalStore, DOMElement} from 'react'
import DropField from './dnd/DropField';
import { Visual } from './vanilla/visual';
import Positional, { IPositional } from './vanilla/positional';
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch"
import { CanvasDragLayer } from './dnd/CanvasDragLayer';
import { CanvasDropContainer } from './dnd/CanvasDropContainer';
import CanvasDraggableElement from './dnd/CanvasDraggableElement';
import ENGINE from './vanilla/engine';
import Debug from './Debug';


interface ICanvasProps {
    select: (element?: Visual, positionalData?: Positional<Visual>) => void
    selectedElement: Visual | undefined,
    selectedElementPositional?: Positional<Visual>
}

const Canvas: React.FC<ICanvasProps> = (props) => {
    console.log("CREATING CANVAS")
    useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot)
    let selectedElement = props.selectedElement;
    let selectedElementPositionalData = props.selectedElementPositional;

    const [zoom, setZoom] = useState(5);
    const [dragging, setDragging] = useState(false);
    const [panning, setPanning] = useState(false);

    function deselect() {
        selectedElement?.svg?.show();
        props.select(undefined);
    }

    function select(e: Positional<Visual>) {
        props.select(e.element, e);
        e.element.svg?.hide();
    }

    function doubleClick(click: React.MouseEvent<HTMLDivElement>) {
        var targetSVGId: string | undefined;
        targetSVGId = (click.target as HTMLElement).id;
        
        // If target is path
        if (targetSVGId === "") {
            targetSVGId = (click.target as HTMLElement).parentElement?.id
        }
        
        if (targetSVGId === undefined) { 
            console.warn(`Cannot find id for ${click}`);
            deselect()
            return
        } else {
            var element: Positional<Visual> | undefined = ENGINE.handler.selectPositional(targetSVGId);

            if (element === undefined) {
                console.warn(`Cannot find element with id: ${targetSVGId}`)
                deselect()
                return
            }
            select(element)
        }
    }

    function singleClick(click: React.MouseEvent<HTMLDivElement>) {
        deselect();
    }

    return (
        <>
        {/* width: "0px", height: "0px", visibility: "hidden"*/}
        <div id={"drawDiv"} style={{width: "0px", height: "0px", visibility: "hidden"}}></div>


        <div style={{width: "100%", height: "100%",  display: "flex"}} 
                onDoubleClick={(e) => {doubleClick(e); }}
                onMouseUp={(e) => {singleClick(e); setDragging(false)}} 
                onDragEnd={() => {setDragging(false)}}>

            <CanvasDropContainer >
                <TransformWrapper initialScale={zoom} onZoomStop={(z) => {setZoom(z.state.scale)}}
                                centerOnInit={true} 
                                limitToBounds={false} 
                                centerZoomedOut={true}
                                disabled={dragging}
                                onPanningStart={() => {setPanning(true)}}
                                onPanningStop={() => {setPanning(false)}}
                                doubleClick={{disabled: true}}
                                >
                    <TransformComponent wrapperStyle={{width: "100%", height: "100%"}}>
                        <div style={{width: "100%", height: "100%", display: "inline-block", position: "relative"}}>
                            
                                <div dangerouslySetInnerHTML={{"__html": ENGINE.surface.node.outerHTML}} >
                                    
                                </div>
                                <DropField sequence={ENGINE.handler}></DropField>
                                
                                {
                                    selectedElement !== undefined ?
                                    <div style={{position: "absolute", 
                                        width: selectedElement.contentWidth,
                                        height: selectedElement.contentHeight, 
                                        left: selectedElement.drawX, 
                                        top: selectedElement.drawY,}} 
                                        onMouseDown={() => {setDragging(true)}} 
                                        >

                                        <CanvasDraggableElement handler={ENGINE.handler} 
                                                                name={selectedElement.refName} 
                                                                element={selectedElement}
                                                                positionalConfig={selectedElementPositionalData}
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