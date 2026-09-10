import { Button, Dialog, DialogBody, Divider, EntityTitle, H5, Icon } from "@blueprintjs/core";
import { useState, useSyncExternalStore, useDeferredValue, useCallback } from "react";
import { ObjectInspector } from "react-inspector";
import ENGINE from "../../logic/engine";
import { setSelectedElementId } from "../../redux/slices/applicationSlice";
import { deleteSelectedElements } from "../../redux/thunks/actionThunks";
import { useAppDispatch } from "../../redux/hooks";
import { useSelectedElementId } from "../../hooks/useSelectedElements";
import { AllComponentTypes } from "../../logic/point";
import Visual, { IVisual } from "../../logic/visual";
import { ElementForm } from "./ElementForm";
import DiagramForm from "./DiagramForm";

type FormEffect = "submit" | "modify";

export function FormDiagramInterface() {
	const dispatch = useAppDispatch();
	const selectedElementId = useSelectedElementId();
	const deferredSelectedElementId = useDeferredValue(selectedElementId);
	useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
	const target = ENGINE.handler.identifyElement(deferredSelectedElementId ?? "");

	const changeTarget = useCallback((val: Visual | undefined) => {
		dispatch(setSelectedElementId(val?.id));
	}, [dispatch]);

	const targetType: AllComponentTypes = target
		? (target.constructor as typeof Visual).ElementType
		: "channel";
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Submit function
	const dispatchFormEffect = useCallback((
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
		}
	}, [target]);

	const handleFormSubmit = useCallback((val: IVisual) => {
		if (target) {
			const targetId = target.id;
			dispatchFormEffect(val, "modify");
			const newTarget = ENGINE.handler.identifyElement(targetId);
			changeTarget(newTarget);
		} else {
			const newId = val.id || Math.random().toString(16).slice(2);
			val.id = newId;
			dispatchFormEffect(val, "submit");
			const newTarget = ENGINE.handler.identifyElement(newId);
			changeTarget(newTarget);
		}
	}, [target, dispatchFormEffect, changeTarget]);

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
			<div style={{ display: "flex", flexDirection: "row", width: "100%", flexShrink: 0 }}>
				<div style={{ width: "100%" }}>
					<div
						style={{
							minHeight: "40px",
							width: "100%",
							padding: "6px 8px 8px 8px",
							display: "flex",
							flexDirection: "row",
							alignItems: "center"
						}}>
						{target === undefined ? (
							<>
								<EntityTitle
									title={"Pulse Sequence"}
									icon={
										<Icon
											icon="pulse"
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
									title={`Modify`}
									icon={
										<Icon
											icon="edit"
											onClick={() => {
												setIsDialogOpen(true);
											}}
											style={{ cursor: "help" }}></Icon>
									}
									heading={H5}></EntityTitle>
							</>
						)}

						{target !== undefined ? (
							<>

								<Button
									style={{
										height: "100%",
										alignSelf: "center",
										marginLeft: "auto"
									}} size="small"
									icon="trash"
									intent="danger"
									onClick={() => {
										dispatch(deleteSelectedElements());
									}}></Button>
							</>
						) : (
							<></>
						)}
					</div>

					<Divider style={{ margin: "0" }}></Divider>
				</div>
			</div>

			<div
				style={{
					flex: "1 1 0",
					minHeight: 0,
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					padding: "0px"
				}}>
				{target === undefined ? (
					<DiagramForm />
				) : (
					<ElementForm
						key={targetType}
						objectType={targetType}
						target={target}
						callback={handleFormSubmit}></ElementForm>
				)}
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
		</div>
	);
}
