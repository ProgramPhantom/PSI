import { Button, ButtonGroup, Colors, Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core";
import React from "react";
import { useAppDispatch } from "../../redux/hooks";
import * as Actions from "../../redux/thunks/actionThunks";
import { setLoadDialogOpen, setPNGDialogOpen, setSaveAsDialogOpen } from "../../redux/slices/dialogSlice";

const Toolbar: React.FC = () => {
	const dispatch = useAppDispatch();

	return (
		<div
			style={{
				width: "100%",
				borderBottom: `1px solid ${Colors.LIGHT_GRAY1}`,
				display: "flex",
				padding: "1px 0px",
				alignItems: "center",
				zIndex: 0
			}}>
			<ButtonGroup variant="outlined" size="small">
				<Popover hoverOpenDelay={0} interactionKind="hover" minimal={true}
					hoverCloseDelay={0}
					position={Position.BOTTOM_LEFT}
					content={
						<Menu>
							<MenuItem icon="document" text="New" onClick={() => dispatch(Actions.handleNewDiagram())} />
							<MenuItem icon="folder-open" text="Open..." onClick={() => dispatch(setLoadDialogOpen(true))} />
							<MenuItem icon="blank" text="Save" onClick={() => dispatch(Actions.handleSaveDiagram())} />
							<MenuItem icon="floppy-disk" text="Save As..." onClick={() => dispatch(setSaveAsDialogOpen(true))} />
						</Menu>
					}>
					<Button text="File" />
				</Popover>
				<Popover hoverOpenDelay={0} interactionKind="hover"
					hoverCloseDelay={0} minimal={true}
					position={Position.BOTTOM_LEFT}
					content={
						<Menu>
							<MenuItem icon="undo" text="Undo" onClick={() => dispatch(Actions.handleUndo())} />
							<MenuItem icon="redo" text="Redo" onClick={() => dispatch(Actions.handleRedo())} />
							<MenuDivider />

							<MenuItem icon="duplicate" text="Copy state" onClick={() => dispatch(Actions.handleCopyState())} />
						</Menu>
					}>
					<Button text="Edit" />
				</Popover>
				<Popover hoverOpenDelay={0} interactionKind="hover"
					hoverCloseDelay={0} minimal={true}
					position={Position.BOTTOM_LEFT}
					content={
						<Menu>
							<MenuItem icon="cloud-download" text="Export SVG" onClick={() => dispatch(Actions.handleSaveSVG())} />
							<MenuItem icon="media" text="Export PNG" onClick={() => dispatch(setPNGDialogOpen(true))} />
							<MenuDivider />
							<MenuItem icon="document-share" text="Export .nmrd" onClick={() => dispatch(Actions.handleExportDiagramFile())} />
						</Menu>
					}>
					<Button text="Export" />
				</Popover>
				<Popover hoverOpenDelay={0} interactionKind="hover"
					hoverCloseDelay={0} minimal={true}
					position={Position.BOTTOM_LEFT}
					content={
						<Menu>
							<MenuItem icon="bug" text="Report bug" onClick={() => dispatch(Actions.handleDebugIssue())} />
							<MenuDivider />
							<MenuItem icon="info-sign" text="About" onClick={() => { }} />
						</Menu>
					}>
					<Button text="Help" />
				</Popover>
			</ButtonGroup>
		</div>
	);
};

export default Toolbar;
