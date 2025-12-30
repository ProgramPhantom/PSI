import { Divider, EntityTitle, Tab, Tabs } from "@blueprintjs/core";
import React, { useEffect, useImperativeHandle } from "react";
import { DefaultValues, FormProvider, useForm } from "react-hook-form";
import { ILabel } from "../../logic/hasComponents/label";
import LabelGroup, { ILabelGroup } from "../../logic/hasComponents/labelGroup";
import { AllComponentTypes, UserComponentType } from "../../logic/point";
import Visual, { IVisual } from "../../logic/visual";
import { FormRequirements } from "./FormBase";
import { FORM_DEFAULTS } from "./formDataRegistry";
import LabelListForm, { LabelGroupLabels } from "./LabelListForm";

interface LabelGroupComboForm {
	target?: Visual;
	objectType: UserComponentType;
	callback: (val: IVisual | undefined, masterType: UserComponentType) => void;

	ref?: React.RefObject<SubmitButtonRef>;
}

export type SubmitButtonRef = {
	submit: () => void;
};




export const LabelGroupComboForm = React.forwardRef<SubmitButtonRef, LabelGroupComboForm>(
	(props, ref) => {
		var MasterForm: React.FC<FormRequirements>;
		var ChildForm: React.FC<FormRequirements> | undefined;
		var LabelForm: React.FC<FormRequirements> = FORM_DEFAULTS["label"].form;

		var masterDefaults: IVisual;
		var childDefaults: IVisual | undefined;
		var labelDefaults: LabelGroupLabels = { labels: [] };

		var allowLabels: boolean = true;
		var parentType: AllComponentTypes;
		var childType: UserComponentType | undefined = undefined;
		var childTarget: Visual | undefined;

		var targetIsLabelGroup: boolean = false;

		if (props.target !== undefined) {
			parentType = (props.target.constructor as typeof Visual).ElementType;

			MasterForm = FORM_DEFAULTS[props.objectType].form;
			masterDefaults = props.target.state;
			allowLabels = FORM_DEFAULTS[props.objectType].allowLabels;

			if (LabelGroup.isLabelGroup(props.target)) {
				childType = (props.target.coreChild.constructor as typeof Visual)
					.ElementType;

				ChildForm = FORM_DEFAULTS[(props.target.coreChild.constructor as typeof Visual).ElementType].form;
				childDefaults = props.target.coreChild.state;
				childTarget = props.target.coreChild;

				labelDefaults.labels = props.target.labels;

				targetIsLabelGroup = true;
			}
		} else {
			parentType = props.objectType;
			// Use the object type to setup a clean form
			MasterForm = FORM_DEFAULTS[props.objectType].form;
			masterDefaults = FORM_DEFAULTS[props.objectType].defaults;
			allowLabels = FORM_DEFAULTS[props.objectType].allowLabels;
		}


		console.log(masterDefaults)
		console.log(childDefaults)
		console.log(labelDefaults)

		// Create form hook
		const masterFormControls = useForm<IVisual>({
			defaultValues: { ...masterDefaults } as DefaultValues<IVisual>,
			mode: "onChange"
		});

		// Create form hook
		const childFormControls = useForm<IVisual>({
			defaultValues: { ...childDefaults } as DefaultValues<IVisual>,
			mode: "onChange"
		});

		// Create label hook form
		const labelListControls = useForm<LabelGroupLabels>({
			defaultValues: { ...labelDefaults } as DefaultValues<LabelGroupLabels>,
			mode: "onChange"
		});



		// Make sure form changes (this is needed for unknown reasons)
		useEffect(() => {
			masterFormControls.reset(masterDefaults);
			childFormControls.reset(childDefaults);
			labelListControls.reset(labelDefaults);
		}, [props.target]);

		// Jiggery pokery.
		useImperativeHandle(ref, () => ({
			submit: onSubmit
		}));

		// Submit function
		const onSubmit = masterFormControls.handleSubmit((data) => {
			var masterFormData: IVisual = masterFormControls.getValues();
			var childFormData: IVisual | undefined = childFormControls.getValues();
			var labelListFormData: ILabel[] = labelListControls.getValues().labels;

			if (targetIsLabelGroup === false) {
				if (labelListFormData.length > 0) {
					// Convert into a label group!

					// Normalise core child:
					childFormData = { ...masterFormData };
					childFormData.padding = [0, 0, 0, 0];
					childFormData.offset = [0, 0];

					var result: ILabelGroup = {
						coreChild: childFormData,
						coreChildType: props.objectType as UserComponentType,
						labels: labelListFormData,
						children: [],
						...masterFormData,
						sizeMode: { x: "fit", y: "fit" }
					};

					props.callback(result, "label-group");
				} else {
					props.callback(masterFormData, props.objectType);
				}
			} else {

				// Already label type
				if (labelListFormData.length > 0) {
					// Still a label group
					var result: ILabelGroup = {
						...masterFormData,
						coreChild: childFormData,
						coreChildType: (masterFormData as ILabelGroup).coreChildType,
						labels: labelListFormData, // Override labels
						children: [],
						sizeMode: { x: "fit", y: "fit" }
					};
					props.callback(result, "label-group");
				} else {
					// Change BACK into a non-label group
					props.callback(childFormData, childType);
				}
			}
		});


		return (
			<>
				<form
					onSubmit={onSubmit}
					style={{
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
						padding: "0px",
						height: "100%"
					}}>
					<div
						style={{ overflowY: "auto", flex: "1 1 0" }}
						id="form-fields">
						<div style={{ padding: "4px" }}>
							<Tabs defaultSelectedTabId={"properties"}>
								<Tab
									style={{ userSelect: "none" }}
									id={"properties"}
									title={"Properties"}
									panel={
										<>
											<FormProvider {...masterFormControls}>
												<MasterForm target={props.target}></MasterForm>
											</FormProvider>

											{ChildForm ? (
												<>
													<Divider></Divider>
													<div style={{ padding: "16px 4px" }}>
														<EntityTitle
															icon="add-child"
															title={"Child object"}></EntityTitle>
													</div>
													<FormProvider {...childFormControls}>
														<ChildForm
															target={childTarget}
															prefix={"coreChild"}></ChildForm>
													</FormProvider>
												</>
											) : (
												<></>
											)}
										</>
									}></Tab>

								{allowLabels || targetIsLabelGroup ? (
									<Tab
										style={{ userSelect: "none" }}
										id={"label"}
										title={"Labels"}
										panel={
											<>
												<FormProvider {...labelListControls}>
													<LabelListForm
														target={props.target}></LabelListForm>
												</FormProvider>
											</>
										}></Tab>
								) : (
									<></>
								)}
							</Tabs>
						</div>
					</div>
				</form>
			</>
		);
	}
);
