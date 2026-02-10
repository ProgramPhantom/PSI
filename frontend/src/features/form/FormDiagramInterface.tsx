import { AnchorButton, Button, Dialog, DialogBody, Divider, EntityTitle, H5, Icon, Tooltip } from "@blueprintjs/core";
import { useRef, useState } from "react";
import { ObjectInspector } from "react-inspector";
import { appToaster } from "../../app/Toaster";
import ENGINE from "../../logic/engine";
import { setSelectedElementId } from "../../redux/applicationSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { AllComponentTypes, UserComponentType } from "../../logic/point";
import Visual, { IVisual } from "../../logic/visual";
import { LabelGroupComboForm, SubmitButtonRef } from "./LabelGroupComboForm";

type FormEffect = "submit" | "delete" | "modify";

export function FormDiagramInterface() {
	const dispatch = useAppDispatch();
	const selectedElementId = useAppSelector((state) => state.application.selectedElementId);
	const target = ENGINE.handler.identifyElement(selectedElementId ?? "");

	const changeTarget = (val: Visual | undefined) => {
		dispatch(setSelectedElementId(val?.id));
	};

	var targetType: AllComponentTypes = target
		? (target.constructor as typeof Visual).ElementType
		: "channel";
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
				if (target === undefined) {
					throw new Error(`Calling modification function with no selected target`)
				}
				ENGINE.handler.act({
					type: "modify",
					input: {
						child: values,
						target: target
					}
				})
				break;
			case "delete":
				if (target === undefined) {
					throw new Error(`Calling deletion function with no selected target`)
				}
				ENGINE.handler.act({
					type: "remove",
					input: {
						child: target
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
						{target === undefined ? (
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
									title={`Modify '${target.ref}'`}
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

						{target !== undefined ? (
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
										target!,
										"delete"
									);
									changeTarget(undefined);
									appToaster.show({
										message: `Deleted element '${target?.ref}'`,
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
					key={target ? target.id : "defaults"}
					ref={submitRef}
					objectType={targetType as UserComponentType}
					target={target}
					callback={(val: IVisual) => {
						target
							? dispatchFormEffect(val, "modify")
							: dispatchFormEffect(val, "submit");
						changeTarget(undefined);
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
						content={`Modification for ${targetType} is not yet implemented`}
						disabled={submissionValid} position="top">
						<AnchorButton
							style={{ width: "100%" }}
							disabled={!submissionValid}
							onClick={() => submitRef.current?.submit()}
							text={target !== undefined ? "Apply" : "Add"}
							icon={target !== undefined ? "tick" : "add"}></AnchorButton>
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

						<ObjectInspector data={target}></ObjectInspector>

						<Divider style={{ marginBottom: "8px" }}></Divider>
						<EntityTitle title={"Bindings"} icon="bring-data"></EntityTitle>

						<ObjectInspector
							data={target?.bindings.map((b) => b)}></ObjectInspector>

						<Divider style={{ marginBottom: "8px" }}></Divider>
						<EntityTitle title={"Binds to this"} icon="bring-forward"></EntityTitle>

						<ObjectInspector
							data={target?.bindingsToThis.map((b) => b)}></ObjectInspector>

						<Divider style={{ marginBottom: "8px" }}></Divider>
						<EntityTitle title={"All elements"} icon="zoom-in"></EntityTitle>

						<ObjectInspector data={ENGINE.handler.allElements}></ObjectInspector>
					</div>
				</DialogBody>
			</Dialog>
		</>
	);
}
