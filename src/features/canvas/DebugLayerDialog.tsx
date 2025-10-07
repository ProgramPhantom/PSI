import {Checkbox, Dialog, DialogBody} from "@blueprintjs/core";
import {AllElementIdentifiers} from "../../logic/diagramHandler";

interface IDebugLayerDialogProps {
	debugSelection: Record<AllElementIdentifiers, boolean>;
	setDebugSelection: (elementType: AllElementIdentifiers) => void;
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
						label="Pulse columns"
						alignIndicator="end"
						checked={props.debugSelection["pulse columns"]}
						onChange={() => {
							props.setDebugSelection("pulse columns");
						}}></Checkbox>
					<Checkbox
						label="Elements"
						alignIndicator="end"
						checked={props.debugSelection["rect"]}
						onChange={() => {
							props.setDebugSelection("svg");
						}}></Checkbox>

					<Checkbox
						label="Label Column"
						alignIndicator="end"
						checked={props.debugSelection["label column"]}
						onChange={() => {
							props.setDebugSelection("label column");
						}}></Checkbox>

					<Checkbox
						label="Channels"
						alignIndicator="end"
						checked={props.debugSelection["channel"]}
						onChange={() => {
							props.setDebugSelection("channel");
						}}></Checkbox>

					<Checkbox
						label="Upper aligners"
						alignIndicator="end"
						checked={props.debugSelection["top aligner"]}
						onChange={() => {
							props.setDebugSelection("top aligner");
						}}></Checkbox>

					<Checkbox
						label="Lower aligners"
						alignIndicator="end"
						checked={props.debugSelection["bottom aligner"]}
						onChange={() => {
							props.setDebugSelection("bottom aligner");
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
