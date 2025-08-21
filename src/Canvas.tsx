import React, {useEffect, useState, useRef, useLayoutEffect, ReactNode, ReactElement, useSyncExternalStore, DOMElement, useMemo, MouseEvent} from 'react'
import DropField from './dnd/DropField';
import { Visual } from './vanilla/visual';
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch"
import { CanvasDragLayer } from './dnd/CanvasDragLayer';
import { CanvasDropContainer } from './dnd/CanvasDropContainer';
import CanvasDraggableElement from './dnd/CanvasDraggableElement';
import ENGINE from './vanilla/engine';
import Debug from './Debug';
import { Checkbox, Colors, Dialog, DialogBody, Divider, EditableText, EntityTitle, HotkeyConfig, Label, Text, useHotkeys } from '@blueprintjs/core';
import { ObjectInspector } from 'react-inspector';
import { Tick } from '@blueprintjs/icons';
import { SelectionMode } from './App';
import BindingsDebug from './debug/Bindings';
import BindingsSelector, { PointBind } from './BindingsSelector';

 
export type ImageComponent = "element" | "pulse columns"| "channels" | "label column" | "upper aligner" | "lower aligner" | "sequence"
const DefaultDebugSelection: Record<ImageComponent, boolean> = {
    "element": false,
    "pulse columns": false,
    "channels": false,
    "label column": false,
    "upper aligner": false,
    "lower aligner": false,
    "sequence": false
}




interface ICanvasProps {
    select: (element?: Visual) => void
    selectedElement: Visual | undefined,
    selectionMode: SelectionMode
}

const Canvas: React.FC<ICanvasProps> = (props) => {
    const [debugDialogOpen, setDebugDialogOpen] = useState(false);
    const [debugElements, setDebugElements] = useState<Visual[]>([]);
    const [debugSelectionTypes, setDebugSelectionTypes] = useState<Record<ImageComponent, boolean>>(DefaultDebugSelection);
    const [hoveredElement, setHoveredElement] = useState<Visual | undefined>(undefined);

    const [start, setStart] = useState<PointBind | undefined>(undefined);
    const [end, setEnd] = useState<PointBind | undefined>(undefined);

    const hotkeys: HotkeyConfig[] = useMemo<HotkeyConfig[]>(
        () => [
            {
                combo: "ctrl+d",
                global: true,
                label: "Open debug dialog",
                onKeyDown: () => {setDebugDialogOpen(!debugDialogOpen)},
                preventDefault: true
            },
        ],
        [debugDialogOpen],
    );
    const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys);
    function handleSetDebugSelection(type: ImageComponent) {
        var newDebugSelection: Record<ImageComponent, boolean> = {...debugSelectionTypes}
        newDebugSelection[type] = !newDebugSelection[type]
        setDebugSelectionTypes(newDebugSelection);
    }

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
        switch (props.selectionMode) {
            case "select":
                deselect();
                break;
            case "draw":

        }
        
    }

    function mouseOver(over: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) {
        var targetSVGId: string | undefined;
        targetSVGId = (over.target as HTMLElement).id;
        
        // If target is path
        // if (targetSVGId === "") {
        //     targetSVGId = (over.target as HTMLElement).parentElement?.id
        // }    

        var element: Visual | undefined;
        if (targetSVGId !== undefined) {
            console.log(`id: ${targetSVGId}`)
            element = ENGINE.handler.identifyElement(targetSVGId);
            console.log(element)
        }
        setHoveredElement(element);
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
             onDragEnd={() => {setDragging(false)}}
             onMouseOver={(e) => {mouseOver(e)}}>

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

            <div style={{
                position: "absolute",
                bottom: "5px",
                right: "10px",
                zIndex: 100,
                }}>

                {hoveredElement ? <Text>{hoveredElement.ref}</Text> : <Text>none</Text>}
            </div>

            <CanvasDropContainer >
                <TransformWrapper initialScale={zoom} 
                                  onZoomStop={(z) => {setZoom(z.state.scale)}}
                                  centerOnInit={true} 
                                  limitToBounds={false} 
                                  centerZoomedOut={true}
                                  disabled={dragging}
                                  onPanningStart={() => {setPanning(true)}}
                                  onPanningStop={() => {setPanning(false)}}
                                  doubleClick={{disabled: true}}>

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

                                {/* Hover highlight */}
                                { hoveredElement !== undefined ? 
                                <>
                                    <svg style={{width: `${hoveredElement.width}px`, height: `${hoveredElement.height}`, position: "absolute", 
                                top: `${hoveredElement.y}px`, left: `${hoveredElement.x}px`, zIndex: 100, vectorEffect: "non-scaling-stroke"}} pointerEvents={"none"} >
                                    <rect width={"100%"} height={"100%"}
                                    style={{stroke: `${Colors.BLUE3}`,
                                    strokeWidth: "1px", fill: `none`, strokeDasharray: "1 1",}} ></rect>
                                </svg> 
                                {props.selectionMode === "draw" ? 
                                <BindingsSelector element={hoveredElement} 
                                    selectedStart={start} setStart={setStart}
                                    selectedEnd={end} setEnd={setEnd}></BindingsSelector> : <></>}

                                </>
      
                                : <></>}

                                
                                {/* Image */}
                                <div dangerouslySetInnerHTML={{"__html": ENGINE.surface.node.outerHTML}} id="drawDiv"></div>

                                {/* Drop field */}
                                <DropField></DropField>

                                {/* Debug layers */}
                                <Debug debugGroupSelection={debugSelectionTypes} debugSelection={debugElements}></Debug>

                                {/* Draggable elements */}
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
        
        <Dialog style={{width: "400px"}}
            isOpen={debugDialogOpen}
            onClose={() => {setDebugDialogOpen(false)}}
            title="Debug Layers"
            canOutsideClickClose={true}
            canEscapeKeyClose={true} icon="wrench"
        >
            <DialogBody style={{}}>
                <div style={{display: "flex", flexDirection: "column"}}>
                   <Checkbox label='Pulse columns' alignIndicator='end' checked={debugSelectionTypes['pulse columns']}
                            onChange={() => {handleSetDebugSelection("pulse columns")}}></Checkbox>
                   <Checkbox label='Elements' alignIndicator='end' checked={debugSelectionTypes['element']} 
                             onChange={() => {handleSetDebugSelection("element")}}></Checkbox>

                   <Checkbox label='Label Column' alignIndicator='end' checked={debugSelectionTypes['label column']} 
                             onChange={() => {handleSetDebugSelection("label column")}}></Checkbox>

                   <Checkbox label='Channels' alignIndicator='end' checked={debugSelectionTypes['channels']} 
                             onChange={() => {handleSetDebugSelection("channels")}}></Checkbox>

                    <Checkbox label='Upper aligners' alignIndicator='end' checked={debugSelectionTypes['upper aligner']} 
                             onChange={() => {handleSetDebugSelection('upper aligner')}}></Checkbox>

                    <Checkbox label='Lower aligners' alignIndicator='end' checked={debugSelectionTypes['lower aligner']} 
                             onChange={() => {handleSetDebugSelection("lower aligner")}}></Checkbox>

                    <Checkbox label='Sequence' alignIndicator='end' checked={debugSelectionTypes['sequence']} 
                             onChange={() => {handleSetDebugSelection("sequence")}}></Checkbox>
                </div>
            </DialogBody>
        </Dialog>
        </>
    )
}

export default Canvas