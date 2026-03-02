import {
	Button,
	Colors,
	EditableText,
	HotkeyConfig,
	Label,
	Text,
	useHotkeys
} from "@blueprintjs/core";
import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useDragLayer } from "react-dnd";
import { ReactZoomPanPinchContentRef, TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch";
import { IToolConfig, Tool } from "../../app/App";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSelectedElementId } from "../../redux/slices/applicationSlice";
import ENGINE from "../../logic/engine";
import { AllComponentTypes } from "../../logic/point";
import Visual from "../../logic/visual";
import Debug from "../debug/Debug";
import CanvasDraggableElement from "../dnd/CanvasDraggableElement";
import { CanvasDragLayer } from "../dnd/CanvasDragLayer";
import { CanvasDropContainer } from "../dnd/CanvasDropContainer";
import SequencesPulseDropField from "../dnd/SequencesPulseDropField";
import { DebugLayerDialog } from "./DebugLayerDialog";
import { HitboxLayer } from "./HitboxLayer";
import { LineTool } from "./LineTool";
import GridDropField from "../dnd/GridDropField";


const DefaultDebugSelection: Record<AllComponentTypes, boolean> = {
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
	"sequence-aligner": false,
	grid: false,
	subgrid: false
};

export interface ISelectConfig extends IToolConfig { }

interface ICanvasProps {
	selectedTool: Tool;
	setTool: (tool: Tool) => void;
}

const SeamlessPanner = () => {
	const { instance, setTransform } = useControls();
	const prevDiagramX = useRef(ENGINE.handler.diagram.x);
	const prevDiagramY = useRef(ENGINE.handler.diagram.y);
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	useEffect(() => {
		const currentX = ENGINE.handler.diagram.x;
		const currentY = ENGINE.handler.diagram.y;
		const dx = currentX - prevDiagramX.current;
		const dy = currentY - prevDiagramY.current;

		const { positionX, positionY, scale } = instance.transformState;
		let newX = positionX;
		let newY = positionY;
		let transformed = false;

		if (dx !== 0 && (currentX < 0 || prevDiagramX.current < 0)) {
			newX = positionX + dx * scale;
			transformed = true;
		}

		if (dy !== 0 && (currentY < 0 || prevDiagramY.current < 0)) {
			newY = positionY + dy * scale;
			transformed = true;
		}

		if (transformed) {
			setTransform(newX, newY, scale, 0);
		}

		prevDiagramX.current = currentX;
		prevDiagramY.current = currentY;
	}, [store, instance, setTransform]);

	return null;
};

