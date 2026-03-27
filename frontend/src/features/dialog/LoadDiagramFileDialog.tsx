import { Button, Dialog, DialogBody, DialogFooter, HTMLTable, NonIdealState, Section, SectionCard } from "@blueprintjs/core";
import { useRef, useState } from "react";
import localforage from "localforage";
import UploadArea from "../UploadArea";
import { appToaster } from "../../app/Toaster";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { openDiagram } from "../../redux/thunks/diagramThunks";
import { RecentDiagram } from "../../redux/slices/diagramSlice";
import { selectLocalRecentDiagrams } from "../../redux/selectors/diagramSelectors";

export interface ILoadStateDialogProps {
	close: () => void;
	isOpen: boolean;
}

export function LoadDiagramFileDialog(props: ILoadStateDialogProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dispatch = useAppDispatch();
	const recentDiagrams = useAppSelector(selectLocalRecentDiagrams);

	const handleOpenRecent = async (uuid: string, name: string) => {
		try {
			const blob = await localforage.getItem<Blob>(`diagram-${uuid}`);
			if (blob) {
				const file = new File([blob], `${name}.nmrd`);
				dispatch(openDiagram(file)).then(() => {
					props.close();
					setSelectedFile(null);
				});
			} else {
				appToaster.show({ message: "Recent diagram not found", intent: "danger" });
			}
		} catch (error) {
			console.error("Failed to load recent diagram", error);
			appToaster.show({ message: "Error loading recent diagram", intent: "danger" });
		}
	};

	const handleFileSelect = (file: File) => {
		if (file.name.endsWith(".nmrd")) {
			setSelectedFile(file);
		} else {
			appToaster.show({
				message: "Please select an NMRD diagram file",
				intent: "warning"
			});
		}
	};

	const removeFile = () => {
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleLoadFile = () => {
		if (selectedFile) {
			dispatch(openDiagram(selectedFile)).then(() => {
			    props.close();
			    setSelectedFile(null);
			});
		}
	};

	return (
		<>
			<Dialog
				isOpen={props.isOpen}
				onClose={() => {
					props.close();
					setSelectedFile(null);
				}}
				title="Load Diagram File"
				icon="upload">
				<DialogBody>
					<UploadArea
						selectedFile={selectedFile}
						onFileSelected={handleFileSelect}
						onRemoveFile={removeFile}
						accept={".nmrd"}
						promptText={"Drag and drop an NMRD diagram file here, or"}
						buttonText={"Choose File"}
						setInputRef={(el) => {
							if (fileInputRef) (fileInputRef as any).current = el;
						}}
					/>
					<div style={{ marginTop: "24px" }}>
						<Section icon="download" 
							title="Local Diagrams"
							collapsible={false}
						>
							<SectionCard style={{ padding: 0 }}>
								{!recentDiagrams || recentDiagrams.length === 0 ? (
									<div style={{ padding: "16px" }}>
										<NonIdealState description="No recent diagrams" icon="history" />
									</div>
								) : (
									<HTMLTable bordered striped interactive style={{ width: "100%", margin: 0 }}>
										<thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--pt-app-background-color, #fff)" }}>
											<tr>
												<th>Name</th>
												<th>Last Opened</th>
											</tr>
										</thead>
										<tbody>
											{recentDiagrams.map((entry: RecentDiagram, i: number) => {
												const date = new Date(entry.opened);
												return (
													<tr
														key={entry.diagramUUID || i}
														onClick={() => handleOpenRecent(entry.diagramUUID, entry.name)}
														style={{ cursor: "pointer" }}
													>
														<td style={{ paddingTop: 4, paddingBottom: 4 }}>{entry.name || "Untitled"}</td>
														<td style={{ paddingTop: 4, paddingBottom: 4 }}>{date.toLocaleString()}</td>
													</tr>
												);
											})}
										</tbody>
									</HTMLTable>
								)}
							</SectionCard>
						</Section>
					</div>
				</DialogBody>

				<DialogFooter
					actions={
						<>
							<Button
								text="Cancel"
								onClick={() => {
									props.close();
									setSelectedFile(null);
								}}
							/>
							<Button
								text="Load"
								intent="primary"
								onClick={handleLoadFile}
								disabled={!selectedFile}
							/>
						</>
					}
				/>
			</Dialog>
		</>
	);
}
