import { Button, Icon, Navbar } from "@blueprintjs/core";
import React from "react";
import { Tool } from "../../app/App";
import { defaultLine } from "../../logic/default/index";
import ENGINE from "../../logic/engine";
import { ILineStyle } from "../../logic/line";
import { useGetMeQuery } from "../../redux/api/api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { AnnotateDropdown } from "./AnnotateDropdown";
import * as Actions from "../dialog/actions";
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
				<Navbar.Divider />
				<Button
					size="small"
					variant="minimal"
					icon="folder-open"
					text="Open"
					onClick={() => dispatch(setLoadDialogOpen(true))}
				/>
				<Navbar.Divider />
				<Button
					size="small"
					variant="minimal"
					icon="download"
					text="Download"
					onClick={() => dispatch(Actions.handleExportDiagramFile())}
				/>
				<Navbar.Divider />

				<Navbar.Divider />
				<Button
					size="small"
					variant="minimal"
					icon="document"
					text="New"
					onClick={() => dispatch(Actions.handleNewDiagram())}
				/>
				<Navbar.Divider />
				<Button
					size="small"
					variant="minimal"
					icon="clean"
					text="Save As"
					onClick={() => dispatch(setSaveAsDialogOpen(true))}
				/>
				<Navbar.Divider />
				<Button
					size="small"
					variant="minimal"
					icon="floppy-disk"
					onClick={() => dispatch(Actions.handleSaveDiagram())}
				/>
				<Navbar.Divider />
				<Button
					size="small"
					variant="minimal"
					icon="trash"
					text="Clear State"
					onClick={() => dispatch(Actions.handleClearState())}
				/>

				<Navbar.Divider />
				<Button
					size="small"
					variant="minimal"
					icon="undo"
					text="Undo"
					disabled={!ENGINE.handler.canUndo}
					onClick={() => dispatch(Actions.handleUndo())}
				/>
				<Button
					size="small"
					variant="minimal"
					icon="redo"
					text="Redo"
					disabled={!ENGINE.handler.canRedo}
					onClick={() => dispatch(Actions.handleRedo())}
				/>

				<Navbar.Divider />
				<Navbar.Divider />
				<AnnotateDropdown
					selectedTool={props.selectedTool}
					setTool={props.setTool}></AnnotateDropdown>

				<Navbar.Divider />
				<Navbar.Divider />
				<Navbar.Group>
					<Button
						size="small"
						variant="minimal"
						icon="cloud-download"
						text="Save SVG"
						onClick={() => dispatch(Actions.handleSaveSVG())}
					/>
					<Navbar.Divider />
					<Button
						size="small"
						variant="minimal"
						icon="media"
						text="Save PNG"
						onClick={() => dispatch(setPNGDialogOpen(true))}
					/>
				</Navbar.Group>
			</Navbar.Group>

			<Navbar.Group align={"right"}>
				<Button
					variant="minimal"
					icon="folder-open"
					text="Diagrams"
					onClick={() => dispatch(setDiagramsDialogOpen(true))}
					style={{ marginRight: "10px" }}
				/>
				{user ? (
					<Button
						icon="user" intent="primary"
						text={user.firstname || "User"}
						onClick={() => dispatch(setUserDialogOpen(true))}
						style={{ marginRight: "10px" }}
					/>
				) : (
					<Button
						variant="minimal"
						icon="user"
						text="Sign in"
						onClick={() => dispatch(setLoginDialogOpen(true))}
						style={{ marginRight: "10px" }}
					/>
				)}

				<Button
					size="small"
					variant="minimal"
					icon="bug"
					onClick={() => dispatch(Actions.handleDebugIssue())}
				/>

			</Navbar.Group>

		</Navbar>
	);
}
