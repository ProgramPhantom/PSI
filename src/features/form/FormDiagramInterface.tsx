import { AnchorButton, Button, Dialog, DialogBody, Divider, EntityTitle, H5, Icon, Tooltip } from "@blueprintjs/core";
import { useRef, useState } from "react";
import { ObjectInspector } from "react-inspector";
import { appToaster } from "../../app/Toaster";
import { ActionResult } from "../../logic/diagramHandler";
import ENGINE from "../../logic/engine";
import { UserComponentType } from "../../logic/point";
import { IVisual } from "../../logic/visual";
import { FormHolderProps } from "./FormBase";
import { LabelGroupComboForm, SubmitButtonRef } from "./LabelGroupComboForm";


type FormEffect = "submit" | "delete" | "modify";


export function FormDiagramInterface(props: FormHolderProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const submitRef = useRef<SubmitButtonRef>(null);
	var [submissionValid, setSubmissionValid] = useState<boolean>(true);

	// Submit function
	const dispatchFormEffect = (
		values: IVisual,
		effect: FormEffect
	) => {

		switch (effect) {
			case "submit":
				ENGINE.handler.act({
					type: "add",
					input: {
						child: values
					}
				})
				break;
			case "modify":
				if (props.target === undefined) {
					throw new Error(`Calling modification function with no selected target`)
				}
				ENGINE.handler.act({
					type: "modify",
					input: {
						child: values,
						target: props.target
					}
				})
				break;
			case "delete":
				if (props.target === undefined) {
					throw new Error(`Calling deletion function with no selected target`)
				}
				ENGINE.handler.act({
					type: "remove",
					input: {
						child: props.target
					}
				})
				break;
		}
	}

	return (
		<>
			<div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
				<div style={{ width: "100%" }}>
					<div
						style={{
							width: "100%",
							padding: "16px 8px 16px 8px",
							display: "flex",
							flexDirection: "row",
							alignItems: "center"
						}}>
						{props.target === undefined ? (
							<>
								<EntityTitle
									title={"Create Channel"}
									icon={
										<Icon
											icon="cube-add"
											onClick={() => {
												setIsDialogOpen(true);
											}}
											style={{ cursor: "help" }}></Icon>
									}
									heading={H5}></EntityTitle>
							</>
						) : (
							<>
								<EntityTitle
									title={`Modify '${props.target.ref}'`}
									icon={
										<Icon
											icon="add-child"
											onClick={() => {
												setIsDialogOpen(true);
											}}
											style={{ cursor: "help" }}></Icon>
									}
									heading={H5}></EntityTitle>
							</>
						)}

						{props.target !== undefined ? (
							<Button
								style={{
									height: "30px",
									alignSelf: "center",
									marginLeft: "auto"
								}}
								icon="trash"
								intent="danger"
								onClick={() => {
									dispatchFormEffect(
										props.target!,
										"delete"
									);
									props.changeTarget(undefined);
									appToaster.show({
										message: `Deleted element '${props.target?.ref}'`,
										intent: "danger",
										timeout: 1000
									});
								}}></Button>
						) : (
							<></>
						)}
					</div>

					<Divider style={{ margin: "0 0 16px 0" }}></Divider>
				</div>
			</div>

			<div
				style={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					padding: "0px"
				}}>
				<LabelGroupComboForm
					key={props.target ? props.target.id : "defaults"}
					ref={submitRef}
					objectType={props.targetType as UserComponentType}
					target={props.target}
					changeTarget={props.changeTarget}
					callback={(val: IVisual) => {
						props.target
							? dispatchFormEffect(val, "modify")
							: dispatchFormEffect(val, "submit");
						props.changeTarget(undefined);
					}}></LabelGroupComboForm>

				<div
					id="submit-area"
					style={{
						width: "100%",
						alignSelf: "center",
						margin: "4px 2px 18px 2px",
						padding: "0px 4px 0px 4px",
						height: "30px",
						marginTop: "auto",
						display: "flex",
						flexDirection: "column"
					}}>
					<Divider></Divider>


					<Tooltip
						content={`Modification for ${props.targetType} is not yet implemented`}
						disabled={submissionValid} position="top">
						<AnchorButton
							style={{ width: "100%" }}
							disabled={!submissionValid}
							onClick={() => submitRef.current?.submit()}
							text={props.target !== undefined ? "Apply" : "Add"}
							icon={props.target !== undefined ? "tick" : "add"}></AnchorButton>
					</Tooltip>
				</div>
			</div>

			{/* DEBUG: Inspect object dialog */}
			<Dialog
				style={{ width: "800px", height: "500px" }}
				isOpen={isDialogOpen}
				onClose={() => {
					setIsDialogOpen(false);
				}}
				title="Element details"
				canOutsideClickClose={true}
				canEscapeKeyClose={true}
				icon="wrench">
				<DialogBody style={{ overflowY: "scroll" }}>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<EntityTitle title={"State"} icon="wrench-time"></EntityTitle>

						<ObjectInspector data={props.target}></ObjectInspector>

						<Divider style={{ marginBottom: "8px" }}></Divider>
						<EntityTitle title={"Bindings"} icon="bring-data"></EntityTitle>

						<ObjectInspector
							data={props.target?.bindings.map((b) => b)}></ObjectInspector>

						<Divider style={{ marginBottom: "8px" }}></Divider>
						<EntityTitle title={"Binds to this"} icon="bring-forward"></EntityTitle>

						<ObjectInspector
							data={props.target?.bindingsToThis.map((b) => b)}></ObjectInspector>

						<Divider style={{ marginBottom: "8px" }}></Divider>
						<EntityTitle title={"All elements"} icon="zoom-in"></EntityTitle>

						<ObjectInspector data={ENGINE.handler.allElements}></ObjectInspector>
					</div>
				</DialogBody>
			</Dialog>
		</>
	);
}
