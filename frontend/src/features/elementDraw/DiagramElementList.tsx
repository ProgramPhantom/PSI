import React from "react";
import { HTMLTable } from "@blueprintjs/core";
import { useAppDispatch } from "../../redux/hooks";
import { loadDiagram } from "../../redux/thunks/diagramThunks";
import Diagram from "../../logic/hasComponents/diagram";
import styles from "./styles/DiagramElementList.module.scss";

interface DiagramElementListProps {
	diagramElements: Diagram[];
}

export const DiagramElementList: React.FC<DiagramElementListProps> = ({ diagramElements }) => {
	const dispatch = useAppDispatch();

	return (
		<div className={`${styles.container} custom-scrollbar`}>
			<HTMLTable interactive={true} striped={true}>
				<thead>
					<tr>
						<th>Name</th>
						<th>ID</th>
						<th>Sequences</th>
						<th>Channels</th>
						<th>Dimensions</th>
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
								<td className={styles.boldText}>
									{diagram.ref || "unnamed"}
								</td>
								<td className={styles.monoText}>
									{diagram.id}
								</td>
								<td>{seqCount}</td>
								<td>{chanCount}</td>
								<td>
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
