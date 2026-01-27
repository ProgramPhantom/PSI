import { useEffect, useState, useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import Grid from "../../logic/grid";
import GridInsertArea, { IGridArea } from "./GridInsertArea";


interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface IGridDropFieldProps {
	target: Grid;
}

function GridDropField(props: IGridDropFieldProps) {
	const [insertAreas, setInsertAreas] = useState<IGridArea[]>([]);

	const store = useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
	
	useEffect(() => {
		let insertAreas: IGridArea[] = [];

		const cells = props.target.cells;
		const rows = cells.length;
		const cols = rows > 0 ? cells[0].length : 0;

		// Iterate through all cells and create drop zones for each
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const cell = cells[row][col];

				if (cell !== undefined) {
					const addSpec: IGridArea = {
						area: {
							x: cell.x,
							y: cell.y,
							width: cell.width,
							height: cell.height
						},
						coords: { row: row, col: col },
						id: props.target.id
					};

					insertAreas.push(addSpec);
				}
			}
		}

		setInsertAreas(insertAreas)
	}, [store]);

	return (
		<div id={`${props.target.ref}-drop-field`}>
			{insertAreas.map((insertArea) => {
				return (
					<GridInsertArea
						areaSpec={insertArea}
						key={`${insertArea.coords.row}+${insertArea.coords.col}+${crypto.randomUUID()}`}
					></GridInsertArea>
				);
			})}
		</div>
	);
}

export default GridDropField;
