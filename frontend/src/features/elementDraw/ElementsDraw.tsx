import {
	Alert,
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
import { appToaster } from "../../app/Toaster";
import ENGINE from "../../logic/engine";
import { AllComponentTypes, ID } from "../../logic/point";
import Visual from "../../logic/visual";
import { useGetMeQuery } from "../../redux/api/api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import styles from "./styles/ElementsDraw.module.scss";
import { InternalSchemeId, selectAssociatedAssetsBySchemeId, selectSchemeLocations, selectSchemes } from "../../redux/slices/schemesSlice";
import { selectAssets } from "../../redux/slices/assetSlice";
import AddSchemeDialog from "./AddSchemeDialog";
import NewElementDialog from "./NewElementDialog";
import { deleteScheme, downloadSchemeFile, importSchemeFile, uploadSchemeServer } from "../../redux/thunks/schemeThunks";
import { setAssetStoreDialogOpen } from "../../redux/slices/dialogSlice";
import QuietUploadArea from "../QuietUploadArea";
import SchemeTabPanel from "./SchemeTabPanel";


interface IElementDrawProps { }


const ElementsDraw: React.FC<IElementDrawProps> = () => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedElement, setSelectedElement] = useState<Visual | null>(null);
	const [isNewElementDialogOpen, setIsNewElementDialogOpen] = useState(false);

	const [selectedSchemeName, setSelectedSchemeName] = useState(InternalSchemeId)
	const [selectedSchemeId, setSelectedSchemeId] = useState(InternalSchemeId);

	const [isNewSchemeDialogOpen, setIsNewSchemeDialogOpen] = useState(false);
	const [isDeleteSchemeDialogOpen, setIsDeleteSchemeDialogOpen] = useState(false);
	const [schemeAssetsToDelete, setSchemeAssetsToDelete] = useState<string[]>([]);

	const schemes = useAppSelector(selectSchemes);
	const appAssets = useAppSelector(selectAssets);
	const schemeLocations = useAppSelector(selectSchemeLocations);
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
			const schemeData = schemes[selectedSchemeId];
			const associatedAssets = selectAssociatedAssetsBySchemeId({ schemes: { schemes } } as any, selectedSchemeId);
			if (associatedAssets && associatedAssets.length > 0) {
				const diagramReqs = ENGINE.getAssetRequirementsFromDiagram();
				const usedRefs = associatedAssets
					.map((id: string) => appAssets[id]?.reference)
					.filter((ref: string | undefined): ref is string => ref !== undefined && diagramReqs.has(ref));
				setSchemeAssetsToDelete(usedRefs);
			} else {
				setSchemeAssetsToDelete([]);
			}
			setIsDeleteSchemeDialogOpen(true);
		}
	};

	const handleDeleteSchemeDialogClose = () => {
		setIsDeleteSchemeDialogOpen(false);
		setSchemeAssetsToDelete([]);
	};

	const handleDeleteSchemeConfirm = () => {
		dispatch(deleteScheme(selectedSchemeId));
		setSelectedSchemeId(InternalSchemeId);
		setIsDeleteSchemeDialogOpen(false);
		setSchemeAssetsToDelete([]);
	};

	const handleSchemeDrop = async (file: File) => {
		try {
			await dispatch(importSchemeFile({ file })).unwrap();
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
					<SectionCard className={styles.elementDrawSection}>
						<div className={styles.elementDrawSectionHeader}>
							<EntityTitle
								title={"Elements"}
								subtitle={"Drag and drop these elements onto the canvas"}
								icon="new-object"
								heading={H5}></EntityTitle>
							<Button
								icon="database"
								variant="minimal"
								onClick={() => dispatch(setAssetStoreDialogOpen(true))}
							/>
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


							<Tabs
								className={styles.elementDrawTabs}
								onChange={(id) => setSelectedSchemeId(id as string)}
								vertical={true}
								defaultSelectedTabId={"default"}
								fill={true}
								selectedTabId={selectedSchemeId}
								renderActiveTabPanelOnly={true}>

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
																	dispatch(uploadSchemeServer(schemeId));
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
												<SchemeTabPanel
													schemeId={schemeId}
													schemeName={schemeName}
													schemeSingletons={schemeSingletons}
													setIsNewElementDialogOpen={setIsNewElementDialogOpen}
													handleElementDoubleClick={handleElementDoubleClick}
												/>
											}></Tab>
									);
								})}
							</Tabs>

							{/* Add New Scheme Button */}
							<div className={styles.bottomActionAdd}>
								<Button
									icon="plus"
									variant="outlined"
									intent="primary"
									onClick={() => setIsNewSchemeDialogOpen(true)}
									style={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
								/>
							</div>

							{/* Delete Scheme button */}
							<div className={styles.bottomActionDelete}>
								<Button
									icon="trash"
									variant="outlined"
									intent="danger"
									onClick={handleDeleteSchemeClick}
									disabled={selectedSchemeId === InternalSchemeId}
									style={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
								/>
							</div>

							{/* Download Scheme button */}
							<div className={styles.bottomActionDownload}>
								<Button
									icon="download"
									variant="outlined"
									intent="success"
									onClick={() => dispatch(downloadSchemeFile(selectedSchemeId))}
									style={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
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
				<Alert
					cancelButtonText="Cancel"
					confirmButtonText="Delete Scheme"
					icon="trash"
					intent="danger"
					isOpen={isDeleteSchemeDialogOpen}
					onCancel={handleDeleteSchemeDialogClose}
					onConfirm={handleDeleteSchemeConfirm}
				>
					<p>
						Are you sure you want to delete the scheme "{schemes[selectedSchemeId]?.metadata?.name || selectedSchemeId}"? This action
						cannot be undone.
					</p>
					{schemeAssetsToDelete.length > 0 && (
						<div style={{ marginTop: 12 }}>
							<Text style={{ fontWeight: "bold" }}>Warning:</Text>
							<Text>The following assets are currently used in your diagram and will be untracked:</Text>
							<ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
								{schemeAssetsToDelete.map(assetRef => (
									<li key={assetRef}>
										<Text className="bp5-text-muted">{assetRef}</Text>
									</li>
								))}
							</ul>
						</div>
					)}
				</Alert>
			</div>
		</QuietUploadArea >
	);
};

export default ElementsDraw;
