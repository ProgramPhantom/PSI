import {
	Button, EditableText
} from "@blueprintjs/core";
import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useDragLayer } from "react-dnd";
import { ReactZoomPanPinchContentRef, TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch";
import { IToolConfig, Tool } from "../../app/App";
import ENGINE from "../../logic/engine";
import Visual from "../../logic/visual";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSelectedElementId } from "../../redux/slices/applicationSlice";
import { setSaveState } from "../../redux/slices/diagramSlice";
import { openDiagram } from "../../redux/thunks/diagramThunks";
import Toolbar from "../banner/Toolbar";
import Debug from "../debug/Debug";
import { DebugLayerDialog } from "../dialog/DebugLayerDialog";
import CanvasDraggableElement from "../dnd/CanvasDraggableElement";
import { CanvasDragLayer } from "../dnd/CanvasDragLayer";
import { CanvasDropContainer } from "../dnd/CanvasDropContainer";
import GridDropField from "../dnd/GridDropField";
import SequencesPulseDropField from "../dnd/SequencesPulseDropField";
import QuietUploadArea from "../QuietUploadArea";
import { HitboxLayer } from "./HitboxLayer";
import { LineTool } from "./LineTool";


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
	const dispatch = useAppDispatch();

	const debugSelectionTypes = useAppSelector((state) => state.application.debugSelectionTypes);
	const selectedElementId: string | undefined = useAppSelector((state) => state.application.selectedElementId);

	const [hoveredElement, setHoveredElement] = useState<Visual | undefined>(undefined);
	const [rawHoveredElement, setRawHoveredElement] = useState<Visual | undefined>(undefined);
	const [debugElements, setDebugElements] = useState<Visual[]>([]);
	const [zoom, setZoom] = useState(2);
	const [zoomString, setZoomString] = useState("2");
	const [isZoomEditing, setIsZoomEditing] = useState(false);

	const diagramSvgRef = useRef<HTMLDivElement | null>(null);
	const transformComponentRef = useRef<ReactZoomPanPinchContentRef | null>(null);

	const selectedElement = ENGINE.handler.identifyElement(selectedElementId ?? "")
	const { isDragging } = useDragLayer((monitor) => ({
		isDragging: monitor.isDragging()
	}));

	const interactiveElements: Visual[] = [];
	if (selectedElement) {
		interactiveElements.push(selectedElement);
	}
	if (props.selectedTool.type === "select" && hoveredElement && hoveredElement.id !== selectedElement?.id) {
		interactiveElements.push(hoveredElement);
	}
	
	const interactiveElementIds = interactiveElements.map(e => e.id).join(",");
	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	const deselect = () => {
		selectedElement?.svg?.show();
		dispatch(setSelectedElementId(undefined));
	};

	const stopHover = () => {
		setHoveredElement(undefined);
		setRawHoveredElement(undefined);
	};

	const selectVisual = (e: Visual) => {
		dispatch(setSelectedElementId(e.id));
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

	const handleDiagramDrop = async (file: File) => {
		dispatch(openDiagram(file));
	};

	const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		if (rawHoveredElement) {
			let path: Visual[] = [];
			let curr: Visual | undefined = rawHoveredElement;
			while (curr) {
				path.unshift(curr);
				if (curr.parentId === undefined || curr.parentId === ENGINE.handler.diagram.id || curr.parentId === curr.id) {
					break;
				}
				curr = ENGINE.handler.identifyElement(curr.parentId);
			}

			let currentSelectedId = selectedElementId ?? hoveredElement?.id;
			let selectedIndex = path.findIndex(el => el.id === currentSelectedId);
			
			if (selectedIndex !== -1) {
				if (selectedIndex + 1 < path.length) {
					selectVisual(path[selectedIndex + 1]);
				}
			} else if (path.length > 1) {
				selectVisual(path[1]);
			}
		}
	};

	const constOnHitboxHover = (element?: Visual, rawElement?: Visual) => {
		setHoveredElement(element);
		setRawHoveredElement(rawElement);
	};

	const onConfirmZoomEntry = (val: string) => {
		setIsZoomEditing(false);
		let newZoom = parseFloat(val);
		if (!isNaN(newZoom) && newZoom > 0) {
			newZoom = Math.min(Math.max(newZoom, 0.5), 5);
			setZoom(newZoom);
			setZoomString(String(Math.round(newZoom * 100) / 100));

			const ctx = transformComponentRef.current;
			if (ctx) {
				const { positionX, positionY, scale: oldScale } = ctx.instance.transformState;
				const rect = ctx.instance.wrapperComponent?.getBoundingClientRect();
				let nx = positionX;
				let ny = positionY;
				if (rect) {
					const cx = rect.width / 2;
					const cy = rect.height / 2;
					nx = cx - (cx - positionX) * (newZoom / oldScale);
					ny = cy - (cy - positionY) * (newZoom / oldScale);
				}
				ctx.setTransform(nx, ny, newZoom, 0);
			}
		} else {
			setZoomString(String(Math.round(zoom * 100) / 100));
		}
	}

	useEffect(() => {
		if (!isZoomEditing) {
			setZoomString(String(Math.round(zoom * 100) / 100));
		}
	}, [zoom, isZoomEditing]);

	useEffect(() => {
		interactiveElements.forEach(el => el.svg?.hide());

		return () => {
			interactiveElements.forEach(el => el.svg?.show());
		};
	}, [interactiveElementIds]);

	// Refresh canvas
	useEffect(() => {
		if (diagramSvgRef.current && ENGINE.handler.diagram.svg) {
			diagramSvgRef.current.replaceChildren();
			diagramSvgRef.current.appendChild(ENGINE.surface.node);
		}

		dispatch(setSaveState("unsaved"))
	}, [store]);

	return (
		<>
			<QuietUploadArea onDrop={handleDiagramDrop} acceptExtension=".nmrd">
				<div
					style={{
						width: "100%",
						height: "100%",
						display: "flex",
						flexDirection: "column",
						position: "relative"
					}}
					onClick={(e) => {
						onClick(e);
					}}
					onDoubleClick={(e) => {
						handleDoubleClick(e);
					}}
					onMouseUp={(e) => {
						singleClick(e);
						deselect();
					}}>
					<Toolbar />
					<div style={{ flex: 1, position: "relative", width: "100%", overflow: "hidden" }}>
						<div
							style={{
								position: "absolute",
								top: "6px",
								left: "6px",
								zIndex: 10,
								display: "flex",
								flexDirection: "column",
								alignItems: "normal",
								gap: "6px"
							}}>
							<Button size="small" variant="outlined" style={{ width: "16px" }}
								icon="target"
								onClick={() => transformComponentRef.current?.centerView()}
							/>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									background: "white",
									padding: "1px 4px",

									boxShadow: "0 1px 1px rgba(16, 22, 26, 0.1)",
									fontSize: "10px",
									fontWeight: "bold",
									color: "#182026",
									cursor: "text",
									width: "32px"
								}}>
								<EditableText minWidth={16}
									value={zoomString}
									onChange={(val) => setZoomString(val)}
									onConfirm={onConfirmZoomEntry}
									onEdit={() => setIsZoomEditing(true)}
									selectAllOnFocus={true}
								/>
								<span style={{ marginLeft: "1px", color: "#5c7080", pointerEvents: "none" }}>x</span>
							</div>

						</div>


						<CanvasDropContainer scale={zoom}>
							<TransformWrapper
								ref={transformComponentRef}
								initialScale={zoom}
								onZoom={(z) => {
									setZoom(z.state.scale);
								}}
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
												zIndex: 10001,
												pointerEvents: "none",
												transform: `translate(${ENGINE.handler.diagram.x < 0 ? Math.abs(ENGINE.handler.diagram.x) : 0
													}px, ${ENGINE.handler.diagram.y < 0 ? Math.abs(ENGINE.handler.diagram.y) : 0
													}px)`
											}}>

											{/* Draggable elements - Render for Selected OR Hovered (if select tool) */}
											{interactiveElements.map((el) => (
												<CanvasDraggableElement
													key={el.id}
													reselect={reselect}
													name={el.ref}
													element={el}
													visualState={el.id === selectedElement?.id ? "selected" : "hovered"}
													x={el.x}
													y={el.y}></CanvasDraggableElement>
											))}


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
												selectedElementId={selectedElementId}
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
				</div>
			</QuietUploadArea>

			<DebugLayerDialog />
		</>
	);
};

export default Canvas;
