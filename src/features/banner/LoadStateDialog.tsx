import { Button, Dialog, DialogBody, DialogFooter, Text } from "@blueprintjs/core";
import { useRef, useState } from "react";
import ENGINE from "../../logic/engine";
import { IDiagram } from "../../logic/hasComponents/diagram";
import SVGUploadList from "../SVGUploadList";
import UploadArea from "../UploadArea";
import { appToaster } from "../../app/Toaster";

export interface ILoadStateDialogProps {
	close: () => void;
	isOpen: boolean;
}

export function LoadStateDialog(props: ILoadStateDialogProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [pendingState, setPendingState] = useState<IDiagram | null>(null);
	const [isSVGRequirementsOpen, setIsSVGDialogOpen] = useState(false);
	const [stateSvgElements, setStateSvgElements] = useState<Array<{name: string; element: any}>>(
		[]
	);
	const [svgUploads, setSvgUploads] = useState<Record<string, string>>({});

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Check if svgDataRef is in SchemeManager or list of uploads
	const isSvgRefSatisfied = (svgRef: string): boolean => {
		if (ENGINE.schemeManager.allSVGDataRefs.includes(svgRef) === true) {
			return true;
		} // Scheme Manager
		if (Object.prototype.hasOwnProperty.call(svgUploads, svgRef)) {
			return true;
		} // Uploads
		return false;
	};

	const extractSvgElements = (stateData: IDiagram): Array<{name: string; element: any}> => {
		const out: Array<{name: string; element: any}> = [];
		stateData.sequenceAligner.sequences.forEach((seq) => {
			seq.channels?.forEach((ch) => {
				ch.pulseElements.forEach((el: any, idx: number) => {
					const hasRef = el && (el.type === "svg" || el.svgDataRef !== undefined);
					if (hasRef) {
						const name = el.ref || `${ch.sequenceID}-${idx}`;
						out.push({name, element: el});
					}
				});
			});
		});
		return out;
	};

	const handleFileSelect = (file: File) => {
		if (file.type === "application/json" || file.name.endsWith(".json")) {
			setSelectedFile(file);
		} else {
			appToaster.show({
				message: "Please select a JSON file",
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
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const stateData = JSON.parse(e.target?.result as string) as IDiagram;
					const svgs = extractSvgElements(stateData);
					setPendingState(stateData);
					setStateSvgElements(svgs);
					setSvgUploads({});
					if (
						svgs.length === 0
						|| svgs.every(({element}) => isSvgRefSatisfied(element?.svgDataRef))
					) {
						ENGINE.handler.constructDiagram(stateData);
						appToaster.show({
							message: "State loaded successfully",
							intent: "success"
						});
						props.close();
						setSelectedFile(null);
						setPendingState(null);
					} else {
					}
				} catch (error) {
					console.error(error);
					appToaster.show({
						message: "Invalid file format. Please select a valid state file.",
						intent: "danger"
					});
				}
			};
			reader.readAsText(selectedFile);
		}
	};

	const confirmSvgUploads = () => {
		if (!pendingState) {
			setIsSVGDialogOpen(false);
			return;
		}
		// Ensure all refs satisfied
		const missing = stateSvgElements.filter(
			({element}) => !isSvgRefSatisfied(element?.svgDataRef)
		);
		if (missing.length > 0) {
			appToaster.show({
				message: "Please upload missing SVG files before continuing.",
				intent: "danger"
			});
			return;
		}
		// Commit uploads to internal scheme
		Object.entries(svgUploads).forEach(([ref, str]) => {
			ENGINE.schemeManager.addSVGStrData(str, ref);
		});
		// Now construct diagram
		try {
			ENGINE.handler.constructDiagram(pendingState);
			appToaster.show({
				message: "State loaded successfully",
				intent: "success"
			});
		} catch (e) {
			console.error(e);
			appToaster.show({
				message: "Failed to construct diagram.",
				intent: "danger"
			});
		}
		setIsSVGDialogOpen(false);
		props.close();
		setSelectedFile(null);
		setPendingState(null);
		setSvgUploads({});
		setStateSvgElements([]);
	};

	const allStateSvgsSatisfied =
		stateSvgElements.length === 0
		|| stateSvgElements.every(({element}) => isSvgRefSatisfied(element?.svgDataRef));

	return (
		<>
			{/* Load State Dialog */}
			<Dialog
				isOpen={props.isOpen}
				onClose={() => {
					props.close();
					setSelectedFile(null);
				}}
				title="Load State File"
				icon="upload">
				<DialogBody>
					<UploadArea
						selectedFile={selectedFile}
						onFileSelected={handleFileSelect}
						onRemoveFile={removeFile}
						accept={".json"}
						promptText={"Drag and drop a JSON state file here, or"}
						buttonText={"Choose File"}
						setInputRef={(el) => {
							if (fileInputRef) (fileInputRef as any).current = el;
						}}
					/>
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

			{/* SVG Requirements Dialog after loading state */}
			<Dialog
				isOpen={isSVGRequirementsOpen}
				onClose={() => {
					// Cancel upload if user closes without resolving
					setIsSVGDialogOpen(false);
					setPendingState(null);
					setSvgUploads({});
					setStateSvgElements([]);
				}}
				title="Missing SVG Data"
				icon="warning-sign">
				<DialogBody>
					<Text style={{marginBottom: 8}}>
						Some SVG elements in the uploaded state are missing their SVG data. Please
						upload the missing SVG files.
					</Text>

					<SVGUploadList
						title={"SVG requirements"}
						elements={stateSvgElements}
						uploads={svgUploads}
						setUploads={setSvgUploads}
					/>

					{!allStateSvgsSatisfied && (
						<Text style={{color: "#a82a2a", marginTop: 8}}>
							Please upload missing SVG files before continuing.
						</Text>
					)}
				</DialogBody>

				<DialogFooter
					actions={
						<>
							<Button
								text="Cancel"
								onClick={() => {
									setIsSVGDialogOpen(false);
									setPendingState(null);
									setSvgUploads({});
									setStateSvgElements([]);
								}}
							/>
							<Button
								text="Continue"
								intent="primary"
								onClick={confirmSvgUploads}
								disabled={!allStateSvgsSatisfied}
							/>
						</>
					}
				/>
			</Dialog>
		</>
	);
}
