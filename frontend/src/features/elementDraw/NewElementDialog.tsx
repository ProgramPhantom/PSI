import { Button, Dialog, DialogBody, DialogFooter, Tab, Tabs } from "@blueprintjs/core";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ENGINE from "../../logic/engine";
import { ILabel } from "../../logic/hasComponents/label";
import { ILabelGroup } from "../../logic/hasComponents/labelGroup";
import { UserComponentType } from "../../logic/point";
import { IRectElement } from "../../logic/rectElement";
import { ISVGElement } from "../../logic/svgElement";
import { IVisual } from "../../logic/visual";
import { LabelGroupComboForm, SubmitButtonRef } from "../form/ElementForm";
import { useDispatch } from "react-redux";
import { addComponent } from "../../redux/slices/schemesSlice";


interface INewElementDialog {
	isOpen: boolean;
	close: () => void;
	schemeId: string;
}

export default function NewElementDialog(props: INewElementDialog) {
	const [tabId, setTabId] = useState<UserComponentType>("svg");
	const submitRef = useRef<SubmitButtonRef>(null);
	const dispatch = useDispatch()

	const addNewTemplate = (values: IVisual) => {
		dispatch(addComponent({ schemeId: props.schemeId, component: values }))
		props.close();
	}

	return (
		<>
			{/* New Element Dialog */}
			<Dialog
				style={{ width: "600px", height: "60vh" }}
				isOpen={props.isOpen}
				onClose={props.close}
				title="Add New Template Element"
				canOutsideClickClose={true}
				canEscapeKeyClose={true}>
				<DialogBody>
					<Tabs vertical={true}
						id="newElementTabs"
						defaultSelectedTabId="rect"
						selectedTabId={tabId}
						renderActiveTabPanelOnly={true}
						onChange={(id) => setTabId(id as UserComponentType)}>
						<Tab
							id="rect"
							title="Rect"
							panel={
								<LabelGroupComboForm
									ref={submitRef}
									objectType="rect"
									callback={addNewTemplate}></LabelGroupComboForm>
							}
						/>
						<Tab
							id="svg"
							title="SVG"
							panel={
								<LabelGroupComboForm
									ref={submitRef}
									objectType="svg"
									callback={addNewTemplate}></LabelGroupComboForm>
							}
						/>
						<Tab
							id="label"
							title="Label"
							panel={
								<LabelGroupComboForm
									ref={submitRef}
									objectType="label"
									callback={addNewTemplate}></LabelGroupComboForm>
							}
						/>
					</Tabs>
				</DialogBody>

				<DialogFooter
					actions={
						<>
							<Button text="Cancel" onClick={() => props.close()} variant="minimal" />
							<Button
								onClick={() => {
									submitRef.current?.submit();
								}}
								text="Submit"
								intent="primary"
							/>
						</>
					}></DialogFooter>
			</Dialog>
		</>
	);
}
