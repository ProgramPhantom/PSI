import {
  Checkbox,
  Colors,
  Dialog,
  DialogBody,
  EditableText,
  HotkeyConfig,
  Label,
  Text,
  useHotkeys
} from "@blueprintjs/core";
import React, {useEffect, useMemo, useRef, useState, useSyncExternalStore} from "react";
import {TransformComponent, TransformWrapper} from "react-zoom-pan-pinch";
import {IToolConfig, Tool} from "../../app/App";
import {
  AllComponentTypes,
  AllElementIdentifiers,
  UserComponentType
} from "../../logic/diagramHandler";
import ENGINE from "../../logic/engine";
import {ID} from "../../logic/point";
import {Visual} from "../../logic/visual";
import Debug from "../debug/Debug";
import CanvasDraggableElement from "../dnd/CanvasDraggableElement";
import {CanvasDragLayer} from "../dnd/CanvasDragLayer";
import {CanvasDropContainer} from "../dnd/CanvasDropContainer";
import DropField from "../dnd/DropField";
import {HitboxLayer} from "./HitboxLayer";
import {LineTool, IDrawArrowConfig} from "./LineTool";
import {DebugLayerDialog} from "./DebugLayerDialog";
import {Element} from "@svgdotjs/svg.js";
import {SVG} from "@svgdotjs/svg.js";
import {useDragLayer} from "react-dnd";

const DefaultDebugSelection: Record<AllElementIdentifiers, boolean> = {
  // Types
  svg: false,
  text: false,
  rect: false,
  space: false,
  line: false,
  aligner: false,
  collection: false,
  channel: false,
  "lower-abstract": false,
  visual: false,
  sequence: false,
  label: false,
  diagram: false,
  "label-group": false,

  // Named elements
  "mounted-elements": false,
  "label col | pulse columns": false,
  "channel column": false,
  "pulse columns": false,
  "sequence column": false,
  "label column": false,
  bar: false,
  root: false,
  "top aligner": false,
  "bottom aligner": false
};

export interface ISelectConfig extends IToolConfig {}

interface ICanvasProps {
  select: (element?: Visual) => void;
  selectedElement: Visual | undefined;
  selectedTool: Tool;
  setTool: (tool: Tool) => void;
}

