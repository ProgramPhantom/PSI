import { Section, Tab, Tabs } from "@blueprintjs/core";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Visual, { IVisual } from "../../logic/visual";
import { UserComponentType } from "../../logic/point";
import { FormRequirements } from "./FormBase";
import Collection from "../../logic/collection";
import FormDivider from "./FormDivider";
import { CollectionChildrenList } from "./CollectionChildrenList";
import RoleChildrenForm, { RoleChildrenFormData } from "./RoleChildrenForm";
import {
	EditableRole,
	ResolvedFormTargets,
	formDataAssembler,
	resolveFormDataFromTarget,
} from "./formHelpers";


export interface ElementFormProps {
	target?: Visual;
	objectType: UserComponentType;
	callback: (val: IVisual) => void;

	ref?: React.RefObject<SubmitButtonRef>;
}

export type SubmitButtonRef = {
	submit: () => void;
};


export const ElementForm = React.forwardRef<SubmitButtonRef, ElementFormProps>(
	(props, ref) => {
		const [resolved, setResolved] = useState<ResolvedFormTargets | null>(null);

		useEffect(() => {
			try {
				const result = resolveFormDataFromTarget(props.target, props.objectType);
				setResolved(result);
			} catch (e) {
				console.error("Failed to resolve form targets:", e);
			}
		}, [props.target, props.objectType]);


		// Primary element form
		const masterFormControls = useForm<IVisual>({
			values: resolved?.primary.defaults,
			mode: "onChange"
		});

		// Core child form (only used when target is a LabelGroup)
		const childFormControls = useForm<IVisual>({
			values: resolved?.coreChild?.defaults,
			mode: "onChange"
		});

		// Role children form
		const roleFormControls = useForm<RoleChildrenFormData>({
			values: resolved ? { roles: resolved.roleDefaults } : { roles: {} },
			mode: "onChange"
		});


		useImperativeHandle(ref, () => ({
			submit: onSubmit
		}));

		// Submit function
		const onSubmit = masterFormControls.handleSubmit(() => {
			if (!resolved) return;

			const masterData: IVisual = structuredClone(masterFormControls.getValues());
			const childData: IVisual | undefined = resolved.coreChild
				? structuredClone(childFormControls.getValues())
				: undefined;

			// Collect role data, filtering out undefined entries
			const roleFormValues = roleFormControls.getValues();
			const roleData: Record<string, IVisual> = {};
			for (const [key, value] of Object.entries(roleFormValues.roles ?? {})) {
				if (value !== undefined && value !== null) {
					roleData[key] = structuredClone(value);
				}
			}

			const result = formDataAssembler(masterData, childData, roleData, {
				isLabelGroup: resolved.isLabelGroup,
				objectType: props.objectType,
				originalTarget: props.target,
				editableRoles: [...resolved.labelRoles, ...resolved.componentRoles],
			});

			props.callback(result);
		});

		if (!resolved) {
			return <div></div>;
		}

		const {
			primary: { Form: MasterForm },
			coreChild,
			allowLabels,
			isLabelGroup,
			isCollection,
			labelRoles,
			componentRoles
		} = resolved;

		const hasLabelRoles = labelRoles.length > 0;
		const showLabelsTab = allowLabels || isLabelGroup || hasLabelRoles;
		const showComponentsTab = componentRoles.length > 0;

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

											{coreChild ? (
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
																<coreChild.Form
																	target={coreChild.target}
																	prefix={"coreChild"}></coreChild.Form>
															</FormProvider>
														</div>
													</Section>
												</>
											) : (
												<></>
											)}
										</>
									}></Tab>

								{showLabelsTab ? (
									<Tab
										style={{ userSelect: "none" }}
										id={"labels"}
										title={"Labels"}
										panel={
											<>
												<FormProvider {...roleFormControls}>
													<RoleChildrenForm
														editableRoles={labelRoles}
														target={props.target}></RoleChildrenForm>
												</FormProvider>
											</>
										}></Tab>
								) : (
									<></>
								)}

								{showComponentsTab ? (
									<Tab
										style={{ userSelect: "none" }}
										id={"components"}
										title={"Components"}
										panel={
											<>
												<FormProvider {...roleFormControls}>
													<RoleChildrenForm
														editableRoles={componentRoles}
														target={props.target}></RoleChildrenForm>
												</FormProvider>
											</>
										}></Tab>
								) : (
									<></>
								)}

								{isCollection ? (
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

// Backward compatibility alias
export const LabelGroupComboForm = ElementForm;
