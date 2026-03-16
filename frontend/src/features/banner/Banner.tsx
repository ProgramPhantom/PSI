import { Button, Icon, Navbar, Position, Tooltip } from "@blueprintjs/core";
import React from "react";
import { Tool } from "../../app/App";
import { defaultLine } from "../../logic/default/index";
import ENGINE from "../../logic/engine";
import { ILineStyle } from "../../logic/line";
import { useGetMeQuery } from "../../redux/api/api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { AnnotateDropdown } from "./AnnotateDropdown";
import * as Actions from "../../redux/thunks/actionThunks";
import { setDiagramsDialogOpen, setLoadDialogOpen, setLoginDialogOpen, setPNGDialogOpen, setSaveAsDialogOpen, setUserDialogOpen } from "../../redux/slices/dialogSlice";

export interface IBannerProps {
	selectedTool: Tool;
	setTool: (tool: Tool) => void;
}

export default function Banner(props: IBannerProps) {
	const { data: user } = useGetMeQuery();
	const dispatch = useAppDispatch();

	const selectLineTool = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (props.selectedTool.type === "arrow") {
			props.setTool({ type: "select", config: {} });
			e.preventDefault();
			e.stopPropagation();
		} else {
			props.setTool({
				type: "arrow",
				config: { lineStyle: defaultLine.lineStyle as ILineStyle, mode: "bind" }
			});
		}
	};

	return (
		<Navbar>
			<Navbar.Group>
				<Icon icon="pulse" size={20} style={{ marginRight: "10px" }}></Icon>
				<Navbar.Heading>Pulse Planner v0.5.3 (BETA)</Navbar.Heading>
				<Tooltip content="Open (Ctrl+O)" position={Position.BOTTOM}>
					<Button
						size="medium"
						variant="minimal"
						icon="folder-open"
						onClick={() => dispatch(setLoadDialogOpen(true))}
					/>
				</Tooltip>
				<Navbar.Divider />
				<Tooltip content="Export .nmrd (Ctrl+Alt+S)" position={Position.BOTTOM}>
					<Button
						size="medium"
						variant="minimal"
						icon="document-share"
						onClick={() => dispatch(Actions.handleExportDiagramFile())}
					/>
				</Tooltip>
				<Navbar.Divider />
				<Tooltip content="New (Ctrl+N)" position={Position.BOTTOM}>
					<Button
						size="medium"
						variant="minimal"
						icon="document"
						onClick={() => dispatch(Actions.handleNewDiagram())}
					/>
				</Tooltip>
				<Navbar.Divider />
				<Tooltip content="Save As (Ctrl+Shift+S)" position={Position.BOTTOM}>
					<Button
						size="medium"
						variant="minimal"
						icon="floppy-disk"
						onClick={() => dispatch(setSaveAsDialogOpen(true))}
					/>
				</Tooltip>
				<Navbar.Divider />
				<Tooltip content="Save (Ctrl+S)" position={Position.BOTTOM}>
					<Button
						size="medium"
						variant="minimal"
						icon="saved"
						onClick={() => dispatch(Actions.handleSaveDiagram())}
					/>
				</Tooltip>
				<Navbar.Divider />
				<Tooltip content="Undo (Ctrl+Z)" position={Position.BOTTOM}>
					<Button
						size="medium"
						variant="minimal"
						icon="undo"
						disabled={!ENGINE.handler.canUndo}
						onClick={() => dispatch(Actions.handleUndo())}
					/>
				</Tooltip>
				<Navbar.Divider />
				<Tooltip content="Redo (Ctrl+Y)" position={Position.BOTTOM}>
					<Button
						size="medium"
						variant="minimal"
						icon="redo"
						disabled={!ENGINE.handler.canRedo}
						onClick={() => dispatch(Actions.handleRedo())}
					/>
				</Tooltip>
				<Navbar.Divider />

				{/* 
				<AnnotateDropdown
					selectedTool={props.selectedTool}
					setTool={props.setTool}>
				</AnnotateDropdown>
				*/}


				<Navbar.Group>
					<Tooltip content="Export SVG (Alt+Shift+S)" position={Position.BOTTOM}>
						<Button
							size="medium"
							variant="minimal"
							icon="cloud-download"
							onClick={() => dispatch(Actions.handleSaveSVG())}
						/>
					</Tooltip>
					<Navbar.Divider />
					<Tooltip content="Export PNG (Ctrl+E)" position={Position.BOTTOM}>
						<Button
							size="medium"
							variant="minimal"
							icon="media"
							onClick={() => dispatch(setPNGDialogOpen(true))}
						/>
					</Tooltip>
				</Navbar.Group>
			</Navbar.Group>

			<Navbar.Group align={"right"}>
				<Tooltip content="Diagrams" position={Position.BOTTOM}>
					<Button
						variant="minimal"
						icon="folder-open"
						onClick={() => dispatch(setDiagramsDialogOpen(true))}
						style={{ marginRight: "10px" }}
					/>
				</Tooltip>
				{user ? (
					<Tooltip content="Account Settings" position={Position.BOTTOM}>
						<Button
							icon="user" intent="primary"
							text={user.firstname || "User"}
							onClick={() => dispatch(setUserDialogOpen(true))}
							style={{ marginRight: "10px" }}
						/>
					</Tooltip>
				) : (
					<Tooltip content="Sign in" position={Position.BOTTOM}>
						<Button
							variant="minimal"
							icon="user"
							text="Sign in"
							onClick={() => dispatch(setLoginDialogOpen(true))}
							style={{ marginRight: "10px" }}
						/>
					</Tooltip>
				)}
			</Navbar.Group>

		</Navbar>
	);
}
