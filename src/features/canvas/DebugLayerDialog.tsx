import { Checkbox, Dialog, DialogBody } from "@blueprintjs/core";
import { AllComponentTypes } from "../../logic/point";


interface IDebugLayerDialogProps {
	debugSelection: Record<AllComponentTypes, boolean>;
	setDebugSelection: (elementType: AllComponentTypes) => void;
	open: boolean;
	setOpen: (val: boolean) => void;
}

export function DebugLayerDialog(props: IDebugLayerDialogProps) {
	return (
		<Dialog
			style={{width: "400px"}}
			isOpen={props.open}
			onClose={() => {
				props.setOpen(false);
			}}
			title="Debug Layers"
			canOutsideClickClose={true}
			canEscapeKeyClose={true}
			icon="wrench">
			<DialogBody style={{}}>
				<div style={{display: "flex", flexDirection: "column"}}>
					<Checkbox
						label="Elements"
						alignIndicator="end"
						checked={props.debugSelection["rect"]}
						onChange={() => {
							props.setDebugSelection("svg");
						}}></Checkbox>
					<Checkbox
						label="Channels"
						alignIndicator="end"
						checked={props.debugSelection["channel"]}
						onChange={() => {
							props.setDebugSelection("channel");
						}}></Checkbox>

					<Checkbox
						label="Sequences"
						alignIndicator="end"
						checked={props.debugSelection["sequence"]}
						onChange={() => {
							props.setDebugSelection("sequence");
						}}></Checkbox>

					<Checkbox
						label="Diagram"
						alignIndicator="end"
						checked={props.debugSelection["diagram"]}
						onChange={() => {
							props.setDebugSelection("diagram");
						}}></Checkbox>
				</div>
			</DialogBody>
		</Dialog>
	);
}
