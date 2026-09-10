import { Tab, Tabs } from "@blueprintjs/core";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Collection from "../../logic/collection";
import { AllComponentTypes } from "../../logic/point";
import Visual, { IVisual } from "../../logic/visual";
import { CollectionChildrenList } from "./CollectionChildrenList";
import {
	formDataAssembler,
	resolveFormDataFromTarget
} from "./formHelpers";
import LabelListForm from "./LabelListForm";
import RoleButtonStrip from "./RoleButtonStrip";
import RoleSubformDialog from "./RoleSubformDialog";
import { RoleChildrenFormData } from "./RoleChildrenForm";
import styles from "./styles/ElementForm.module.scss"


export interface ElementFormProps {
	target?: Visual;
	objectType: AllComponentTypes;
	callback: (val: IVisual) => void;
	autoSubmitDelay?: number;

	ref?: React.RefObject<SubmitButtonRef>;
}

export type SubmitButtonRef = {
	submit: () => void;
};


export const ElementForm = React.memo(React.forwardRef<SubmitButtonRef, ElementFormProps>(
	(props, ref) => {
		const resolved = useMemo(() => {
			try {
				return resolveFormDataFromTarget(props.target, props.objectType);
			} catch (e) {
				console.error("Failed to resolve form targets:", e);
				return null;
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

		const timerRef = useRef<NodeJS.Timeout | null>(null);
		const lastSubmittedJsonRef = useRef<string>(props.target ? JSON.stringify(props.target.state) : "");

		// Update baseline when target changes or on external target update
		useEffect(() => {
			if (props.target) {
				lastSubmittedJsonRef.current = JSON.stringify(props.target.state);
			}
			return () => {
				if (timerRef.current) clearTimeout(timerRef.current);
			};
		}, [props.target]);

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

			// Prevent duplicate submissions and re-synchronization loops
			const newJson = JSON.stringify(result);
			if (newJson !== lastSubmittedJsonRef.current) {
				lastSubmittedJsonRef.current = newJson;
				props.callback(result);
			}
		});

		const flushSubmit = useCallback(() => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
			onSubmit();
		}, [onSubmit]);

		useImperativeHandle(ref, () => ({
			submit: flushSubmit
		}));

		// Debounced auto-submit on form modifications (only for existing diagram elements)
		useEffect(() => {
			if (!props.target) return;

			const delay = props.autoSubmitDelay ?? 100;
			const onFormChange = (_: unknown, info: { name?: string }) => {
				if (info.name !== undefined) {
					if (timerRef.current) clearTimeout(timerRef.current);
					timerRef.current = setTimeout(() => {
						timerRef.current = null;
						onSubmit();
					}, delay);
				}
			};

			const sub1 = masterFormControls.watch(onFormChange);
			const sub2 = roleFormControls.watch(onFormChange);
			const sub3 = childFormControls.watch(onFormChange);

			return () => {
				sub1.unsubscribe();
				sub2.unsubscribe();
				sub3.unsubscribe();
			};
		}, [props.target, props.autoSubmitDelay, onSubmit, masterFormControls, roleFormControls, childFormControls]);

		if (!resolved) {
			return <div></div>;
		}

		const {
			primary: { Form: MasterForm },
			allowLabels,
			isLabelGroup,
			isCollection,
			labelRoles,
			componentRoles
		} = resolved;

		const hasLabelRoles = labelRoles.length > 0;
		const showLabelsTab = allowLabels || isLabelGroup || hasLabelRoles;
		const hasComponentRoles = componentRoles.length > 0;

		return (
			<>
				<form
					onSubmit={onSubmit}
					onBlurCapture={flushSubmit}
					style={{
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
						padding: "0",
						flex: "1 1 0",
						minHeight: 0
					}}>
					{/* Genius AI solution */}
					<button type="submit" style={{ display: "none" }} />

					{hasComponentRoles && (
						<RoleButtonStrip roles={componentRoles} />
					)}

					<div
						style={{ flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column" }}
						className="custom-scrollbar"
						id="form-fields">
						<div style={{ margin: "0px", flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column" }}>
							<Tabs className={styles.elementFormTabs}
								defaultSelectedTabId={"properties"}
								renderActiveTabPanelOnly={true}
								animate={false}>
								<Tab
									style={{ userSelect: "none", overflowX: "visible", }}
									id={"properties"}
									title={"Properties"}
									panel={
										<FormProvider {...masterFormControls}>
											<MasterForm target={props.target}></MasterForm>
										</FormProvider>
									}></Tab>

								{showLabelsTab ? (
									<Tab
										style={{ userSelect: "none" }}
										id={"labels"}
										title={"Annotation"}
										panel={
											<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
												<FormProvider {...roleFormControls}>
													<LabelListForm target={props.target}></LabelListForm>
												</FormProvider>
											</div>
										}></Tab>
								) : (
									<></>
								)}

								{isCollection && props.objectType !== "collection" ? (
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

					<FormProvider {...roleFormControls}>
						<RoleSubformDialog target={props.target} />
					</FormProvider>
				</form>
			</>
		);
	}
));


