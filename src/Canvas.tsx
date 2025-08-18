import React, {useEffect, useState, useRef, useLayoutEffect, ReactNode, ReactElement, useSyncExternalStore, DOMElement} from 'react'
import DropField from './dnd/DropField';
import { Visual } from './vanilla/visual';
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch"
import { CanvasDragLayer } from './dnd/CanvasDragLayer';
import { CanvasDropContainer } from './dnd/CanvasDropContainer';
import CanvasDraggableElement from './dnd/CanvasDraggableElement';
import ENGINE from './vanilla/engine';
import Debug from './Debug';
import { EditableText, Label } from '@blueprintjs/core';


interface ICanvasProps {
    select: (element?: Visual) => void
    selectedElement: Visual | undefined,
}

const Canvas: React.FC<ICanvasProps> = (props) => {
    console.log("CREATING CANVAS")
    useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot)
    let selectedElement = props.selectedElement;
    
    const [zoom, setZoom] = useState(3);
    const [dragging, setDragging] = useState(false);
    const [panning, setPanning] = useState(false);
    const [fileName, setFileName] = useState(ENGINE.currentImageName);

    function deselect() {
        selectedElement?.svg?.show();
        props.select(undefined);
    }

    function select(e: Visual) {
        props.select(e);
        e.svg?.hide();
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
            var element: Visual | undefined = ENGINE.handler.identifyElement(targetSVGId);

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

    function handleFileNameChange(newFileName: string) {
        setFileName(newFileName);
        ENGINE.currentImageName = newFileName;
    }

    function handleFileNameBlur() {
        // Check if filename ends with .svg when editing is finished
        if (!fileName.toLowerCase().endsWith('.svg')) {
            // If it doesn't end with .svg, extract the base name and add .svg
            const baseName = fileName.split('.')[0]; // Get everything before the first dot
            const correctedFileName = baseName + '.svg';
            setFileName(correctedFileName);
            ENGINE.currentImageName = correctedFileName;
        }
    }

    return (
        <>
        <div style={{width: "100%", height: "100%",  display: "flex", position: "relative"}} 
                onDoubleClick={(e) => {doubleClick(e); }}
                onMouseUp={(e) => {singleClick(e); setDragging(false)}} 
                onDragEnd={() => {setDragging(false)}}>

            {/* Image name display text box - positioned outside TransformWrapper */}
            <div style={{
                position: "absolute",
                top: "5px",
                left: "10px",
                zIndex: 100,
            }}>
                <Label style={{ fontSize: "10px", marginBottom: "0px" }}>
                    filename
                </Label>
                                 <EditableText
                      value={fileName}
                      onChange={handleFileNameChange}
                      onConfirm={handleFileNameBlur}
                      multiline={false}
                      selectAllOnFocus={true}
                  />
            </div>

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
                        {/* Large background grid that moves with transform */}
                        <div style={{
                            position: "absolute",
                            width: "10000px", 
                            height: "10000px",
                            left: "-5000px",
                            top: "-5000px",
                            backgroundImage: "radial-gradient(circle,rgba(204, 204, 204, 0.12) 0.6px, transparent 1px)",
                            backgroundSize: "5px 5px",
                            backgroundPosition: "0 0",
                            pointerEvents: "none",
                            zIndex: -1
                        }}></div>

                        <div style={{
                                     width: "100%", 
                                     height: "100%", 
                                     display: "inline-block", 
                                     position: "relative", 
                                     border: "dashed", 
                                     borderWidth: "0.2px", 
                                     borderColor: "#0000003d"
                                }}>

                                <div dangerouslySetInnerHTML={{"__html": ENGINE.surface.node.outerHTML}} id="drawDiv">
                                    
                                </div>
                                <DropField sequence={ENGINE.handler}></DropField>
                                <Debug sequenceHandler={ENGINE.handler}></Debug> 
                                {
                                    selectedElement !== undefined ?
                                    <div style={{position: "absolute", 
                                        width: selectedElement.contentWidth,
                                        height: selectedElement.contentHeight, 
                                        left: selectedElement.drawX, 
                                        top: selectedElement.drawY,}} 
                                        onMouseDown={() => {setDragging(true)}} 
                                        >

                                        <CanvasDraggableElement name={selectedElement.ref} 
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