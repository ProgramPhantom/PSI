import { Button, ButtonGroup, Colors, EditableText, Icon, Menu, MenuDivider, MenuItem, Popover, Position, Tooltip } from "@blueprintjs/core";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import * as Actions from "../../redux/thunks/actionThunks";
import { setLoadDialogOpen, setPNGDialogOpen, setSaveAsDialogOpen } from "../../redux/slices/dialogSlice";
import { setFileName } from "../../redux/slices/diagramSlice";

const Toolbar: React.FC = () => {
	const dispatch = useAppDispatch();
	const { fileName, diagramUUID, saveState, diagramSource } = useAppSelector((state) => state.diagram);

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
			<div style={{ flex: 1, display: "flex", alignItems: "center" }}>
				<ButtonGroup variant="outlined" size="small">
					<Popover hoverOpenDelay={0} interactionKind="click" minimal={true}
						hoverCloseDelay={0}
						position={Position.BOTTOM_LEFT}
						content={
							<Menu>
								<MenuItem icon="document" text="New" label="Ctrl+N" onClick={() => dispatch(Actions.handleNewDiagram())} />
								<MenuItem icon="folder-open" text="Open..." label="Ctrl+O" onClick={() => dispatch(setLoadDialogOpen(true))} />
								<MenuItem icon="blank" text="Save" label="Ctrl+S" onClick={() => dispatch(Actions.handleSaveDiagram())} />
								<MenuItem icon="floppy-disk" text="Save As..." label="Ctrl+Shift+S" onClick={() => dispatch(setSaveAsDialogOpen(true))} />
							</Menu>
						}>
						<Button text="File" />
					</Popover>
					<Popover hoverOpenDelay={0} interactionKind="click"
						hoverCloseDelay={0} minimal={true}
						position={Position.BOTTOM_LEFT}
						content={
							<Menu>
								<MenuItem icon="undo" text="Undo" label="Ctrl+Z" onClick={() => dispatch(Actions.handleUndo())} />
								<MenuItem icon="redo" text="Redo" label="Ctrl+Y" onClick={() => dispatch(Actions.handleRedo())} />
								<MenuDivider />

								<MenuItem icon="duplicate" text="Copy state" label="Ctrl+Shift+C" onClick={() => dispatch(Actions.handleCopyState())} />
								<MenuItem icon="trash" text="Clear state" onClick={() => dispatch(Actions.handleClearState())} />
							</Menu>
						}>
						<Button text="Edit" />
					</Popover>
					<Popover hoverOpenDelay={0} interactionKind="click"
						hoverCloseDelay={0} minimal={true}
						position={Position.BOTTOM_LEFT}
						content={
							<Menu>
								<MenuItem icon="cloud-download" text="Export SVG" label="Alt+Shift+S" onClick={() => dispatch(Actions.handleSaveSVG())} />
								<MenuItem icon="media" text="Export PNG" label="Ctrl+E" onClick={() => dispatch(setPNGDialogOpen(true))} />
								<MenuDivider />
								<MenuItem icon="document-share" text="Export .nmrd" label="Ctrl+Alt+S" onClick={() => dispatch(Actions.handleExportDiagramFile())} />
							</Menu>
						}>
						<Button text="Export" />
					</Popover>
					<Popover hoverOpenDelay={0} interactionKind="click"
						hoverCloseDelay={0} minimal={true}
						position={Position.BOTTOM_LEFT}
						content={
							<Menu>
								<MenuItem icon="bug" text="Report bug" label="Ctrl+B" onClick={() => dispatch(Actions.handleDebugIssue())} />
								<MenuDivider />
								<MenuItem icon="info-sign" text="About" active={false} disabled={true} onClick={() => { }} />
							</Menu>
						}>
						<Button text="Help" />
					</Popover>
				</ButtonGroup>
			</div>

			<div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", color: Colors.GRAY1 }}>
				<div style={{ display: "flex", alignItems: "center" }}>
					<span style={{ marginRight: "4px" }}>File name:</span>
					<EditableText defaultValue="untitled"
						value={fileName}
						onChange={(v) => dispatch(setFileName(v.trim()))}
						onConfirm={(v) => {
							if (v.trim() === "") {
								dispatch(setFileName("untitled"));
							}
						}}
						onCancel={(v) => {
							if (v.trim() === "") {
								dispatch(setFileName("untitled"));
							}
						}}
						placeholder="Diagram Name"
						selectAllOnFocus={true}
					/>
					{saveState !== 'saved' && <span style={{ marginLeft: "2px" }}>*</span>}
				</div>

				<Tooltip content={diagramSource === "server" ? "Saved on server" : "Saved locally"} position={Position.BOTTOM}>
					<Icon icon={diagramSource === "server" ? "cloud" : "floppy-disk"} size={14} style={{ marginLeft: "6px", marginBottom: "2px", color: Colors.GRAY3 }} />
				</Tooltip>
				<Tooltip content={diagramUUID || "No UUID"} position={Position.BOTTOM}>
					<Icon icon="info-sign" size={12} style={{ marginLeft: "6px", marginBottom: "2px", cursor: "help", color: Colors.GRAY3 }} />
				</Tooltip>
			</div>

			<div style={{ flex: 1 }} />
		</div>
	);
};

export default Toolbar;
