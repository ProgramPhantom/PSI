import { Button, Divider, EntityTitle, Section, Tab, Tabs } from "@blueprintjs/core";
import React, { useEffect, useImperativeHandle } from "react";
import { DefaultValues, FormProvider, useForm } from "react-hook-form";
import { ILabel } from "../../logic/hasComponents/label";
import LabelGroup, { ILabelGroup } from "../../logic/hasComponents/labelGroup";
import { AllComponentTypes, UserComponentType } from "../../logic/point";
import Visual, { IVisual } from "../../logic/visual";
import { FormRequirements } from "./FormBase";
import { FORM_DEFAULTS } from "./formDataRegistry";
import LabelListForm, { LabelGroupLabels } from "./LabelListForm";
import Collection from "../../logic/collection";
import FormDivider from "./FormDivider";
import { Position } from "../../logic/text";
import { CollectionChildrenList } from "./CollectionChildrenList";
import { useAppDispatch } from "../../redux/hooks";
import { setSelectedElementId } from "../../redux/applicationSlice";

export interface LabelGroupComboForm {
	target?: Visual;
	objectType: UserComponentType;
	callback: (val: IVisual) => void;

	ref?: React.RefObject<SubmitButtonRef>;
}

export type SubmitButtonRef = {
	submit: () => void;
};




export const LabelGroupComboForm = React.forwardRef<SubmitButtonRef, LabelGroupComboForm>(
	(props, ref) => {
		const dispatch = useAppDispatch();

		interface FormState {
			MasterForm: React.FC<FormRequirements>;
			ChildForm: React.FC<FormRequirements> | undefined;
			masterDefaults: IVisual | undefined;
			childDefaults: IVisual | undefined;
			labelDefaults: LabelGroupLabels;
			allowLabels: boolean;
			targetIsLabelGroup: boolean;
			childTarget: Visual | undefined;
			targetIsCollection: boolean;
		}

		const [formState, setFormState] = React.useState<FormState | null>(null);

		useEffect(() => {
			var MasterForm: React.FC<FormRequirements>;
			var ChildForm: React.FC<FormRequirements> | undefined;

			var masterDefaults: IVisual;
			var childDefaults: IVisual | undefined;
			var labelDefaults: LabelGroupLabels = { labels: {} };

			var allowLabels: boolean = true;
			var parentType: AllComponentTypes;
			var childType: UserComponentType | undefined = undefined;
			var childTarget: Visual | undefined;



			var targetIsLabelGroup: boolean = false;
			var targetIsCollection: boolean = false;

			if (props.target !== undefined) {
				parentType = (props.target.constructor as typeof Visual).ElementType;

				MasterForm = FORM_DEFAULTS[props.objectType]!.form;
				masterDefaults = structuredClone(props.target.state);
				allowLabels = FORM_DEFAULTS[props.objectType]!.allowLabels;

				if (LabelGroup.isLabelGroup(props.target)) {
					childType = (props.target.coreChild.constructor as typeof Visual)
						.ElementType;

					ChildForm = FORM_DEFAULTS[(props.target.coreChild.constructor as typeof Visual).ElementType]!.form;
					childDefaults = structuredClone(props.target.coreChild.state);
					childTarget = props.target.coreChild;

					labelDefaults.labels = structuredClone(props.target.labelsState);

					targetIsLabelGroup = true;
				}

				if (Collection.isCollection(props.target)) {
					targetIsCollection = true;
				}
			} else {
				parentType = props.objectType;
				// Use the object type to setup a clean form
				MasterForm = FORM_DEFAULTS[props.objectType]!.form;
				masterDefaults = structuredClone(FORM_DEFAULTS[props.objectType]!.defaults);
				allowLabels = FORM_DEFAULTS[props.objectType]!.allowLabels;
			}
			setFormState({
				MasterForm,
				ChildForm,
				masterDefaults,
				childDefaults,
				labelDefaults,
				allowLabels,
				targetIsLabelGroup,

				childTarget,
				targetIsCollection
			});

		}, [props.target, props.objectType]);


		// Create form hook
		const masterFormControls = useForm<IVisual>({
			values: formState?.masterDefaults,
			mode: "onChange"
		});

		// Create form hook
		const childFormControls = useForm<IVisual>({
			values: formState?.childDefaults,
			mode: "onChange"
		});

		// Create label hook form
		const labelListControls = useForm<LabelGroupLabels>({
			values: formState?.labelDefaults,
			mode: "onChange"
		});


		// Jiggery pokery.
		useImperativeHandle(ref, () => ({
			submit: onSubmit
		}));

		// Submit function
		const onSubmit = masterFormControls.handleSubmit((data) => {
			if (!formState) return;

			var masterFormData: IVisual = structuredClone(masterFormControls.getValues());
			var childFormData: IVisual | undefined = structuredClone(childFormControls.getValues());
			let vals = labelListControls.getValues();
			var labelListFormData: Partial<Record<Position, ILabel>> = structuredClone(vals.labels);

			if (formState.targetIsLabelGroup === false) {
				if (Object.keys(labelListFormData ?? {}).length > 0) {
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
						sizeMode: { x: "fit", y: "fit" },
						type: "label-group"
					};

					props.callback(result);
				} else {
					props.callback(masterFormData);
				}
			} else {

				// Already label type
				// childType = (masterFormData as ILabelGroup).coreChildType;
				if (Object.keys(labelListFormData ?? {}).length > 0) {
					// Still a label group
					var result: ILabelGroup = {
						...masterFormData,
						coreChild: childFormData!,
						coreChildType: (masterFormData as ILabelGroup).coreChildType,
						labels: labelListFormData, // Override labels
						children: [],
						sizeMode: { x: "fit", y: "fit" }
					};
					props.callback(result);
				} else {
					// Change BACK into a non-label group
					// Copy placement mode from label group into core child
					childFormData!.placementMode = props.target!.placementMode;
					props.callback(childFormData!);
				}
			}
		});

		if (!formState) {
			return <div></div>;
		}

		const { MasterForm, ChildForm, allowLabels, targetIsLabelGroup, childTarget, targetIsCollection } = formState;

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
						<div style={{ margin: "4px" }}>
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
													<FormDivider title="Primary Child"></FormDivider>
													<Section icon="cube-edit"
														style={{ borderRadius: 0 }}
														collapseProps={{ defaultIsOpen: false }}
														compact={true}
														title={"Child"}
														collapsible={true}>
														<div style={{ padding: "8px" }}>
															<FormProvider {...childFormControls}>
																<ChildForm
																	target={childTarget}
																	prefix={"coreChild"}></ChildForm>
															</FormProvider>
														</div>
													</Section>
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

								{targetIsCollection ? (
									<Tab
										style={{ userSelect: "none" }}
										id={"children"}
										title={"Children"}
										panel={
											<CollectionChildrenList target={props.target as Collection} />
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
