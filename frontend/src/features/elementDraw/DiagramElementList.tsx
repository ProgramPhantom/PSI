import React from "react";
import { HTMLTable } from "@blueprintjs/core";
import { useAppDispatch } from "../../redux/hooks";
import { loadDiagram } from "../../redux/thunks/diagramThunks";
import Diagram from "../../logic/hasComponents/diagram";

interface DiagramElementListProps {
	diagramElements: Diagram[];
}

export const DiagramElementList: React.FC<DiagramElementListProps> = ({ diagramElements }) => {
	const dispatch = useAppDispatch();

	return (
		<div style={{ padding: "16px", overflowY: "auto", height: "100%" }} className="custom-scrollbar">
			<HTMLTable interactive={true} striped={true} style={{ width: "100%" }}>
				<thead>
					<tr>
						<th style={{ padding: "8px 12px" }}>Name</th>
						<th style={{ padding: "8px 12px" }}>ID</th>
						<th style={{ padding: "8px 12px" }}>Sequences</th>
						<th style={{ padding: "8px 12px" }}>Channels</th>
						<th style={{ padding: "8px 12px" }}>Dimensions</th>
					</tr>
				</thead>
				<tbody>
					{diagramElements.map((diagram) => {
						let seqCount = 0;
						let chanCount = 0;
						try {
							seqCount = diagram.sequences?.length ?? 0;
							chanCount = diagram.channels?.length ?? 0;
						} catch (e) {
							console.warn("Failed to get sequence or channel count", e);
						}
						return (
							<tr
								key={diagram.id}
								onDoubleClick={() => dispatch(loadDiagram(diagram.id))}
								style={{ cursor: "pointer" }}
								title="Double-click to load diagram"
							>
								<td style={{ fontWeight: 600, padding: "10px 12px", verticalAlign: "middle" }}>
									{diagram.ref || "unnamed"}
								</td>
								<td style={{ fontFamily: "monospace", fontSize: "11px", color: "#5c7080", padding: "10px 12px", verticalAlign: "middle" }}>
									{diagram.id}
								</td>
								<td style={{ padding: "10px 12px", verticalAlign: "middle" }}>{seqCount}</td>
								<td style={{ padding: "10px 12px", verticalAlign: "middle" }}>{chanCount}</td>
								<td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
									{`${diagram.contentWidth ?? 0} x ${diagram.contentHeight ?? 0}`}
								</td>
							</tr>
						);
					})}
					{diagramElements.length === 0 && (
						<tr>
							<td colSpan={5} style={{ textAlign: "center", color: "#5c7080", padding: "24px" }}>
								No diagrams preloaded in this scheme.
							</td>
						</tr>
					)}
				</tbody>
			</HTMLTable>
		</div>
	);
};

export default DiagramElementList;
