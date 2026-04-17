import { Checkbox, Dialog, DialogBody } from "@blueprintjs/core";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { toggleDebugSelectionType } from "../../redux/slices/applicationSlice";
import { setDebugLayerDialogOpen } from "../../redux/slices/dialogSlice";


export function DebugLayerDialog() {
	const dispatch = useAppDispatch();
	const open = useAppSelector((state) => state.dialog.isDebugLayerDialogOpen);
	const debugSelection = useAppSelector((state) => state.application.debugSelectionTypes);

	return (
		<Dialog
			style={{ width: "400px" }}
			isOpen={open}
			onClose={() => {
				dispatch(setDebugLayerDialogOpen(false));
			}}
			title="Debug Layers"
			canOutsideClickClose={true}
			canEscapeKeyClose={true}
			icon="wrench">
			<DialogBody style={{}}>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<Checkbox
						label="Pulses"
						alignIndicator="end"
						checked={debugSelection["svg"]}
						onChange={() => {
							dispatch(toggleDebugSelectionType("svg"));
						}}></Checkbox>
					<Checkbox
						label="Channels"
						alignIndicator="end"
						checked={debugSelection["channel"]}
						onChange={() => {
							dispatch(toggleDebugSelectionType("channel"));
						}}></Checkbox>

					<Checkbox
						label="Sequences"
						alignIndicator="end"
						checked={debugSelection["sequence"]}
						onChange={() => {
							dispatch(toggleDebugSelectionType("sequence"));
						}}></Checkbox>

					<Checkbox
						label="Diagram"
						alignIndicator="end"
						checked={debugSelection["diagram"]}
						onChange={() => {
							dispatch(toggleDebugSelectionType("diagram"));
						}}></Checkbox>

					<Checkbox
						label="Sequence Aligner"
						alignIndicator="end"
						checked={debugSelection["sequence-aligner"]}
						onChange={() => {
							dispatch(toggleDebugSelectionType("sequence-aligner"));
						}}></Checkbox>
				</div>
			</DialogBody>
		</Dialog>
	);
}

