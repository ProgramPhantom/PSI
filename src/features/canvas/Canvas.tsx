import { Checkbox, Colors, Dialog, DialogBody, EditableText, HotkeyConfig, Label, Text, useHotkeys } from '@blueprintjs/core';
import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { SelectionMode } from "../../app/App";
import { AllComponentTypes, AllElementIdentifiers, UserComponentType } from "../../logic/diagramHandler";
import ENGINE from "../../logic/engine";
import { ID } from "../../logic/point";
import { Visual } from "../../logic/visual";
import BindingsSelector, { PointBind } from './BindingsSelector';
import Debug from '../debug/Debug';
import CanvasDraggableElement from '../dnd/CanvasDraggableElement';
import { CanvasDragLayer } from '../dnd/CanvasDragLayer';
import { CanvasDropContainer } from '../dnd/CanvasDropContainer';
import DropField from '../dnd/DropField';

 


const DefaultDebugSelection: Record<AllElementIdentifiers, boolean> = {
    // Types
    "svg": false,
    "text": false,
    "arrow": false,
    "rect": false,
    "space": false,
    "line": false,
    "aligner": false,
    "collection": false,
    "channel": false,
    "lower-abstract": false,
    "visual": false,
    "sequence": false,
    "label": false,
    "diagram": false,
    "label-group": false,

    // Named elements
    "label col | pulse columns": false,
    "channel column": false,
    "pulse columns": false,
    "sequence column": false,
    "label column": false,
    "bar": false,
    "root": false,
    "top aligner": false,
    "bottom aligner": false,
}

type HoverBehaviour = "terminate" | "carry" | "conditional"
// Terminate: return this object immediately
// Carry: always pass to parent
// Conditional: Check parent and only return itself IF above is carry. If above is terminal, pass up.
const FocusLevels: Record<number, Record<HoverBehaviour, UserComponentType[]>> = {
    0: {
        terminate: [
            "label-group",
            "channel"
        ],
        carry: [
            "label",
            "text",
            "diagram"
        ],
        conditional: [
            "svg",
            "rect"
        ]
    },
    1: {
        terminate: ["diagram"],
        carry: ["diagram"],
        conditional: []
    }
}


interface ICanvasProps {
    select: (element?: Visual) => void
    selectedElement: Visual | undefined,
    selectionMode: SelectionMode
}

const Canvas: React.FC<ICanvasProps> = (props) => {
    const [debugDialogOpen, setDebugDialogOpen] = useState(false);
    const [debugElements, setDebugElements] = useState<Visual[]>([]);
    const [debugSelectionTypes, setDebugSelectionTypes] = useState<Record<AllElementIdentifiers, boolean>>(DefaultDebugSelection);
    const [hoveredElement, setHoveredElement] = useState<Visual | undefined>(undefined);

    const [start, setStart] = useState<PointBind | undefined>(undefined);
    const [end, setEnd] = useState<PointBind | undefined>(undefined);

    const [focusLevel, setFocusLevel] = useState(0);

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
    function handleSetDebugSelection(type: AllElementIdentifiers) {
        var newDebugSelection: Record<AllElementIdentifiers, boolean> = {...debugSelectionTypes}
        newDebugSelection[type] = !newDebugSelection[type]
        setDebugSelectionTypes(newDebugSelection);
    }

    console.log("CREATING CANVAS")
    useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot)
    

    let selectedElement = props.selectedElement;
    
    const [zoom, setZoom] = useState(2);
    const [dragging, setDragging] = useState(false);
    const [panning, setPanning] = useState(false);
    const [fileName, setFileName] = useState(ENGINE.currentImageName);

    function deselect() {
        selectedElement?.svg?.show();
        setFocusLevel(0);
        props.select(undefined);
    }

    function select(e: Visual) {
        props.select(e);
        setFocusLevel(focusLevel + 1)
        e.svg?.hide();
    }

    function doubleClick(click: React.MouseEvent<HTMLDivElement>) {
        var targetSVGId: string | undefined;
        targetSVGId = (click.target as HTMLElement).id;

        var element: Visual | undefined = getMouseElement(targetSVGId)
        
        if (element === undefined) { 
            deselect()
        } else {
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
        console.log(targetSVGId);
        var element: Visual | undefined = getMouseElement(targetSVGId)
        
        setHoveredElement(element);
    }

    function getMouseElement(id: ID | undefined): Visual | undefined {
        if (id === undefined) {return undefined}
        var initialElement: Visual | undefined = ENGINE.handler.identifyElement(id);
        if (initialElement === undefined) {return undefined}

        var terminators: AllComponentTypes[] = FocusLevels[focusLevel].terminate;
        var carry: AllComponentTypes[] = FocusLevels[focusLevel].carry;
        var conditional: AllComponentTypes[] = FocusLevels[focusLevel].conditional;

        function walkUp(currElement: Visual): Visual | undefined {
            if (currElement.parentId !== undefined) {
                var elementUp: Visual | undefined = ENGINE.handler.identifyElement(currElement.parentId);
            } else {
                return currElement
            }
            
            if (elementUp === undefined) { return currElement }
            
            var currElementType: AllComponentTypes = (currElement.constructor as typeof Visual).ElementType;
            var elementUpType: AllComponentTypes = (elementUp.constructor as typeof Visual).ElementType;
            if (currElementType === "text") {
                console.log()
            }

            if (terminators.includes(currElementType)) {
                return currElement
            }
            if (conditional.includes(currElementType) && !terminators.includes(elementUpType)) {
                return currElement;
            }
            
            elementUp = walkUp(elementUp);
            
            
            return elementUp
        }

        return walkUp(initialElement);
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

    // Reset focus level when lose focus
    useEffect(() => {
        if (props.selectedElement === undefined) {
            setFocusLevel(0)
        }
    }, [props.selectedElement])

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

                {hoveredElement ? <Text>{hoveredElement.ref}: {hoveredElement.id}</Text> : <Text>none</Text>}
            </div>
            <CanvasDropContainer scale={zoom} >
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
                   <Checkbox label='Elements' alignIndicator='end' checked={debugSelectionTypes['rect']} 
                             onChange={() => {handleSetDebugSelection("svg")}}></Checkbox>

                   <Checkbox label='Label Column' alignIndicator='end' checked={debugSelectionTypes['label column']} 
                             onChange={() => {handleSetDebugSelection("label column")}}></Checkbox>

                   <Checkbox label='Channels' alignIndicator='end' checked={debugSelectionTypes['channel']} 
                             onChange={() => {handleSetDebugSelection("channel")}}></Checkbox>

                    <Checkbox label='Upper aligners' alignIndicator='end' checked={debugSelectionTypes['top aligner']} 
                             onChange={() => {handleSetDebugSelection('top aligner')}}></Checkbox>

                    <Checkbox label='Lower aligners' alignIndicator='end' checked={debugSelectionTypes['bottom aligner']} 
                             onChange={() => {handleSetDebugSelection("bottom aligner")}}></Checkbox>

                    <Checkbox label='Sequences' alignIndicator='end' checked={debugSelectionTypes['sequence']} 
                             onChange={() => {handleSetDebugSelection("sequence")}}></Checkbox>

                    <Checkbox label='Diagram' alignIndicator='end' checked={debugSelectionTypes['diagram']} 
                             onChange={() => {handleSetDebugSelection("diagram")}}></Checkbox>
                </div>
            </DialogBody>
        </Dialog>
        </>
    )
}

export default Canvas