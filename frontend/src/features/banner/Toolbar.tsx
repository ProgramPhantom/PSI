import { Button, ButtonGroup, Colors, Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core";
import React from "react";
import { useAppDispatch } from "../../redux/hooks";
import * as Actions from "../dialog/actions";

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
							<MenuItem icon="document" text="New" onClick={() => Actions.handleNewDiagram()} />
							<MenuItem text="Open..." onClick={() => Actions.openLoadDialog(dispatch)} />
							<MenuItem text="Save" onClick={() => Actions.handleSaveDiagram(dispatch)} />
							<MenuItem text="Save As..." onClick={() => Actions.openSaveAsDialog(dispatch)} />
						</Menu>
					}>
					<Button text="File" />
				</Popover>
				<Popover hoverOpenDelay={0} interactionKind="hover"
					hoverCloseDelay={0} minimal={true}
					position={Position.BOTTOM_LEFT}
					content={
						<Menu>
							<MenuItem text="Undo" onClick={() => Actions.handleUndo()} />
							<MenuItem text="Redo" onClick={() => Actions.handleRedo()} />
							<MenuDivider />
							<MenuItem text="Cut" onClick={() => { }} />
							<MenuItem text="Copy" onClick={() => Actions.handleCopyState()} />
							<MenuItem text="Paste" onClick={() => { }} />
						</Menu>
					}>
					<Button text="Edit" />
				</Popover>
			</ButtonGroup>
		</div>
	);
};

export default Toolbar;
