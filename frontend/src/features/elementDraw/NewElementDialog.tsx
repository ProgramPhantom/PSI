import { Button, Dialog, DialogBody, DialogFooter, Tab, Tabs } from "@blueprintjs/core";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { UserComponentType } from "../../logic/point";
import { IVisual } from "../../logic/visual";
import { addComponent } from "../../redux/slices/schemesSlice";
import { ElementForm, SubmitButtonRef } from "../form/ElementForm";
import styles from "./styles/NewElementDialog.module.scss";


interface INewElementDialog {
	isOpen: boolean;
	close: () => void;
	schemeId: string;
}

export default function NewElementDialog(props: INewElementDialog) {
	const [tabId, setTabId] = useState<UserComponentType>("rect");
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
				style={{ width: "800px", height: "75vh" }}
				isOpen={props.isOpen}
				onClose={props.close}
				title="Add New Template Element"
				canOutsideClickClose={true}
				canEscapeKeyClose={true}>
				<DialogBody className={styles.dialogBody}>
					<Tabs vertical={true}
						id="newElementTabs"
						className={styles.dialogTabs}
						defaultSelectedTabId="rect"
						selectedTabId={tabId}
						renderActiveTabPanelOnly={true}
						fill={true}
						onChange={(id) => setTabId(id as UserComponentType)}>
						<Tab
							id="rect"
							title="Rect"
							panelClassName={styles.dialogTabPanel}
							panel={
								<ElementForm
									ref={submitRef}
									objectType="rect"
									callback={addNewTemplate}></ElementForm>
							}
						/>
						<Tab
							id="svg"
							title="SVG"
							panelClassName={styles.dialogTabPanel}
							panel={
								<ElementForm
									ref={submitRef}
									objectType="svg"
									callback={addNewTemplate}></ElementForm>
							}
						/>
						{/* <Tab
							id="label"
							title="Label"
							panelClassName={styles.dialogTabPanel}
							panel={
								<ElementForm
									ref={submitRef}
									objectType="label"
									callback={addNewTemplate}></ElementForm>
							}
						/> */}
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
