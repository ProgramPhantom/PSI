import { Drawer, Position, Spinner } from "@blueprintjs/core";
import { SVG } from "@svgdotjs/svg.js";
import { saveAs } from "file-saver";
import localforage from "localforage";
import { ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import Banner from "../features/banner/Banner";
import Console from "../features/banner/Console";
import Canvas from "../features/canvas/Canvas";
import ComponentResizer from "../features/canvas/ComponentResizer";
import { IDrawArrowConfig } from "../features/canvas/LineTool";
import { GlobalDialogs } from "../features/dialog/GlobalDialogs";
import ElementsDraw from "../features/elementDraw/ElementsDraw";
import Form from "../features/Form";
import ENGINE from "../logic/engine";
import { api } from "../redux/api/api";
import { useAppDispatch } from "../redux/hooks";
import { initialiseAssets } from "../redux/thunks/assetThunks";
import { openDiagram } from "../redux/thunks/diagramThunks";
import { syncUserSchemes } from "../redux/thunks/schemeThunks";
import { appToaster } from "./Toaster";
import { WelcomeDialog } from "../features/dialog/WelcomeDialog";

ENGINE.surface = SVG().attr({ "pointer-events": "bounding-box" });


export interface IToolConfig { }

export type Tool = { type: "select"; config: {} } | { type: "arrow"; config: IDrawArrowConfig };

function App() {
	const dispatch = useAppDispatch();

	useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		let isMounted = true;

		async function startApp() {
			// 1. Initialize core application assets
			await dispatch(initialiseAssets());

			// 2. Await the authentication state 
			// (Either it succeeds to load the user, or it predictably fails because we are not logged in)
			try {
				await dispatch(api.endpoints.getMe.initiate(undefined)).unwrap();
			} catch (e) {
				// Handled inherently by RTK Query / auth logic downstream
			}

			// 3. Sync schemes. This only does anything if step 2 succeeded, fetching user schemes from the DB.
			await dispatch(syncUserSchemes());

			if (isMounted) {
				// 4. Open local diagram file
				try {
					const blob = await localforage.getItem<Blob>(ENGINE.DiagramStoreName);
					if (blob) {
						const file = new File([blob], "local-diagram.nmrd");
						await dispatch(openDiagram(file)).unwrap();
					} else {
						ENGINE.loadDiagramState();
					}
				} catch (e) {
					console.warn("Failed to load local diagram", e);
					ENGINE.loadDiagramState();
				}

				setIsInitializing(false);
			}
		}

		startApp();

		return () => { isMounted = false; };
	}, [dispatch]);

	const [isConsoleOpen, setIsConsoleOpen] = useState(false);

	const [selectedTool, setSelectedTool] = useState<Tool>({
		type: "select",
		config: {}
	});



	// Set up automatic saving every 2 seconds
	// useEffect(() => {
	//   const interval = setInterval(() => {
	//     ENGINE.save();
	//   }, 2000);
	//
	//   // Cleanup interval on component unmount
	//   return () => clearInterval(interval);
	// }, []);

	const setTool = (tool: Tool) => {
		setSelectedTool(tool);
	};




	const canvas: ReactNode = (
		<Canvas
			selectedTool={selectedTool}
			setTool={setSelectedTool}></Canvas>
	);


	if (isInitializing) {
		return (
			<div style={{ display: "flex", width: "100vw", height: "100vh", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "20px" }}>
				<Spinner size={50} intent="primary" />
				<h3 className="bp5-heading text-muted">Loading Engine</h3>
			</div>
		);
	}

	return (
		<>
			<div
				style={{
					display: "flex",
					height: "100%",
					width: "100%",
					flexDirection: "column"
				}}>
				<div style={{ width: "100%" }}>
					<Banner
						selectedTool={selectedTool}
						setTool={setTool}></Banner>
				</div>

				<div style={{ display: "flex", height: "100%", width: "100%" }}>
					<div
						style={{
							flex: "1 1",
							height: "100%",
							display: "flex",
							flexDirection: "column"
						}}>
						<div
							style={{
								height: "100%",
								position: "relative",
								cursor: selectedTool.type === "select" ? "default" : "crosshair"
							}}>
							{canvas}
						</div>

						<div
							style={{
								position: "relative",
								bottom: "0px",
								display: "flex",
								flexDirection: "column",
								borderTop: "1px solid #c7c7c7"
							}}>
							<ComponentResizer
								resizeDirection="vertical"
								defaultHeight={388}
								maxHeight={600}
								minHeight={240}
								panelName="Elements">
								<ElementsDraw></ElementsDraw>
							</ComponentResizer>
						</div>
					</div>

					<div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
						<ComponentResizer
							resizeDirection="horizontal"
							defaultWidth={400}
							minWidth={200}
							maxWidth={800}>
							<Form></Form>
						</ComponentResizer>
					</div>
				</div>
			</div>

			{/* Console Drawer */}
			<Drawer
				isOpen={isConsoleOpen}
				onClose={() => setIsConsoleOpen(false)}
				position={Position.BOTTOM}
				size="50%"
				title="Console Output"
				icon="console">
				<Console isOpen={isConsoleOpen} />
			</Drawer>


			<GlobalDialogs />
		</>
	);
}

export default App;