const Canvas: React.FC<ICanvasProps> = (props) => {
	const [debugDialogOpen, setDebugDialogOpen] = useState(false);
	const [debugElements, setDebugElements] = useState<Visual[]>([]);
	const [debugSelectionTypes, setDebugSelectionTypes] =
		useState<Record<AllComponentTypes, boolean>>(DefaultDebugSelection);
	const [zoom, setZoom] = useState(2);
	const [fileName, setFileName] = useState(ENGINE.currentImageName);
	const diagramSvgRef = useRef<HTMLDivElement | null>(null);
	const [hoveredElement, setHoveredElement] = useState<Visual | undefined>(undefined);
	const [focusLevel, setFocusLevel] = useState(0);

	const transformComponentRef = useRef<ReactZoomPanPinchContentRef | null>(null);

	const selectedElementId: string | undefined = useAppSelector((state) => state.application.selectedElementId);
	const dispatch = useAppDispatch();
	const selectedElement = ENGINE.handler.identifyElement(selectedElementId ?? "")


	const interactiveElement: Visual | undefined = selectedElement || (props.selectedTool.type === "select" ? hoveredElement : undefined);

	useEffect(() => {
		if (interactiveElement) {
			interactiveElement.svg?.hide();
		}

		return () => {
			interactiveElement?.svg?.show();
		};
	}, [interactiveElement?.id]);


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
			},
			{
				combo: "delete",
				global: true,
				label: "Delete selected element",
				onKeyDown: () => {
					if (selectedElement) {
						ENGINE.handler.act({
							type: "remove",
							input: {
								child: selectedElement
							}
						})
						deselect();
					}
				},
				preventDefault: true
			},
			{
				combo: "backspace",
				global: true,
				label: "Delete selected element",
				onKeyDown: () => {
					if (selectedElement) {
						ENGINE.handler.act({
							type: "remove",
							input: {
								child: selectedElement
							}
						})
						deselect();
					}
				},
				preventDefault: true
			},
			{
				combo: "ctrl+z",
				global: true,
				label: "Undo",
				onKeyDown: () => {
					if (ENGINE.handler.canUndo) {
						ENGINE.handler.undo();
					}
				},
				preventDefault: true
			},
			{
				combo: "ctrl+y",
				global: true,
				label: "Redo",
				onKeyDown: () => {
					if (ENGINE.handler.canRedo) {
						ENGINE.handler.redo();
					}
				},
				preventDefault: true
			},
		],
		[debugDialogOpen, selectedElementId]
	);
	const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys);
	const handleSetDebugSelection = (type: AllComponentTypes) => {
		var newDebugSelection: Record<AllComponentTypes, boolean> = {
			...debugSelectionTypes
		};
		newDebugSelection[type] = !newDebugSelection[type];
		setDebugSelectionTypes(newDebugSelection);
	};
	const handleDialogClose = (val: boolean) => {
		setDebugDialogOpen(val);
	};
	const { isDragging } = useDragLayer((monitor) => ({
		isDragging: monitor.isDragging()
	}));

	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);


	const deselect = () => {
		selectedElement?.svg?.show();
		setFocusLevel(0);
		dispatch(setSelectedElementId(undefined));
	};

	const stopHover = () => {
		setHoveredElement(undefined);
	};

	const selectVisual = (e: Visual) => {
		dispatch(setSelectedElementId(e.id));
		setFocusLevel(focusLevel + 1);
		e.svg?.hide();
	};

	const reselect = (e: Visual) => {
		deselect();
		selectVisual(e);
	}

	const onClick = (click: React.MouseEvent<HTMLDivElement>) => {
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
		if (selectedElementId === undefined) {
			setFocusLevel(0);
		}
	}, [selectedElementId]);

	useEffect(() => {
		if (diagramSvgRef.current && ENGINE.handler.diagram.svg) {
			diagramSvgRef.current.replaceChildren();
			diagramSvgRef.current.appendChild(ENGINE.surface.node);
		}
	}, [store]);

	var diagramWidth: number = ENGINE.handler.diagram.width;
	var diagramHeight: number = ENGINE.handler.diagram.height;

	return (
		<>
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					position: "relative"
				}}
				onClick={(e) => {
					onClick(e);
				}}
				onMouseUp={(e) => {
					singleClick(e);
					deselect();
				}}>
				{/* Image name display text box - positioned outside TransformWrapper */}
				<div
					style={{
						position: "absolute",
						top: "5px",
						left: "10px",
						zIndex: 100
					}}>

				</div>

				<div
					style={{
						position: "absolute",
						bottom: "5px",
						right: "10px",
						zIndex: 100
					}}>

				</div>

				<div
					style={{
						position: "absolute",
						top: "10px",
						left: "10px",
						zIndex: 10
					}}>
					<Button
						icon="target"
						onClick={() => transformComponentRef.current?.centerView()}
					/>
				</div>


				<CanvasDropContainer scale={zoom}>
					<TransformWrapper
						ref={transformComponentRef}
						initialScale={zoom}
						onZoomStop={(z) => {
							setZoom(z.state.scale);
						}}
						centerOnInit={true}
						limitToBounds={false}

						maxScale={5}
						minScale={0.5}
						panning={{ excluded: ["nopan"] }}
						doubleClick={{ disabled: true }}>


						<TransformComponent wrapperStyle={{
							width: "100%", height: "100%", position: "absolute",
						}}>
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
									/*border: "dashed",
									borderWidth: "0.2px",
									borderColor: "#0000003d" */
								}}
								onMouseLeave={() => stopHover()}>




								{/* Transformed Overlay Layer */}
								<div className="nopan"
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: "100%",
										zIndex: 20000,
										pointerEvents: "none",
										transform: `translate(${ENGINE.handler.diagram.x < 0 ? Math.abs(ENGINE.handler.diagram.x) : 0
											}px, ${ENGINE.handler.diagram.y < 0 ? Math.abs(ENGINE.handler.diagram.y) : 0
											}px)`
									}}>

									{/* Draggable elements - Render for Selected OR Hovered (if select tool) */}
									{interactiveElement !== undefined && (interactiveElement.id === selectedElement?.id || interactiveElement.id === hoveredElement?.id) && (
										<div
											key={interactiveElement.id}
											className="nopan"
											style={{
												position: "absolute",
												width: interactiveElement.contentWidth,
												height: interactiveElement.contentHeight,
												left: interactiveElement.drawCX,
												top: interactiveElement.drawCY,
												pointerEvents: "auto"
											}}>
											<CanvasDraggableElement
												reselect={reselect}
												name={interactiveElement.ref}
												element={interactiveElement}
												x={interactiveElement.x}
												y={interactiveElement.y}></CanvasDraggableElement>
										</div>
									)}


									{/* Tools */}
									{props.selectedTool.type === "arrow" ? (
										<div className="nopan" style={{ pointerEvents: "auto", width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
											<LineTool
												hoveredElement={hoveredElement}
												config={props.selectedTool.config}
												setTool={props.setTool}></LineTool>
										</div>
									) : (
										<></>
									)}

									{/* Drop field */}
									<div className="nopan" style={{ pointerEvents: "auto" }}>
										{ENGINE.handler.sequences[0] &&
											<GridDropField target={ENGINE.handler.sequences[0]} ></GridDropField>
										}
										<SequencesPulseDropField></SequencesPulseDropField>
									</div>

									{/* Debug layers */}
									<Debug
										debugGroupSelection={debugSelectionTypes}
										debugSelection={debugElements}></Debug>

								</div>


								{/* Hitbox layer */}
								{!isDragging ? (
									<HitboxLayer
										focusLevel={focusLevel}
										setHoveredElement={constOnHitboxHover}></HitboxLayer>
								) : (
									<></>
								)}

								{/* Image */}
								<div id="drawDiv" ref={diagramSvgRef}></div>
							</div>
						</TransformComponent>

						<SeamlessPanner />
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