const Canvas: React.FC<ICanvasProps> = (props) => {
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [debugElements, setDebugElements] = useState<Visual[]>([]);
  const [debugSelectionTypes, setDebugSelectionTypes] =
    useState<Record<AllElementIdentifiers, boolean>>(DefaultDebugSelection);
  const [zoom, setZoom] = useState(2);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(ENGINE.currentImageName);
  const diagramSvgRef = useRef<HTMLDivElement | null>();
  const [hoveredElement, setHoveredElement] = useState<Visual | undefined>(undefined);
  const [focusLevel, setFocusLevel] = useState(0);
  const hotkeys: HotkeyConfig[] = useMemo<HotkeyConfig[]>(
    () => [
      {
        combo: "ctrl+d",
        global: true,
        label: "Open debug dialog",
        onKeyDown: () => {
          setDebugDialogOpen(!debugDialogOpen);
        },
        preventDefault: true
      }
    ],
    [debugDialogOpen]
  );
  const {handleKeyDown, handleKeyUp} = useHotkeys(hotkeys);
  const handleSetDebugSelection = (type: AllElementIdentifiers) => {
    var newDebugSelection: Record<AllElementIdentifiers, boolean> = {
      ...debugSelectionTypes
    };
    newDebugSelection[type] = !newDebugSelection[type];
    setDebugSelectionTypes(newDebugSelection);
  };
  const handleDialogClose = (val: boolean) => {
    setDebugDialogOpen(val);
  };
  const {isDragging} = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging()
  }));

  const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

  let selectedElement = props.selectedElement;

  const deselect = () => {
    selectedElement?.svg?.show();
    setFocusLevel(0);
    props.select(undefined);
  };

  const stopHover = () => {
    setHoveredElement(undefined);
  };

  const selectVisual = (e: Visual) => {
    props.select(e);
    setFocusLevel(focusLevel + 1);
    e.svg?.hide();
  };

  const doubleClick = (click: React.MouseEvent<HTMLDivElement>) => {
    var element: Visual | undefined = hoveredElement;

    if (element === undefined) {
      deselect();
    } else {
      selectVisual(element);
    }
  };

  const singleClick = (click: React.MouseEvent<HTMLDivElement>) => {
    switch (props.selectedTool.type) {
      case "select":
        if (selectedElement && hoveredElement !== selectedElement) {
          deselect();
        }
        break;
      case "arrow":
    }
  };

  const constOnHitboxHover = (element?: Visual) => {
    setHoveredElement(element);
  };

  const handleFileNameChange = (newFileName: string) => {
    setFileName(newFileName);
    ENGINE.currentImageName = newFileName;
  };

  const handleFileNameBlur = () => {
    // Check if filename ends with .svg when editing is finished
    if (!fileName.toLowerCase().endsWith(".svg")) {
      // If it doesn't end with .svg, extract the base name and add .svg
      const baseName = fileName.split(".")[0]; // Get everything before the first dot
      const correctedFileName = baseName + ".svg";
      setFileName(correctedFileName);
      ENGINE.currentImageName = correctedFileName;
    }
  };

  // Reset focus level when lose focus
  useEffect(() => {
    if (props.selectedElement === undefined) {
      setFocusLevel(0);
    }
  }, [props.selectedElement]);

  useEffect(() => {
    if (diagramSvgRef.current && ENGINE.handler.diagram.svg) {
      diagramSvgRef.current.replaceChildren();
      diagramSvgRef.current.appendChild(ENGINE.surface.node);
    }
  }, [store]);

  var diagramWidth: number = 0;
  var diagramHeight: number = 0;
  if (ENGINE.handler.diagram.hasDimensions) {
    diagramWidth = ENGINE.handler.diagram.width;
    diagramHeight = ENGINE.handler.diagram.height;
  }

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative"
        }}
        onDoubleClick={(e) => {
          doubleClick(e);
        }}
        onMouseUp={(e) => {
          singleClick(e);
          setDragging(false);
        }}
        onDragEnd={() => {
          setDragging(false);
        }}>
        {/* Image name display text box - positioned outside TransformWrapper */}
        <div
          style={{
            position: "absolute",
            top: "5px",
            left: "10px",
            zIndex: 100
          }}>
          <Label style={{fontSize: "10px", marginBottom: "0px"}}>filename</Label>
          <EditableText
            value={fileName}
            onChange={handleFileNameChange}
            onConfirm={handleFileNameBlur}
            multiline={false}
            selectAllOnFocus={true}
          />
          <p>{`${isDragging}`}</p>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "5px",
            right: "10px",
            zIndex: 100
          }}>
          {hoveredElement ? (
            <Text>
              Hovered: {hoveredElement.ref}: {hoveredElement.id}
            </Text>
          ) : (
            <Text>Hovered: none</Text>
          )}
        </div>
        <CanvasDropContainer scale={zoom}>
          <TransformWrapper
            initialScale={zoom}
            onZoomStop={(z) => {
              setZoom(z.state.scale);
            }}
            centerOnInit={true}
            limitToBounds={false}
            centerZoomedOut={true}
            maxScale={5}
            minScale={0.5}
            disabled={dragging}
            doubleClick={{disabled: true}}>
            <TransformComponent wrapperStyle={{width: "100%", height: "100%"}}>
              {/* Large background grid that moves with transform */}
              <div
                style={{
                  position: "absolute",
                  width: "10000px",
                  height: "10000px",
                  left: "-5000px",
                  top: "-5000px",
                  backgroundImage:
                    "radial-gradient(circle,rgba(204, 204, 204, 0.12) 0.6px, transparent 1px)",
                  backgroundSize: "5px 5px",
                  backgroundPosition: "0 0",
                  pointerEvents: "none",
                  zIndex: -1
                }}></div>

              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "inline-block",
                  position: "relative",
                  border: "dashed",
                  borderWidth: "0.2px",
                  borderColor: "#0000003d"
                }}
                onMouseLeave={() => stopHover()}>
                {/* Hitbox layer */}

                {!isDragging ? (
                  <HitboxLayer
                    focusLevel={focusLevel}
                    setHoveredElement={constOnHitboxHover}></HitboxLayer>
                ) : (
                  <></>
                )}

                {/* Tools */}
                {props.selectedTool.type === "arrow" ? (
                  <LineTool
                    hoveredElement={hoveredElement}
                    config={props.selectedTool.config}
                    setTool={props.setTool}></LineTool>
                ) : (
                  <></>
                )}

                {/* Hover highlight */}
                {hoveredElement !== undefined && props.selectedTool.type === "select" ? (
                  <>
                    <svg
                      style={{
                        width: `${hoveredElement.width}px`,
                        height: `${hoveredElement.height}`,
                        position: "absolute",
                        top: `${hoveredElement.y}px`,
                        left: `${hoveredElement.x}px`,
                        zIndex: 100,
                        vectorEffect: "non-scaling-stroke"
                      }}
                      pointerEvents={"none"}>
                      <rect
                        width={"100%"}
                        height={"100%"}
                        style={{
                          stroke: `${Colors.BLUE3}`,
                          strokeWidth: "1px",
                          fill: `none`,
                          strokeDasharray: "1 1"
                        }}></rect>
                    </svg>
                  </>
                ) : (
                  <></>
                )}

                {/* Image */}
                <div id="drawDiv" ref={diagramSvgRef}></div>

                {/* Drop field */}
                <DropField></DropField>

                {/* Debug layers */}
                <Debug
                  debugGroupSelection={debugSelectionTypes}
                  debugSelection={debugElements}></Debug>

                {/* Draggable elements */}
                {selectedElement !== undefined ? (
                  <div
                    style={{
                      position: "absolute",
                      width: selectedElement.contentWidth,
                      height: selectedElement.contentHeight,
                      left: selectedElement.drawX,
                      top: selectedElement.drawY
                    }}
                    onMouseDown={() => {
                      setDragging(true);
                    }}>
                    <CanvasDraggableElement
                      name={selectedElement.ref}
                      element={selectedElement}
                      x={selectedElement.x}
                      y={selectedElement.y}></CanvasDraggableElement>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </TransformComponent>
          </TransformWrapper>

          <CanvasDragLayer scale={zoom} />
        </CanvasDropContainer>
      </div>

      <DebugLayerDialog
        open={debugDialogOpen}
        setOpen={handleDialogClose}
        debugSelection={debugSelectionTypes}
        setDebugSelection={handleSetDebugSelection}></DebugLayerDialog>
    </>
  );
};

export default Canvas;
