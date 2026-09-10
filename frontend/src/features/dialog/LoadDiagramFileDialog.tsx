import { Button, Dialog, DialogBody, DialogFooter, HTMLTable, NonIdealState, Section, SectionCard } from "@blueprintjs/core";
import { useRef, useState } from "react";
import localforage from "localforage";
import UploadArea from "../UploadArea";
import { appToaster } from "../../app/Toaster";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { openDiagram as openDiagramFile, openExampleDiagram } from "../../redux/thunks/diagramThunks";
import { RecentDiagram } from "../../redux/slices/diagramSlice";
import { selectLocalRecentDiagrams } from "../../redux/selectors/diagramSelectors";

export interface ILoadStateDialogProps {
	close: () => void;
	isOpen: boolean;
}

const exampleFiles = import.meta.glob("/src/exampleSequences/*.nmrd", {
	eager: true,
	query: "?url",
	import: "default"
}) as Record<string, string>;

interface ExampleSequenceItem {
	name: string;
	fileName: string;
	url: string;
}

const exampleSequences: ExampleSequenceItem[] = Object.entries(exampleFiles)
	.map(([filePath, url]) => {
		const fileName = filePath.split("/").pop() || "";
		const name = fileName.replace(/\.nmrd$/, "");
		return { name, fileName, url };
	})
	.sort((a, b) => a.name.localeCompare(b.name));

export function LoadDiagramFileDialog(props: ILoadStateDialogProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dispatch = useAppDispatch();
	const recentDiagrams = useAppSelector(selectLocalRecentDiagrams);

	const handleOpenRecent = async (uuid: string, name: string) => {
		try {
			const blob = await localforage.getItem<Blob>(`diagram-${uuid}`);
			if (blob) {
				const safeName = name && name !== "undefined" ? name : "diagram";
				const file = new File([blob], `${safeName}.nmrd`);
				dispatch(openDiagramFile(file)).then(() => {
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

	const handleOpenExample = async (name: string, url: string) => {
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`Failed to fetch example: ${response.statusText}`);
			const blob = await response.blob();
			const safeName = name && name !== "undefined" ? name : "example";
			const file = new File([blob], `${safeName}.nmrd`, { type: "application/zip" });
			await dispatch(openExampleDiagram(file)).unwrap();
			props.close();
			setSelectedFile(null);
		} catch (error) {
			console.error("Failed to load example diagram", error);
			appToaster.show({ message: "Error loading example diagram", intent: "danger" });
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
			dispatch(openDiagramFile(selectedFile)).then(() => {
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
						<Section icon="book"
							title="Example Sequences"
							collapsible={false}
						>
							<SectionCard style={{ padding: 0 }}>
								{exampleSequences.length === 0 ? (
									<div style={{ padding: "16px" }}>
										<NonIdealState description="No example sequences found" icon="document" />
									</div>
								) : (
									<HTMLTable bordered striped interactive style={{ width: "100%", margin: 0 }}>

										<tbody>
											{exampleSequences.map((example) => (
												<tr
													key={example.name}
													onClick={() => handleOpenExample(example.name, example.url)}
													style={{ cursor: "pointer" }}
													title="Click to open example sequence"
												>
													<td style={{ paddingTop: 6, paddingBottom: 6 }}>
														<span style={{ fontWeight: 600 }}>{example.name}</span>
													</td>
												</tr>
											))}
										</tbody>
									</HTMLTable>
								)}
							</SectionCard>
						</Section>
					</div>

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
												<th>Title</th>
												<th>Last Opened</th>
											</tr>
										</thead>
										<tbody>
											{recentDiagrams.map((entry: RecentDiagram, i: number) => {
												const date = new Date(entry.opened);
												const displayName = entry.title || "Untitled";
												return (
													<tr
														key={entry.diagramUUID || i}
														onClick={() => handleOpenRecent(entry.diagramUUID, displayName)}
														style={{ cursor: "pointer" }}
													>
														<td style={{ paddingTop: 4, paddingBottom: 4 }}>{displayName}</td>
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
