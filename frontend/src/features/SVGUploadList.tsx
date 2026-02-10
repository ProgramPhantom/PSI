import {Button, Icon, Text} from "@blueprintjs/core";
import React from "react";
import ENGINE from "../logic/engine";
import {ISVGElement} from "../logic/svgElement";


export interface ISVGUploadListProps {
	elements: Array<{name: string; element: ISVGElement}>;
	uploads: Record<string, string>;
	setUploads: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	title?: string;
}

const SVGUploadList: React.FC<ISVGUploadListProps> = ({elements, uploads, setUploads, title}) => {
	// Check if scheme manager or uploads contains required svgDataRef
	const isSvgRefSatisfied = (svgRef: string): boolean => {
		if (ENGINE.schemeManager.allSVGDataRefs.includes(svgRef) === true) {
			return true;
		} // Scheme Manager
		if (Object.prototype.hasOwnProperty.call(uploads, svgRef)) {
			return true;
		} // Uploads
		return false;
	};

	// unique by svgDataRef, but display all entries
	const svgRequirementRow = elements.map(({name, element}) => {
		const svgDataRef = element.svgDataRef;
		const found = svgDataRef ? isSvgRefSatisfied(svgDataRef) : true;
		return {name, svgDataRef, found};
	});

	// When received file input:
	const onFileInput = (e: React.ChangeEvent<HTMLInputElement>, ref: string) => {
		const file = e.target.files?.[0];
		if (!file || !ref) return;
		const r = new FileReader();
		r.onload = (ev) => {
			const str = ev.target?.result as string;
			setUploads((prev) => ({...prev, [ref]: str}));
		};
		r.readAsText(file);
		e.currentTarget.value = "";
	};

	return (
		<div style={{marginTop: "16px"}}>
			{title && (
				<Text style={{fontWeight: 600, display: "block", marginBottom: "8px"}}>
					{title}
				</Text>
			)}

			<div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
				{svgRequirementRow.map(({name, svgDataRef, found}) => (
					<div
						key={name}
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							border: "1px solid #e1e8ed",
							borderRadius: 6,
							padding: "8px 10px"
						}}>
						<div style={{display: "flex", alignItems: "center", gap: 8}}>
							<Text style={{fontWeight: 600}}>{name}</Text>
							{svgDataRef && (
								<Text style={{color: "#5c7080"}}>svgDataRef: {svgDataRef}</Text>
							)}
						</div>
						<div style={{display: "flex", alignItems: "center", gap: 8}}>
							{found ? (
								<Icon icon="tick-circle" intent="success" title="Found" />
							) : (
								<>
									<input
										id={`upload-${name}`}
										type="file"
										accept=".svg"
										style={{display: "none"}}
										onChange={(e) => onFileInput(e, svgDataRef)}
									/>
									<Button
										icon="upload"
										onClick={() => {
											// What is this? Seems weird so check it out. It works? (vibe coded)
											const input = document.getElementById(
												`upload-${name}`
											) as HTMLInputElement | null;
											input?.click();
										}}>
										Upload SVG
									</Button>
								</>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default SVGUploadList;
