import { AnchorButton, Button, Dialog, DialogBody, Divider, EntityTitle, H5, Icon, Tooltip } from "@blueprintjs/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { ObjectInspector } from "react-inspector";
import ENGINE from "../../logic/engine";
import Visual, { IVisual } from "../../logic/visual";
import { LabelGroupComboForm, SubmitButtonRef } from "./LabelGroupComboForm";
import { AllComponentTypes, UserComponentType } from "../../logic/point";
import { Result } from "../../logic/diagramHandler";
import { appToaster } from "../../app/Toaster";
import LabelGroup from "../../logic/hasComponents/labelGroup";
import { FormHolderProps } from "./FormBase";


type SubmissionFunction = (data: any, type: UserComponentType) => Result<any>;
type DeleteFunction = (val: Visual, type: UserComponentType) => Result<any>;
type ModifyFunction = (data: any, type: UserComponentType, target: Visual) => Result<any>;

type FormEffect = "submit" | "delete" | "modify";
type FormEffectFunction = SubmissionFunction | DeleteFunction | ModifyFunction;
type EffectGroup = {
	submit: SubmissionFunction;
	modify?: ModifyFunction;
	delete: DeleteFunction;
};

function getCoreDefaults(target: Visual): IVisual {
	if (LabelGroup.isLabelGroup(target)) {
		return target.coreChild.state;
	} else {
		return target.state;
	}
}

export function FormDiagramInterface(props: FormHolderProps) {
	const ComponentFormEffectRegistry = useMemo<
		Partial<Record<UserComponentType, Partial<EffectGroup>>>
	>(() => {
		return {
			svg: {
				submit: ENGINE.handler.submitVisual.bind(ENGINE.handler),
				modify: ENGINE.handler.submitModifyVisual.bind(ENGINE.handler),
				delete: ENGINE.handler.submitDeleteVisual.bind(ENGINE.handler)
			},
			rect: {
				submit: ENGINE.handler.submitVisual.bind(ENGINE.handler),
				modify: ENGINE.handler.submitModifyVisual.bind(ENGINE.handler),
				delete: ENGINE.handler.submitDeleteVisual.bind(ENGINE.handler)
			},
			"label-group": {
				submit: ENGINE.handler.submitVisual.bind(ENGINE.handler),
				modify: ENGINE.handler.submitModifyVisual.bind(ENGINE.handler),
				delete: ENGINE.handler.submitDeleteVisual.bind(ENGINE.handler)
			},
			channel: {
				submit: ENGINE.handler.submitVisual.bind(ENGINE.handler),
				delete: ENGINE.handler.submitDeleteVisual.bind(ENGINE.handler)
			},
			label: {
				submit: ENGINE.handler.submitVisual.bind(ENGINE.handler),
				modify: ENGINE.handler.submitModifyVisual.bind(ENGINE.handler),
				delete: ENGINE.handler.submitDeleteVisual.bind(ENGINE.handler)
			}
		};
	}, [ENGINE.handler]);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const submitRef = useRef<SubmitButtonRef>(null);
	var [submissionValid, setSubmissionValid] = useState<boolean>(true);

	useEffect(() => {
		if (props.target !== undefined) {
			if (ComponentFormEffectRegistry[props.targetType as UserComponentType]?.modify === undefined) {
				setSubmissionValid(false)
			} else {
				setSubmissionValid(true)
			}
		} else {
			setSubmissionValid(true)
		}
	}, [props.target])

	// Submit function
	const dispatchFormEffect = (
		values: IVisual,
		masterType: UserComponentType,
		effect: FormEffect
	) => {
		var targetFunction: FormEffectFunction | undefined =
			ComponentFormEffectRegistry[masterType]?.[effect];

		if (targetFunction === undefined) {
			throw new Error(`Not implemented`);
		}

		var result: Result<any>;
		switch (effect) {
			case "submit":
				result = (targetFunction as SubmissionFunction)(values, masterType);
				break;
			case "modify":
				if (props.target === undefined) {
					throw new Error(`Calling modification function with no selected target`)
				}
				result = (targetFunction)(values, masterType, props.target);
				break;
			case "delete":
				if (props.target === undefined) {
					throw new Error(`Calling deletion function with no selected target`)
				}
				result = (targetFunction as DeleteFunction)(props.target, masterType);
				break;
			default:
				result = { ok: false, error: `No '${effect}' method assigned to object type '${masterType}'` }
		}

		if (!result.ok) {
			appToaster.show({
				message: result.error,
				intent: "danger"
			});
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
										props.targetType as UserComponentType,
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
					ref={submitRef}
					objectType={props.targetType as UserComponentType}
					target={props.target}
					callback={(val: IVisual, masterType: UserComponentType) => {
						props.target
							? dispatchFormEffect(val, masterType, "modify")
							: dispatchFormEffect(val, masterType, "submit");
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
