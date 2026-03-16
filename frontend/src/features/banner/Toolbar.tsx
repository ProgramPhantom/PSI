import { Button, ButtonGroup, Colors, Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core";
import React from "react";
import { useAppDispatch } from "../../redux/hooks";
import * as Actions from "../dialog/actions";
import { setLoadDialogOpen, setSaveAsDialogOpen } from "../../redux/slices/dialogSlice";

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
							<MenuItem icon="floppy-disk" text="Save" onClick={() => dispatch(Actions.handleSaveDiagram())} />
							<MenuItem icon="clean" text="Save As..." onClick={() => dispatch(setSaveAsDialogOpen(true))} />
							<MenuItem icon="cloud-download" text="Export SVG" onClick={() => dispatch(Actions.handleSaveSVG())} />
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
							<MenuItem icon="cut" text="Cut" onClick={() => { }} />
							<MenuItem icon="duplicate" text="Copy" onClick={() => dispatch(Actions.handleCopyState())} />
							<MenuItem icon="clipboard" text="Paste" onClick={() => { }} />
						</Menu>
					}>
					<Button text="Edit" />
				</Popover>
			</ButtonGroup>
		</div>
	);
};

export default Toolbar;
