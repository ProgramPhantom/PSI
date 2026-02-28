import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	Divider,
	EntityTitle,
	H5,
	Icon,
	Section,
	SectionCard,
	Tab,
	Tabs,
	Text,
	Tooltip
} from "@blueprintjs/core";
import React, { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ObjectInspector } from "react-inspector";
import ENGINE from "../../logic/engine";
import Visual from "../../logic/visual";
import TemplateDraggableElement from "../dnd/TemplateDraggableElement";
import AddSchemeDialog from "./AddSchemeDialog";
import NewElementDialog from "./NewElementDialog";
import { appToaster } from "../../app/Toaster";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useGetMeQuery } from "../../redux/api/api";
import { deleteScheme, selectSchemes, setSchemeLocation, InternalSchemeId } from "../../redux/schemesSlice";
import { ID, AllComponentTypes } from "../../logic/point";

import { isPulse } from "../../logic/spacial";
import QuietUploadArea from "../QuietUploadArea";

interface IElementDrawProps { }

const ElementsDraw: React.FC<IElementDrawProps> = () => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedElement, setSelectedElement] = useState<Visual | null>(null);
	const [isNewElementDialogOpen, setIsNewElementDialogOpen] = useState(false);

	const [selectedSchemeName, setSelectedSchemeName] = useState(InternalSchemeId)
	const [selectedSchemeId, setSelectedSchemeId] = useState(InternalSchemeId);

	const [isNewSchemeDialogOpen, setIsNewSchemeDialogOpen] = useState(false);
	const [isDeleteSchemeDialogOpen, setIsDeleteSchemeDialogOpen] = useState(false);

	const schemes = useAppSelector(selectSchemes);
	const schemeLocations = useAppSelector((state) =>
		Object.fromEntries(
			Object.entries(state.schemes.schemes || {}).map(([id, v]) => [id, v.location])
		)
	);
	const { data: me } = useGetMeQuery();
	const isLoggedIn = Boolean(me);
	const dispatch = useAppDispatch();

	useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	const singletonsCache = useRef<Record<string, Record<ID, Visual>>>({});

	const singletons = useMemo(() => {
		const newSingletons: Record<string, Record<string, Visual>> = {};

		Object.entries(schemes).forEach(([schemeId, scheme]) => {
			if (!singletonsCache.current[schemeId]) {
				singletonsCache.current[schemeId] = {};
			}

			const currentCache = singletonsCache.current[schemeId];
			const nextCache: Record<ID, Visual> = {};

			const elements = Object.entries(scheme.components).map(([template_id, compData]) => {
				const existing = currentCache[template_id];

				// Only rebuild the diff: reuse if state is unchanged
				if (existing) {
					nextCache[template_id] = existing;
					return existing;
				} else {
					const created = ENGINE.ConstructElement(structuredClone(compData), compData.type as AllComponentTypes);
					if (created) {
						nextCache[template_id] = created;
					}
					return created;
				}
			}).filter(v => v !== undefined) as Visual[];

			singletonsCache.current[schemeId] = nextCache;
			newSingletons[schemeId] = nextCache;
		});

		return newSingletons;
	}, [schemes]);

	const [filter, setFilter] = useState<string>("All");

	const filterElement = (element: Visual, filter: string) => {
		if (filter === "All") return true;
		if (filter === "Channels") return element.type === "channel";
		if (filter === "Sequences") return element.type === "sequence";
		if (filter === "Pulses") return isPulse(element);
		if (filter === "Annotation") return element.type === "label" || element.type === "text";
		return true;
	};

	const handleElementDoubleClick = (element: Visual) => {
		setSelectedElement(element);
		setIsDialogOpen(true);
	};

	const handleDialogClose = () => {
		setIsDialogOpen(false);
		setSelectedElement(null);
	};

	const handleSubmit = () => {
		handleDialogClose();
	};

	const handleNewElementDialogClose = () => {
		setIsNewElementDialogOpen(false);
	};

	const handleNewSchemeDialogClose = () => {
		setIsNewSchemeDialogOpen(false);
	};

	const handleDeleteSchemeClick = () => {
		if (selectedSchemeId === InternalSchemeId) {
			appToaster.show({
				message: "Cannot delete the internal scheme",
				intent: "danger"
			});
		} else {
			setIsDeleteSchemeDialogOpen(true);
		}
	};

	const handleDeleteSchemeDialogClose = () => {
		setIsDeleteSchemeDialogOpen(false);
	};

	const handleDeleteSchemeConfirm = () => {
		dispatch(deleteScheme(selectedSchemeId));
		setSelectedSchemeId(InternalSchemeId);
		setIsDeleteSchemeDialogOpen(false);
	};

	const handleSchemeDrop = async (file: File) => {
		try {
			await ENGINE.uploadSchemeFile(file);
			appToaster.show({
				message: `Scheme created successfully from dropped file`,
				intent: "success"
			});
		} catch (error) {
			console.error(error);
			appToaster.show({
				message: "Failed to create scheme from dropped file.",
				intent: "danger"
			});
		}
	};

	return (
		<QuietUploadArea onDrop={handleSchemeDrop} acceptExtension=".nmrs">
			<div style={{ height: "100%", overflow: "hidden" }}>
				<Section
					style={{
						padding: "0px",
						overflow: "visible",
						boxShadow: "none",
						height: "100%"
					}}>
					<SectionCard
						style={{
							padding: "0px",
							height: "100%",
							overflow: "hidden",
							display: "flex",
							flexDirection: "column"
						}}>
						<div
							style={{
								position: "sticky",
								top: "0px",
								backgroundColor: "white",
								zIndex: 10,
								padding: "8px 16px 4px 16px",
								userSelect: "none"
							}}>
							<EntityTitle
								title={"Elements"}
								subtitle={"Drag and drop these elements onto the canvas"}
								icon="new-object"
								heading={H5}></EntityTitle>
						</div>

						<Divider style={{ margin: "4px 8px 0 8px" }} />

						<div
							style={{
								padding: "8px 16px",
								width: "100%",
								flex: "1 1 0",
								minHeight: 0,
								display: "flex",
								flexDirection: "column"
							}}>
							<style>{`.bp5-tabs { height: 100% }`}</style>

							<Tabs
								onChange={(id) => setSelectedSchemeId(id as string)}
								vertical={true}
								defaultSelectedTabId={"default"}
								fill={true}
								selectedTabId={selectedSchemeId}>
								<style>{`.bp5-tab-panel { width: 100%; height: 100% !important; max-width: 100% !important; box-sizing: border-box; display: block; }`}</style>

								{Object.entries(schemes).map(([schemeId, scheme]) => {
									var schemeSingletons: Record<string, Visual> | undefined = singletons[schemeId];
									if (schemeSingletons === undefined) {
										return <React.Fragment key={schemeId}></React.Fragment>;
									}

									let schemeName = schemes[schemeId].metadata.name
									var numElements: number = Object.values(schemeSingletons).length;
									return (
										<Tab key={schemeId}
											title={
												<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
													{schemeName}
													{schemeLocations[schemeId] === "server" && (
														<Tooltip hoverOpenDelay={500} content="Uploaded">
															<Icon icon="cloud" intent="primary" size={14} />
														</Tooltip>
													)}
													{schemeLocations[schemeId] === "local" && isLoggedIn && (
														<Tooltip hoverOpenDelay={500} content="Upload">
															<Button
																icon="upload"
																variant="minimal"
																onClick={(e) => {
																	e.stopPropagation();
																	dispatch(setSchemeLocation({ id: schemeId, location: "server" }));
																}}
															/>
														</Tooltip>
													)}
												</span>
											}
											style={{ width: "100%", overflow: "auto" }}
											tagProps={{ round: true }}
											tagContent={numElements}
											id={schemeId}
											panel={
												<div
													style={{
														width: "100%",
														display: "flex",
														flexDirection: "row",
														height: "100%"
													}}>
													<Divider style={{}}></Divider>
													<div
														style={{
															width: "100%",
															height: "100%",
															overflow: "hidden",
															display: "flex",
															flexDirection: "column"
														}}>
														{/* Filter Tabs */}
														<div style={{ padding: "8px 16px 8px 4px", flexShrink: 0 }}>
															<Tabs
																id="filter-tabs"
																onChange={(newFilter) =>
																	setFilter(newFilter as string)
																}
																selectedTabId={filter}
																renderActiveTabPanelOnly={false}>
																<Tab id="All" title="All" />
																<Tab id="Sequences" title="Sequences" />
																<Tab id="Channels" title="Channels" />
																<Tab id="Pulses" title="Pulses" />
																<Tab id="Annotation" title="Annotation" />
															</Tabs>
														</div>

														<div
															style={{
																width: "100%",
																display: "grid",
																overflow: "auto",
																gridTemplateColumns:
																	"repeat(auto-fill, minmax(120px, 1fr))",
																gridAutoRows: "120px",
																gap: "12px",
																padding: "4px 16px 16px 4px"
															}}>
															{/* Plus button for adding new elements */}
															{schemeName !== InternalSchemeId ? (
																<div
																	style={{
																		width: "120px",
																		height: "120px",
																		padding: "12px 8px",
																		border: "1px solid #d3d8de",
																		borderRadius: "4px",
																		backgroundColor: "white",
																		display: "flex",
																		flexDirection: "column",
																		alignItems: "center",
																		justifyContent: "center",
																		cursor: "pointer",
																		boxShadow:
																			"0 1px 3px rgba(0, 0, 0, 0.1)",
																		transition: "all 0.2s ease",
																		userSelect: "none"
																	}}
																	onMouseEnter={(e) => {
																		e.currentTarget.style.boxShadow =
																			"0 2px 6px rgba(0, 0, 0, 0.15)";
																		e.currentTarget.style.transform =
																			"translateY(-1px)";
																	}}
																	onMouseLeave={(e) => {
																		e.currentTarget.style.boxShadow =
																			"0 1px 3px rgba(0, 0, 0, 0.1)";
																		e.currentTarget.style.transform =
																			"translateY(0)";
																	}}
																	onClick={() =>
																		setIsNewElementDialogOpen(true)
																	}
																	title="Add new template element">
																	<div
																		style={{
																			fontSize: "32px",
																			color: "#5c7080",
																			marginBottom: "8px"
																		}}>
																		+
																	</div>
																	<span
																		style={{
																			fontSize: "12px",
																			color: "#5c7080",
																			fontWeight: "600",
																			textAlign: "center",
																			lineHeight: "1.4"
																		}}>
																		Add New
																	</span>
																</div>
															) : (
																<></>
															)}

															{Object.entries(schemeSingletons).filter(([id, com]) => filterElement(com, filter)).map(
																([template_id, visual]) => {
																	return (
																		<TemplateDraggableElement
																			key={template_id}
																			element={visual}
																			onDoubleClick={
																				handleElementDoubleClick
																			}
																			schemeId={schemeId}
																			templateId={template_id}
																		/>
																	);
																}
															)}
														</div>
													</div>
												</div>
											}></Tab>
									);
								})}
							</Tabs>

							{/* Add New Scheme Button */}
							<div
								style={{
									position: "absolute",
									bottom: "16px",
									left: "20px",
									zIndex: 10,
									width: "60px"
								}}>
								<Button
									icon="plus"
									variant="outlined"
									intent="primary"
									onClick={() => setIsNewSchemeDialogOpen(true)}
									style={{
										boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
									}}
								/>
							</div>

							{/* Delete Scheme button */}
							<div
								style={{
									position: "absolute",
									bottom: "16px",
									left: "60px",
									zIndex: 10,
									width: "60px"
								}}>
								<Button
									icon="trash"
									variant="outlined"
									intent="danger"
									onClick={handleDeleteSchemeClick}
									disabled={selectedSchemeId === InternalSchemeId}
									style={{
										boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
									}}
								/>
							</div>

							{/* Download Scheme button */}
							<div
								style={{
									position: "absolute",
									bottom: "16px",
									left: "100px",
									zIndex: 10,
									width: "60px"
								}}>
								<Button
									icon="download"
									variant="outlined"
									intent="success"
									onClick={() => ENGINE.saveSchemeFile(selectedSchemeId)}
									style={{
										boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
									}}
								/>
							</div>
						</div>
					</SectionCard>
				</Section>

				{/* Edit template dialog */}
				<Dialog
					isOpen={isDialogOpen}
					onClose={handleDialogClose}
					title="Edit element"
					canOutsideClickClose={true}
					canEscapeKeyClose={true}>
					<DialogBody>
						<Text>Editing element: {selectedElement?.ref} (WIP)</Text>

						<ObjectInspector data={selectedElement}></ObjectInspector>
					</DialogBody>

					<DialogFooter
						actions={
							<>
								<Button text="Cancel" onClick={handleDialogClose} variant="minimal" />
								<Button text="Submit" intent="primary" onClick={handleSubmit} />
							</>
						}></DialogFooter>
				</Dialog>

				<NewElementDialog
					isOpen={isNewElementDialogOpen}
					close={handleNewElementDialogClose}
					schemeId={selectedSchemeId}></NewElementDialog>
				<AddSchemeDialog
					isOpen={isNewSchemeDialogOpen}
					onClose={handleNewSchemeDialogClose}
				/>

				{/* Delete Scheme Confirmation Dialog */}
				<Dialog
					icon="warning-sign"
					isOpen={isDeleteSchemeDialogOpen}
					onClose={handleDeleteSchemeDialogClose}
					title="Delete Scheme"
					canOutsideClickClose={true}
					canEscapeKeyClose={true}>
					<DialogBody>
						<Text>
							Are you sure you want to delete the scheme "{selectedSchemeId}"? This action
							cannot be undone.
						</Text>
					</DialogBody>

					<DialogFooter
						actions={
							<>
								<Button
									text="Cancel"
									onClick={handleDeleteSchemeDialogClose}
									variant="minimal"
								/>
								<Button
									text="Delete"
									intent="danger"
									onClick={handleDeleteSchemeConfirm}
								/>
							</>
						}></DialogFooter>
				</Dialog>
			</div>
		</QuietUploadArea >
	);
};

export default ElementsDraw;
