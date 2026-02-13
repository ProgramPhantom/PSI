import Collection, { AddDispatchData, ICollection, RemoveDispatchData } from "./collection";
import { ID } from "./point";
import Spacial, { Dimensions, GhostTemplate, IGridConfig, ISubgridConfig, PlacementConfiguration, SiteNames, Size } from "./spacial";
import Visual, { GridCellElement, IDraw, IVisual } from "./visual";

export interface IGrid<C extends IVisual = IVisual> extends ICollection<C> {
	minHeight?: number,
	minWidth?: number,

	numRows?: number,
	numColumns?: number
}

type GridElement<S extends Visual = Visual> = GridCellElement<S> | Subgrid<S>;

export type GridCell<S extends Visual = Visual> = OccupiedCell<S> | undefined

export type Elements<T> = T[];
type Sources = { [id: string]: { row: number; col: number } };
export type Ghost = { size: { width: number, height: number }, owner?: ID };
type Extra = { width: number, height: number };

export interface OccupiedCell<S extends Visual = Visual> {
	elements?: Elements<GridElement<S>>;  // The element if this is the “owning” cell
	sources?: Sources;  // If this cell is covered by another
	ghosts?: Ghost[];  // Provide spacing to a cell
	extra?: Extra;  // Applies additional width/height to the row/column
}

export type GridPlacementPredicate = (mode: PlacementConfiguration) => IGridConfig | undefined
export type GridPlacementSetter = (element: Visual, value: IGridConfig) => void


export default class Grid<C extends Visual = Visual> extends Collection<C | Subgrid<C>> implements IDraw {
	public isCellChild = (e: Visual): e is GridCellElement<C> => e.placementMode.type === "grid"
	public isSubgridChild(e: Visual): e is Subgrid<C> {
		return e instanceof Subgrid
	}
	get state(): IGrid {
		return {
			minHeight: this.min.height,
			minWidth: this.min.width,
			numRows: this.numRows,
			numColumns: this.numColumns,
			...super.state
		};
	}

	get cellChildren(): C[] {
		return this.children.filter(c => this.isCellChild(c));
	}
	get subgridChildren(): Subgrid<C>[] {
		return this.children.filter(c => this.isSubgridChild(c));
	}

	get numRows(): number {
		return this.gridMatrix.length;
	}
	get numColumns(): number {
		if (this.gridMatrix[0] === undefined) {
			return 0
		} else {
			return this.gridMatrix[0].length;
		}
	}

	private min: { width: number, height: number };
	public spill: {top: number, bottom: number, left: number, right: number} = {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	}

	protected gridMatrix: GridCell<C>[][] = [];

	public gridSizes: { columns: Spacial[], rows: Spacial[] } = { columns: [], rows: [] };
	public cells: Spacial[][];

	constructor(params: IGrid) {
		super(params);

		this.cells = [];

		this.min = { width: params.minWidth ?? 0, height: params.minHeight ?? 0 };
	}


	// ---------------- Compute Methods ----------------
	//#region 
	public override computeSize(): Size {
		this.growSubgrids();

		// First job is to compute the sizes of all children
		for (let child of this.children) {
			child.computeSize();
		}

		// Compute the size of the grid by finding the maximum width and height
		// element in each column and row, and then summing them up.

		var gridColumns: GridCell<C>[][] = this.getColumns();
		var gridRows: GridCell<C>[][] = this.gridMatrix;

		// Let's compute the width and height of each column
		var columnRects: Spacial[] = Array.from({ length: gridColumns.length }, () => new Spacial())
		var colSpillingElements: GridElement<C>[][] = Array.from({length: gridColumns.length}, () => []);
		var colExtras: number[][] = Array.from({length: gridColumns.length}, () => []);

		// First pass
		gridColumns.forEach((col, col_index) => {
			var colEntries: GridCell<C>[] = col.filter((cell) => cell !== undefined);

			// Find width of column
			var widths: number[] = [];
			for (let cell of colEntries) {

				if (cell?.ghosts !== undefined) {
					widths.push(...cell.ghosts.map((g) => g.size.width));
				}

				if (cell?.extra !== undefined) {
					colExtras[col_index].push(cell.extra.width);
				}

				if (cell?.elements !== undefined) {
					for (let child of cell.elements) {
						let placementMode: IGridConfig | undefined = child.placementMode.config;
						var contributing: boolean = true;
						let spilling: boolean = false;

						// Manual contribution parameter
						if (placementMode !== undefined && placementMode.contribution !== undefined
							&& placementMode.contribution.x === false
						) { contributing = false; spilling = true; }

						// Grow elements do not provide size
						if (child.sizeMode.x === "grow"
						) { contributing = false; }

						// Compute partial width contribution (distribute evenly):
						let width: number = child.width;

						if ((placementMode?.gridSize?.noCols ?? 0) > 1) {
							width = 0;
						}

						if (this.isSubgridChild(child)) {
							width = child.gridSizes.columns[col_index - child.placementMode.config.coords.col].width;

							// Spilling to left
							if (col_index === child.placementMode.config.coords.col &&
								child.spill.left > 0
							) {
								spilling = true;
							}

							// Spilling to right
							if (col_index === child.placementMode.config.coords.col + child.numColumns-1 &&
								child.spill.right > 0
							) {
								spilling = true;
							}
						}

						if (contributing === true) {
							widths.push(width)
						} 
						if (spilling === true) {
							colSpillingElements[col_index].push(child);
						}
					}

				}
			}

			// Set the width of this column
			var maxWidth = Math.max(...widths, this.min.width);
			columnRects[col_index].width = maxWidth;
		})

		// Second pass, apply spills.
		colSpillingElements.forEach((col, col_index) => {
			let targetColWidth: number = columnRects[col_index].width;

			let maxLeftSpill: number = 0;
			let maxRightSpill: number = 0;

			let leftSpill: number;
			let rightSpill: number;

			col.forEach((element) => {
				if (this.isCellChild(element)) {
					switch (element.placementMode.config.alignment?.x) {
						case "here":
							// Apply spill to right row
							rightSpill = element.width - targetColWidth;
							maxRightSpill = Math.max(rightSpill, maxRightSpill);
							break;
						case "centre":
							leftSpill = (element.width - targetColWidth)/2
							rightSpill = (element.width - targetColWidth)/2
							maxLeftSpill = Math.max(leftSpill, maxLeftSpill);
							maxRightSpill = Math.max(rightSpill, maxRightSpill);
							break;
						case "far":
							// Apply spill to left row
							leftSpill = element.width - targetColWidth;
							maxLeftSpill = Math.max(rightSpill, maxRightSpill);
							break;
					}
				}  else if (this.isSubgridChild(element)) {
					// Trigger at left col
					if (col_index === element.placementMode.config.coords.col
					) {maxLeftSpill = Math.max(element.spill.left, maxLeftSpill)}

					if (col_index === element.placementMode.config.coords.col + element.numColumns-1
					) { maxRightSpill = Math.max(element.spill.right, maxRightSpill) }
				}
			})

			// Now we can apply these new constrains to the rows:
			let leftRow: Spacial | undefined = columnRects[col_index-1];
			let rightRow: Spacial | undefined = columnRects[col_index+1];

			if (leftRow !== undefined) {
				leftRow.width = Math.max(maxLeftSpill, leftRow.width);
			} else if (maxLeftSpill > 0) {
				console.warn(`Element spilling to left of grid ${this.ref}`);
				this.spill.left = Math.max(this.spill.left, maxLeftSpill)
			}

			if (rightRow !== undefined) {
				rightRow.width = Math.max(maxRightSpill, rightRow.width)
			} else if (maxRightSpill > 0) {
				console.warn(`Element spilling to right of grid ${this.ref}`)
				this.spill.right = Math.max(this.spill.right, maxRightSpill)
			}
		})

		// Third pass, apply extras:
		colExtras.forEach((extras, col_index) => {
			let targetCol: Spacial = columnRects[col_index];
			targetCol.width += extras.reduce((e, v) => e + v, 0)
		})




		// Now lets compute the width and height of each row
		var rowRects: Spacial[] = Array.from({ length: gridRows.length }, () => new Spacial())
		var rowSpillingElements: GridElement<C>[][] = Array.from({length: gridRows.length}, () => []);
		var rowExtras: number[][] = Array.from({length: gridRows.length}, () => []);

		// First pass, find initial size
		gridRows.forEach((row, row_index) => {
			var rowEntries: OccupiedCell<C>[] = row.filter((cell) => cell !== undefined);

			// Find height of the row
			var heights: number[] = [];
			for (let cell of rowEntries) {

				if (cell?.ghosts !== undefined) {
					heights.push(...cell?.ghosts.map(g => g.size.height));
				}

				if (cell?.extra !== undefined) {
					rowExtras[row_index].push(cell.extra.height);
				}

				if (cell?.elements !== undefined) {
					for (let child of cell.elements) {
						let placementMode: IGridConfig | undefined = child.placementMode.config;
						let contributing: boolean = true;
						let spilling: boolean = false;

						// Manual contribution parameter
						if (placementMode !== undefined && placementMode.contribution !== undefined
							&& placementMode.contribution.y === false
						) { contributing = false; spilling = true; }

						// Grow elements do not provide size
						if (child.sizeMode.y === "grow"
						) { contributing = false; }

						// Compute partial width contribution (distribute evenly):
						let height: number = child.height;

						if (placementMode !== undefined && (placementMode.gridSize?.noRows ?? 0) > 1) {
							height = 0;
						}

						if (this.isSubgridChild(child)) {
							height = child.gridSizes.rows[row_index - child.placementMode.config.coords.row].height;

							// Given this is the top or bottom row of the subgrid, check if the subgrid is spilling
							// vertically and add to spilling elements if so.

							// Spilling above
							if (row_index === child.placementMode.config.coords.row &&
								child.spill.top > 0
							) {
								spilling = true;
							}

							// Spilling below
							if (row_index === child.placementMode.config.coords.row + child.numRows-1 &&
								child.spill.bottom > 0
							) {
								spilling = true;
							}
							// TODO: this will mean the subgrid is added multiple times if it is wide, could 
							// do a check for that for slight performance gain
						}

						if (contributing === true) {
							heights.push(height)
						} 
						if (spilling === true) {
							rowSpillingElements[row_index].push(child);
						}
					}

				}
			}

			// Set the width of this column
			var maxHeight = Math.max(...heights, this.min.height)
			rowRects[row_index].height = maxHeight;
		})

		// Second pass, apply spills.
		rowSpillingElements.forEach((row, row_index) => {
			let targetRowHight: number = rowRects[row_index].height;

			let maxAboveSpill: number = 0;
			let maxBelowSpill: number = 0;

			let aboveSpill: number;
			let belowSpill: number;

			row.forEach((element) => {
				if (this.isCellChild(element)) {
					switch (element.placementMode.config.alignment?.y) {
						case "here":
							// Apply spill to below row
							belowSpill = element.height - targetRowHight;
							maxBelowSpill = Math.max(belowSpill, maxBelowSpill);
							break;
						case "centre":
							aboveSpill = (element.height - targetRowHight)/2
							belowSpill = (element.height - targetRowHight)/2
							maxAboveSpill = Math.max(aboveSpill, maxAboveSpill);
							maxBelowSpill = Math.max(belowSpill, maxBelowSpill);
							break;
						case "far":
							// Apply spill to row above
							aboveSpill = element.height - targetRowHight;
							maxAboveSpill = Math.max(belowSpill, maxBelowSpill);
							break;
					}
				} else if (this.isSubgridChild(element)) {
					// Trigger at top row
					if (row_index === element.placementMode.config.coords.row
					) {maxAboveSpill = Math.max(element.spill.top, maxAboveSpill)}

					
					if (row_index === element.placementMode.config.coords.row + element.numRows-1
					) { maxBelowSpill = Math.max(element.spill.bottom, maxBelowSpill) }
				}
			})

			// Now we can apply these new constrains to the rows:
			let aboveRow: Spacial | undefined = rowRects[row_index-1];
			let belowRow: Spacial | undefined = rowRects[row_index+1];

			if (aboveRow !== undefined) {
				aboveRow.height = Math.max(maxAboveSpill, aboveRow.height);
			} else if (maxAboveSpill > 0) {
				console.warn(`Element spilling above grid ${this.ref}`);
				this.spill.top = Math.max(this.spill.top, maxAboveSpill)
			}

			if (belowRow !== undefined) {
				belowRow.height = Math.max(maxBelowSpill, belowRow.height)
			} else if (maxBelowSpill > 0) {
				console.warn(`Element spilling below grid ${this.ref}`)
				this.spill.bottom = Math.max(this.spill.bottom, maxBelowSpill)
			}
		})

		// Third pass, apply extras:
		rowExtras.forEach((extras, row_index) => {
			let targetRow: Spacial = rowRects[row_index];
			targetRow.height += extras.reduce((e, v) => e + v, 0)
		})

		this.gridSizes.columns = columnRects;
		this.gridSizes.rows = rowRects;

		var totalWidth = this.gridSizes.columns.reduce((w, c) => w + c.width, 0);
		var totalHeight = this.gridSizes.rows.reduce((h, r) => h + r.height, 0);

		// Normalise width and height of columns/rows:
		rowRects.forEach((row) => {
			row.width = totalWidth
		})
		columnRects.forEach((col) => {
			col.height = totalHeight
		})

		this.applyCellSizes();

		this.gridSizes.rows = rowRects;
		this.gridSizes.columns = columnRects;

		// Set via content...
		this.contentWidth = totalWidth;
		this.contentHeight = totalHeight;


		this.applySizesToSubgrids();

		// ...so we can use padding
		return { width: this.width, height: this.height };
	}

	public computePositions(root: { x: number, y: number }): void {
		this.x = root.x;
		this.y = root.y;

		// Find dimension and positions of the cells.
		this.computeCells();

		// this.applyPositionsToSubgrids();

		// Now iterate through the gridMatrix and set the position of children
		this.gridMatrix.forEach((row, row_index) => {
			row.forEach((cell, column_index) => {
				if (cell !== undefined) {
					var cellRect: Spacial = this.cells[row_index][column_index];

					for (let element of cell.elements ?? []) {
						// If this is a reference cell then we don't set the position:
						if (!this.isCellElementSource(element, { row: row_index, col: column_index })) {
							continue
						}

						let gridConfig: IGridConfig = element.placementMode.config;

						let childBottomRight: { row: number, col: number } | undefined = this.getElementBottomRight(element);

						// Create a rect union if the child is in multiple cells
						if (childBottomRight !== undefined && (childBottomRight?.col !== column_index || childBottomRight?.row !== row_index)) {
							cellRect = this.getPositionedCellUnion({ row: row_index, col: column_index }, childBottomRight);
						}

						var alignment: { x: SiteNames, y: SiteNames } = gridConfig.alignment ?? { x: "here", y: "here" }

						cellRect.internalImmediateBind(element, "x", alignment.x)
						cellRect.internalImmediateBind(element, "y", alignment.y)

						element.computePositions({ x: element.x, y: element.y });
					}

				}
			})
		})
	}

	public growElement(containerSize: Size): Record<Dimensions, number> {
		let change = super.growElement(containerSize);

		this.gridMatrix.forEach((row, row_index) => {
			row.forEach((cell, column_index) => {
				if (cell?.elements !== undefined) {
					let cellRect: Size = this.cells[row_index][column_index];

					if (cellRect === undefined) {
						throw new Error(`Index out of bounds row ${row_index}, col: ${column_index}`)
					}

					for (let child of cell.elements) {
						// Skip unless this is an element source
						if (!this.isCellElementSource(child, { row: row_index, col: column_index })) { continue }

						let childBottomRight: { row: number, col: number } | undefined = this.getElementBottomRight(child);

						// Create a rect union if the child is in multiple cells
						if (childBottomRight !== undefined && (childBottomRight?.col !== column_index || childBottomRight?.row !== row_index)) {
							cellRect = this.getCellUnionSize({ row: row_index, col: column_index }, childBottomRight);
						}

						child.growElement(cellRect);
					}

				}
			})
		})

		return change;
	}


	// ------ Helpers ---------
	/**
	 * Computes the positions and sizes of cells in a grid layout.
	 * Initializes the cells array with Spacial objects representing each cell's geometry.
	 * Each cell's position is calculated based on cumulative widths (x-axis) and heights (y-axis)
	 * from the grid's content origin point (contentX, contentY).
	 * 
	 * The computation uses:
	 * - gridSizes.rows[].height for row heights
	 * - gridSizes.columns[].width for column widths
	 * 
	 * @protected
	 * @returns {void}
	 */
	protected computeCells() {
		// First let's generate the sizes and positions of each cell

		this.cells = Array.from({ length: this.numRows }, () => Array.from({ length: this.numColumns }, () => new Spacial()));

		var xCount: number = 0;
		var yCount: number = 0;


		for (var row = 0; row < this.numRows; row++) {
			xCount = 0;
			var rowHeight: number = this.gridSizes.rows[row].height;

			for (var col = 0; col < this.numColumns; col++) {
				var colWidth: number = this.gridSizes.columns[col].width;

				this.cells[row][col] = new Spacial({
					contentWidth: colWidth,
					contentHeight: rowHeight,
					x: this.x + xCount,
					y: this.y + yCount,
					ref: "grid-cell",
					type: "lower-abstract"
				})

				xCount += colWidth;
			}

			yCount += rowHeight;
		}


		// Set positions of columns and rows
		this.gridSizes.columns.forEach((col, i) => {
			col.x = this.cells[0][i].x;
			col.y = this.cells[0][0].y;
		})
		this.gridSizes.rows.forEach((row, i) => {
			row.y = this.cells[i][0].y;
			row.x = this.cells[0][0].x;
		})
	}

	protected applyCellSizes() {
		this.cells = Array.from({ length: this.numRows }, () => Array.from({ length: this.numColumns }, () => new Spacial()));

		this.gridSizes.rows.forEach((row, row_index) => {
			this.gridSizes.columns.forEach((column, column_index) => {
				let targetCell = this.cells[row_index][column_index];

				targetCell.width = column.width;
				targetCell.height = row.height;
			})
		})
	}

	/**
	 * Returns a positioned Spacial that is the geometric union of the
	 * cells contained in the rectangle defined by topLeft and bottomRight
	 * (inclusive). The returned Spacial carries x/y coordinates taken
	 * from the component cells, so computePositions must have been run
	 * before calling this method for meaningful absolute positions.
	 *
	 * @param topLeft - top-left cell coordinate (inclusive)
	 * @param bottomRight - bottom-right cell coordinate (inclusive)
	 * @throws Error if the provided coordinates are not in the expected order
	 */
	public getPositionedCellUnion(topLeft: { row: number, col: number }, bottomRight: { row: number, col: number }): Spacial {
		if (topLeft.row > bottomRight.row || topLeft.col > bottomRight.col) {
			throw new Error(`Erroneous coordinate input topLeft: {row: ${topLeft.row}, col: ${topLeft.col}}, bottomRight: {row: ${bottomRight.row}, col: ${bottomRight.col}}`)
		}

		let cells: Spacial[] = this.getCellsInRegion(topLeft, bottomRight);

		let union: Spacial = Spacial.CreateUnion(...cells);

		// Returns a positioned union of the cells in the region specified. Will
		// not return an expected result if cells have not been positioned
		// TODO: throw error if cells have not been given position and this called.
		return union;
	}

	/**
	 * Compute the combined size (width and height) of a rectangular region of
	 * adjacent grid cells specified by top-left and bottom-right coordinates.
	 *
	 * This returns a object instance representing the size of the union of
	 * cells in the region. The method assumes the cells in the region are adjacent and
	 * simply sums their widths and heights.
	 *
	 * @param topLeft - top-left cell coordinate (inclusive)
	 * @param bottomRight - bottom-right cell coordinate (inclusive)
	 * @throws Error if the provided coordinates are not in the expected order
	 * @returns Object sized to the union of the specified cells
	 */
	public getCellUnionSize(topLeft: { row: number, col: number }, bottomRight: { row: number, col: number }): Size {
		if (topLeft.row > bottomRight.row || topLeft.col > bottomRight.col) {
			throw new Error(`Erroneous coordinate input topLeft: {row: ${topLeft.row}, col: ${topLeft.col}}, bottomRight: {row: ${bottomRight.row}, col: ${bottomRight.col}}`)
		}

		let cells: Spacial[] = this.getCellsInRegion(topLeft, bottomRight);

		let width: number = cells.reduce((w, c) => w + c.width, 0);
		let height: number = cells.reduce((h, c) => h + c.height, 0);

		// Returns *size* of cell union. Works only for adjacent cells, and can be used before
		// computePositions has been run.
		return { width: width, height: height };
	}

	private growSubgrids() {
		this.subgridChildren.forEach((sg) => {
			let root: { row: number, col: number } = sg.placementMode.config.coords;
			let currWidth: number = sg.numColumns;
			let currHeight: number = sg.numRows;
			let dWidth: number = (this.numColumns) - root.col;
			let dHeight: number = (this.numRows) - root.row;

			let newWidth: number = sg.placementMode.config.fill?.cols === true ? dWidth : currWidth;
			let newHeight: number = sg.placementMode.config.fill?.rows === true ? dHeight : currHeight;

			if (newHeight !== currHeight || newWidth !== currWidth) {
				this.setChildSize(sg, { noRows: newHeight, noCols: newWidth });
			}
		})
	}


	//#endregion
	// -------------------------------------------------

	// ---------------- Draw Methods ----------------
	//#region 

	//#endregion
	// -------------------------------------------------

	// ---------------- Add Methods ----------------
	//#region
	public override add({ child, index }: AddDispatchData<C>) {
		super.add({ child, index });

		if (this.isCellChild(child)) {
			this.addGridElement(child);
		} else if (this.isSubgridChild(child)) {
			this.addSubgrid(child)
		}
	}
	// ---- private?

	public appendElementsInRegion(gridRegion: GridCell<C>[][], coords?: { row: number, col: number }) {
		if (gridRegion.length === 0 || gridRegion[0].length === 0) { return }
		if (coords === undefined) {
			coords = { row: 0, col: 0 }
		}

		let noRows: number = gridRegion.length;
		let noCols: number = gridRegion[0].length;

		let leftCol: number = coords.col;
		let rightCol: number = coords.col + noCols - 1;

		let topRow: number = coords.row;
		let bottomRow: number = coords.row + noRows - 1;

		this.setMatrixBottomRight({ row: bottomRow, col: rightCol }, true);

		for (let r = 0; r < noRows; r++) {
			for (let c = 0; c < noCols; c++) {
				let row: number = r + topRow;
				let col: number = c + leftCol;

				let toAppend: GridCell<C> = gridRegion[r][c];

				this.appendToCellAtCoord(toAppend, { row: row, col: col });
			}
		}
	}

	private addGridElement(child: GridCellElement<C>) {

		let insertCoords: { row: number, col: number } | undefined = child.placementMode.config.coords;
		if (insertCoords === undefined) {
			throw new Error(`Adding grid child ${child.ref} with unspecified coords`)
		}

		var region: OccupiedCell<C>[][] | undefined = this.getChildRegion(child, { row: insertCoords.row, col: insertCoords.col });

		if (region === undefined) {
			throw new Error(`Could not construct cell region for element ${child.ref}`)
		}

		this.appendElementsInRegion(region, { row: insertCoords.row, col: insertCoords.col });
	}

	private addSubgrid(child: Subgrid<C>) {
		let subgridRegion: GridCell<C>[][] = child.getSubgridRegion();

		this.appendElementsInRegion(subgridRegion, child.placementMode.config.coords);
	}

	public addElementAtCoord(child: GridCellElement<C>, coords: { row: number, col: number }) {
		var insertCoords: { row: number, col: number } = coords;

		child.placementMode.config.coords = insertCoords;

		this.addGridElement(child);
	}

	public appendToCellAtCoord(cell: GridCell<C>, coords: { row: number, col: number }) {
		if (Object.keys(cell ?? {}).length === 0) { return }

		this.setMatrixBottomRight(coords, true);

		let targetGridCell: GridCell<C> = this.gridMatrix[coords.row][coords.col];

		if (targetGridCell === undefined) {
			targetGridCell = {};
		}

		let currElements: GridElement<C>[] | undefined = targetGridCell.elements ?? [];
		let currSources: { [index: number]: { row: number; col: number } } | undefined = targetGridCell.sources ?? {};
		let currGhosts: Ghost[] | undefined = targetGridCell.ghosts ?? [];

		currElements.push(...(cell?.elements ?? []))
		if (currElements.length === 0) { currElements = undefined }
		else {
			for (let child of currElements) {
				// Don't change child coord with coord of source cells
				//if (cell?.sources?.[child.id] === undefined) {
				//	child.placementMode.config.coords = coords;
				//}

				if (child.parentId === undefined) {
					child.parentId = this.id;
				}
			}
		}

		Object.assign(currSources, cell?.sources ?? {})
		if (Object.keys(currSources).length === 0) { currSources = undefined }

		currGhosts.push(...(cell?.ghosts ?? []))
		if (currGhosts.length === 0) { currGhosts = undefined }

		let extra: { width: number, height: number } | undefined = cell?.extra;

		let finalCell: GridCell<C> = {
			elements: currElements,
			sources: currSources,
			ghosts: currGhosts,
			extra: extra
		}

		this.gridMatrix[coords.row][coords.col] = finalCell;
	}

	public setMatrixAtCoord(gridEntry: GridCell<C>, coords: { row: number, column: number }) {
		this.gridMatrix[coords.row][coords.column] = gridEntry;
	}

	public setGrid(grid: GridCell<C>[][], sizes: { columns: Spacial[], rows: Spacial[] }, cells: Spacial[][]) {
		this.gridMatrix = grid;
		this.gridSizes = sizes;
		this.cells = cells;
	}

	public setMatrix(matrix: GridCell<C>[][]) {
		this.gridMatrix = matrix;
	}

	public setMatrixRegion(gridRegion: GridCell<C>[][], coords?: { row: number, col: number }) {
		if (gridRegion.length === 0 || gridRegion[0].length === 0) { return }
		if (coords === undefined) {
			coords = { row: 0, col: 0 }
		}

		let noRows: number = gridRegion.length;
		let noCols: number = gridRegion[0].length;

		let leftCol: number = coords.col;
		let rightCol: number = coords.col + noCols - 1;

		let topRow: number = coords.row;
		let bottomRow: number = coords.row + noRows - 1;


		this.setMatrixBottomRight({ row: bottomRow, col: rightCol }, true);

		for (let r = 0; r < noRows; r++) {
			for (let c = 0; c < noCols; c++) {
				let row: number = r + topRow;
				let col: number = c + leftCol;

				this.gridMatrix[row][col] = gridRegion[r][c]
			}
		}
	}

	public addGhost(coords: {row: number, col: number}, ghost: Ghost) {
		this.appendToCellAtCoord({ghosts: [ghost]}, coords);
	} 
	//#endregion
	// -------------------------------------------------

	// ---------------- Remove Methods ----------------
	//#region 
	public remove({ child }: RemoveDispatchData<C>, deleteIfEmpty?: { row: boolean, col: boolean }) {
		super.remove({ child })

		if (this.isCellChild(child)) {
			this.removeMatrix(child, deleteIfEmpty)
		} else if (this.isSubgridChild(child)) {
			this.removeMatrix(child, deleteIfEmpty)
		}
	}

	private removeMatrix(child: GridElement<C>, deleteIfEmpty?: { row: boolean, col: boolean }) {
		// First we need to locate this child in the matrix:
		let {topLeft, bottomRight} = this.getElementRegionCoords(child);
		if (topLeft === undefined || bottomRight === undefined) {
			console.warn(`Cannot locate child ${child.ref} in grid object ${this.ref}`)
			return
		}

		let id: ID = child.id;
		let numRows: number = bottomRight.row - topLeft.row + 1;
		let numCols: number = bottomRight.col - topLeft.col + 1;

		for (let r = 0; r < numRows; r++) {
			for (let c = 0; c < numCols; c++) {
				let row = r + topLeft.row;
				let col = c + topLeft.col;

				let cell = this.gridMatrix[row][col]
				if (cell?.elements === undefined) {
					console.warn(`Erroneous form for element ${child.ref}`)
					continue
				}

				cell.elements = cell.elements.filter(el => el.id !== child.id);

				if (cell.elements.length === 0) {
					cell.elements = undefined;
				}

				// Remove source
				if (cell.sources !== undefined && cell.sources[id] !== undefined) {
					delete cell.sources[id]
					if (Object.keys(cell.sources).length === 0) {
						cell.sources = undefined
					}
				}

				// Remove ghosts
				if (cell.ghosts !== undefined) {
					cell.ghosts = cell.ghosts.filter(g => g.owner !== child.id)
				}
				if (cell.ghosts?.length === 0) { cell.ghosts = undefined };

				// Set cell to undefined
				this.setCellUndefinedIfEmpty({row: row, col: col});

				// Remove row/column
				if (deleteIfEmpty?.row === true) {
					this.removeRow(row, true)
				}

				if (deleteIfEmpty?.col === true) {
					this.removeColumn(col, true)
				}
			}
		}
	}

	public deleteCellAtCoord(coords: { row: number, col: number }, deleteIfEmpty?: { row: boolean, col: boolean }) {
		var targetCell = this.gridMatrix[coords.row][coords.col];

		if (targetCell === undefined) {
			console.warn(`Removing child in cell outside of matrix in grid ${this.ref}`)
			return
		}

		this.gridMatrix[coords.row][coords.col] = undefined;

		if (deleteIfEmpty?.row === true) {
			this.removeRow(coords.row, true)
		}
		if (deleteIfEmpty?.col === true) {
			this.removeColumn(coords.col, true)
		}

		// Cut off empty trailing rows and columns
		this.squeezeMatrix();
	}
	//#endregion
	// -----------------------------------------------


	// --------------- Matrix Size --------------------
	//#region 
	public matchRowLengths() {
		var maxRowLength = Math.max(...this.getRows().map(row => row.length));

		this.getRows().forEach((row) => {
			var rowLength = row.length;
			var diff = rowLength - maxRowLength;

			if (diff > 0) {
				row.push(...(new Array<undefined>(diff).fill(undefined)))
			}

		})
	}

	/**
	 * Expands the matrix by inserting empty rows and/or columns until the provided
	 * zero-based coordinate (row, col) is within the matrix bounds. This method
	 * mutates the underlying grid state by calling insertEmptyRow() and
	 * insertEmptyColumn() as needed.
	 *
	 * @protected
	 *
	 * @param coords - An object with zero-based `row` and `col` indices that must be contained by the matrix.
	 *                 If the coordinate is already within bounds, no changes are made.
	 *
	 * @remarks
	 * - The method computes how many additional rows and columns are required and
	 *   inserts them one at a time until the coordinate is reachable. The coords
	 *   parameter is *not* the number of rows and columns to be added.
	 * - Negative indices or non-integer values are not explicitly validated here;
	 *   callers should provide valid, non-negative integer indices.
	 * - Complexity is proportional to the number of inserted rows and columns.
	 *
	 * @example
	 * // ensure coordinate (5, 3) exists; will insert rows/columns as needed
	 * this.expandMatrix({ row: 5, col: 3 });
	 */
	public setMatrixBottomRight(coords: { row?: number, col?: number }, onlyGrow: boolean = false) {
		var rowDiff: number = coords.row !== undefined ? coords.row - this.numRows + 1 : 0;
		var colDiff: number = coords.col !== undefined ? coords.col - this.numColumns + 1 : 0;

		// There are missing rows needed to add this coord
		while (rowDiff >= 1) {
			this.insertEmptyRow()
			rowDiff -= 1
		}

		while (colDiff >= 1) {
			this.insertEmptyColumn();
			colDiff -= 1
		}

		if (onlyGrow === false) {
			// Or if negative, we need to remove rows
			while (rowDiff < 0) {
				this.removeRow();
				rowDiff += 1
			}

			while (colDiff < 0) {
				this.removeColumn();
				colDiff += 1
			}
		}
	}

	protected squeezeMatrix() {
		var trailingRow: GridCell<C>[] | undefined = this.getRow(this.numRows - 1) ?? []
		var trailingColumn: GridCell<C>[] | undefined = this.getColumn(this.numColumns - 1) ?? []

		var trailingRowEmpty: boolean = this.isCellArrayEmpty(trailingRow);
		var trailingColumnEmpty: boolean = this.isCellArrayEmpty(trailingColumn);

		while (trailingRowEmpty === true && trailingRow !== undefined) {
			this.removeRow(undefined, true);
			trailingRow = this.getRow(this.numRows - 1);
			trailingRowEmpty = this.isCellArrayEmpty(trailingRow ?? []);
		}

		while (trailingColumnEmpty === true && trailingColumn !== undefined) {
			this.removeColumn(undefined, true);
			trailingColumn = this.getColumn(this.numColumns - 1);
			trailingColumnEmpty = this.isCellArrayEmpty(trailingColumn ?? []);
		}
	}

	public insertEmptyColumn(index?: number) {
		let newColumn: GridCell<C>[] = Array<GridCell<C>>(this.numRows).fill(undefined);
		let INDEX: number | undefined = index;
		if (INDEX === undefined || INDEX < 0 || INDEX > this.numColumns) {
			INDEX = this.numColumns;
		}

		// Grow split elements by 1 in columns
		let structuredSplitElements: GridElement<C>[][] = this.getStructuredColumnSplitElements(INDEX);
		structuredSplitElements.forEach((row, row_index) => {
			for (let element of row) {
				// Add source to the gap
				// Add this element so that it spans over the gap
				if (newColumn[row_index]?.sources === undefined) {
					newColumn[row_index] = { sources: { [element.id]: element.placementMode.config.coords ?? { row: 0, col: 0 } } }
				} else {
					newColumn[row_index].sources[element.id] = element.placementMode.config.coords ?? { row: 0, col: 0 }
				}

				// Add element to gap
				if (newColumn[row_index]?.elements === undefined) {
					newColumn[row_index].elements = [element]
				} else {
					newColumn[row_index].elements.push(element)
				}
			}
		})
		
		// Make singular updates to the state of elements
		let splitElements: Set<GridElement<C>> = this.getColumnSplitElements(INDEX);
		splitElements.forEach((el) => {
			if (this.isCellChild(el) && el.placementMode.config.gridSize !== undefined) {
				el.placementMode.config.gridSize.noCols += 1
			} else if (this.isSubgridChild(el)) {
				el.insertEmptyColumn(el.getRelativeCol(INDEX));
			}
		})

		for (let i = 0; i < this.numRows; i++) {
			this.gridMatrix[i].splice(INDEX, 0, newColumn[i]);
		}

		this.shiftElementColumnIndexes(INDEX+1, 1);

		this.growSubgrids();
	}

	public insertEmptyRow(index?: number): void {
		var newRow: GridCell<C>[] = Array<GridCell<C>>(this.numColumns).fill(undefined)
		let INDEX: number | undefined = index;
		if (INDEX === undefined || INDEX < 0 || INDEX > this.numRows) {
			INDEX = this.numRows;
		}

		// Grow split elements by 1 in rows
		let structuredSplitElements: GridElement<C>[][] = this.getStructuredRowSplitElements(INDEX);
		structuredSplitElements.forEach((col, col_index) => {
			for (let element of col) {
				// Add this element so that it spans over the gap
				if (newRow[col_index]?.sources === undefined) {
					newRow[col_index] = { sources: { [element.id]: element.placementMode.config.coords ?? { row: 0, col: 0 } } }
				} else {
					newRow[col_index].sources[element.id] = element.placementMode.config.coords ?? { row: 0, col: 0 }
				}

				if (newRow[col_index]?.elements === undefined) {
					newRow[col_index].elements = [element]
				} else {
					newRow[col_index].elements.push(element)
				}
			}
		})

		// Make singular updates to the state of elements
		let splitElements: Set<GridElement<C>> = this.getRowSplitElements(INDEX);
		splitElements.forEach((el) => {
			if (this.isCellChild(el) && el.placementMode.config.gridSize !== undefined) {
				el.placementMode.config.gridSize.noRows += 1
			} else if (this.isSubgridChild(el)) {
				el.insertEmptyRow(el.getRelativeRow(INDEX));
			}
		})

		this.gridMatrix.splice(INDEX, 0, newRow);

		this.shiftElementRowIndexes(INDEX, 1);

		this.growSubgrids();
	}

	public removeColumn(index?: number, remove: true | "if-empty" = true) {
		if (index === undefined || index < 0 || index > this.numColumns - 1) {
			var INDEX = this.numColumns - 1;
		} else {
			INDEX = index;
		}

		var targetColumn: GridCell<C>[] | undefined = this.getColumn(INDEX);
		if (targetColumn === undefined) { return }

		var empty: boolean = this.isCellArrayEmpty(targetColumn)

		if (remove === "if-empty" && empty === false) { return }

		let splitElements: Set<GridElement<C>> = this.getColumnSplitElements(INDEX);

		for (let i = 0; i < this.numRows; i++) {
			this.gridMatrix[i].splice(INDEX, 1);
		}

		this.shiftElementColumnIndexes(INDEX, -1);

		// Shrink split elements by either removing a col
		// from subgrid or reducing grid-size;
		splitElements.forEach((element) => {
			if (this.isSubgridChild(element)) {
				element.removeColumn(INDEX)
			} else if (element.placementMode.config.gridSize !== undefined) {
				element.placementMode.config.gridSize = {
					noRows: element.placementMode.config.gridSize.noRows,
					noCols: element.placementMode.config.gridSize.noCols - 1
				}
			}

		})
	}

	public removeRow(index?: number, onlyIfEmpty: boolean = false) {
		if (index === undefined || index < 0 || index > this.numRows - 1) {
			var INDEX = this.numRows - 1;
		} else {
			INDEX = index;
		}

		var targetRow: GridCell<C>[] | undefined = this.getRow(INDEX);
		if (targetRow === undefined) { return }

		var empty: boolean = this.isCellArrayEmpty(targetRow)

		if (onlyIfEmpty === true && !empty) { return }

		this.gridMatrix.splice(INDEX, 1);

		this.shiftElementRowIndexes(INDEX, -1);
	}

	// --- Helpers ----
	protected getStructuredColumnSplitElements(index: number): GridElement<C>[][] {
		if (index > this.numColumns || index < 0) {
			throw new Error(`Index ${index} is out of bounds`)
		}

		// Get elements which have a part on the left and right of the index (insertion index)
		var elements: GridElement<C>[][] = Array.from({ length: this.numRows }, () => []);

		this.getRows().forEach((row, row_index) => {
			let leftCell: GridCell<C> = row[index - 1];
			let rightCell: GridCell<C> = row[index];

			for (let child of (leftCell?.elements ?? [])) {
				let childIndex: number = (rightCell?.elements ?? []).indexOf(child);

				if (childIndex !== -1) {
					elements[row_index].push(child);
				}
			}
		})

		return elements;
	}

	protected getStructuredRowSplitElements(index: number): GridElement<C>[][] {
		if (index > this.numRows || index < 0) {
			throw new Error(`Index ${index} is out of bounds`)
		}

		// Get elements which have a part on the left and right of the index (insertion index)
		var elements: GridElement<C>[][] = Array.from({ length: this.numColumns }, () => []);

		this.getColumns().forEach((col, col_index) => {
			let leftCell: GridCell<C> = col[index - 1];
			let rightCell: GridCell<C> = col[index];

			for (let child of (leftCell?.elements ?? [])) {
				let childIndex: number = (rightCell?.elements ?? []).indexOf(child);

				if (childIndex !== -1) {
					elements[col_index].push(child);
				}
			}
		})

		return elements;
	}

	protected getColumnSplitElements(index: number): Set<GridElement<C>> {
		if (index > this.numColumns || index < 0) {
			throw new Error(`Index ${index} is out of bounds`)
		}

		var elements: Set<GridElement<C>> = new Set<GridElement<C>>;

		this.getRows().forEach((row) => {
			let leftCell: GridCell<C> = row[index - 1];
			let rightCell: GridCell<C> = row[index];

			for (let child of (leftCell?.elements ?? [])) {
				let childIndex: number = (rightCell?.elements ?? []).indexOf(child);

				if (childIndex !== -1) {
					elements.add(child);
				}
			}
		})

		return elements;
	}


	protected getRowSplitElements(index: number): Set<GridElement<C>> {
		if (index > this.numRows || index < 0) {
			throw new Error(`Index ${index} is out of bounds`)
		}

		var elements: Set<GridElement<C>> = new Set<GridElement<C>>;

		this.getColumns().forEach((col) => {
			let topCell: GridCell<C> = col[index - 1];
			let bottomCell: GridCell<C> = col[index];

			for (let child of (topCell?.elements ?? [])) {
				let childIndex: number = (bottomCell?.elements ?? []).indexOf(child);

				if (childIndex !== -1) {
					elements.add(child);
				}
			}
		})

		return elements;
	}

	protected shiftElementColumnIndexes(from: number, amount: number = 1) {
		// Update grid indexes
		for (let col_index = from; col_index < this.numColumns; col_index++) {
			let col: GridCell<C>[] = this.getColumn(col_index) ?? [];

			// Go down the column
			col.forEach((cell, row_index) => {
				if (cell?.elements !== undefined) {
					cell.elements.forEach((element) => {
						if (!this.isCellElementSource(element, { row: row_index, col: col_index })) { return }

						let gridConfig: IGridConfig = element.placementMode.config;
						if (gridConfig.coords !== undefined) {
							gridConfig.coords.col += amount;
						}
					})
				}

				// Update sources
				if (cell?.sources !== undefined) {
					Object.entries(cell.sources).forEach(([id, coord]) => {
						if (coord.col >= from) {
							coord.col += amount
						}
					})
				}
			})
		}
	}

	protected shiftElementRowIndexes(from: number, amount: number = 1) {
		// Update grid indexes
		for (let row_index = from; row_index < this.numRows; row_index++) {
			let row: GridCell<C>[] = this.getRow(row_index) ?? [];

			// Go down the row
			row.forEach((cell, col_index) => {
				if (cell?.elements !== undefined) {
					cell.elements.forEach((element) => {
						if (!this.isCellElementSource(element, { row: row_index, col: col_index })) { return }

						let gridConfig: IGridConfig = element.placementMode.config;
						if (gridConfig.coords !== undefined) {
							gridConfig.coords.row += amount;
						}
					})
				}

				// Update sources
				if (cell?.sources !== undefined) {
					Object.entries(cell.sources).forEach(([id, coord]) => {
						if (coord.row >= from) {
							coord.row += amount
						}
					})
				}
			})
		}
	}
	//#endregion
	// -------------------------------------------------


	// ----------------- Accessors -----------------------
	//#region 
	public getColumns(): GridCell<C>[][] {
		if (this.gridMatrix.length === 0 || this.gridMatrix[0].length === 0) {
			return [];
		}

		const numCols = this.gridMatrix[0].length;
		const columns: GridCell<C>[][] = [];

		for (let col = 0; col < numCols; col++) {
			const column: GridCell<C>[] = this.gridMatrix.map(row => row[col]);
			columns.push(column);
		}

		return columns;
	}

	public getColumn(index: number): GridCell<C>[] | undefined {
		if (index >= this.numColumns || index < 0) { return undefined }
		return this.gridMatrix.map((row) => row[index]);
	}

	public getRows(): GridCell<C>[][] {
		return this.gridMatrix;
	}

	public getRow(index: number): GridCell<C>[] | undefined {
		return this.gridMatrix[index];
	}

	public getCell(coords: { row: number, col: number }): GridCell<C> {
		return this.gridMatrix[coords.row]?.[coords.col];
	}

	public getCells(): Spacial[] {
		return this.cells.flat();
	}

	protected locateElement(target: GridElement<C>): { row: number, col: number } | undefined {
		var coords: { row: number, col: number } | undefined = undefined;

		this.gridMatrix.forEach((row, row_index) => {
			row.forEach((cell, column_index) => {
				if (cell?.elements !== undefined) {

					cell.elements.forEach((child, child_index) => {
						if (child.id === target.id && coords === undefined) {
							coords = { row: row_index, col: column_index }
						}
					})


				}
			})
		})

		return coords;
	}

	protected getFirstAvailableCell(): { row: number, col: number } {
		var coords: { row: number, col: number } | undefined = undefined;
		for (let row = 0; row < this.numRows; row++) {
			for (let col = 0; col < this.numColumns; col++) {
				if (this.gridMatrix[row][col] === undefined) {
					coords = { row: row, col: col }
				}
			}
		}

		// If there is nowhere to insert this child, create a new row and put it there
		if (coords === undefined) {
			this.insertEmptyRow();
			coords = { row: this.numRows, col: 0 }
		}

		return coords;
	}

	public getElementBottomRight(child: GridElement<C>): { row: number, col: number } | undefined {
		let location: { row: number, col: number } | undefined = this.locateElement(child);

		if (location === undefined) { return undefined }

		let right: number = location.col;
		let bottom: number = location.row;

		// Move right:
		while (this.gridMatrix[location.row][right + 1] !== undefined &&
			this.gridMatrix[location.row][right + 1]?.elements?.some(el => el.id === child.id)) {
			right += 1
		}

		// Move down:
		while (this.gridMatrix[bottom + 1] !== undefined &&
			this.gridMatrix[bottom + 1][location.col]?.elements?.some(el => el.id === child.id)) {
			bottom += 1
		}

		return { row: bottom, col: right }
	}

	public getMatrixInRegion(topLeft: { row: number, col: number }, bottomRight: { row: number, col: number }): GridCell<C>[][] {
		// Check valid input:
		if (topLeft.row > bottomRight.row || topLeft.col > bottomRight.col) {
			throw new Error(`Invalid input topLeft: (${topLeft.row}, ${topLeft.col})-(${bottomRight.row}, ${bottomRight.col})`)
		}

		let subMatrix: GridCell<C>[][] = [];

		for (let r = topLeft.row; r <= bottomRight.row; r++) {
			let row: GridCell<C>[] | undefined = this.getRow(r);
			if (row === undefined) { continue }

			let rowSlice: GridCell<C>[] = row.slice(topLeft.col, bottomRight.col);
			subMatrix.push(rowSlice);
		}

		return subMatrix;
	}

	public getCellsInRegion(topLeft: { row: number, col: number }, bottomRight: { row: number, col: number }): Spacial[] {
		// Check valid input:
		if (topLeft.row > bottomRight.row || topLeft.col > bottomRight.col) {
			return []
		}

		let result: Spacial[] = [];

		for (let r = topLeft.row; r <= bottomRight.row; r++) {
			if (this.cells[r] === undefined) { continue }
			for (let c = topLeft.col; c <= bottomRight.col; c++) {
				if (this.cells[r][c] === undefined) { continue }
				result.push(this.cells[r][c]);
			}
		}

		return result;
	}

	public getElementRegionCoords(child: GridElement<C>): {topLeft: {row: number, col: number}, bottomRight: {row: number, col: number}} {
		let topLeft: {row: number, col: number} = child.placementMode.config.coords ?? {row: 0, col: 0};
		let bottomRight: {row: number, col: number};

		if (this.isCellChild(child)) {
			bottomRight = {
				row: topLeft.row + (child.placementMode.config.gridSize?.noRows ?? 1)-1,
				col: topLeft.col + (child.placementMode.config.gridSize?.noCols ?? 1)-1
			}
		} else {
			bottomRight = {
				row: topLeft.row + child.numRows-1,
				col: topLeft.col + child.numColumns-1,
			}
		}

		return {
			topLeft: topLeft,
			bottomRight: bottomRight
		}
	}
	//#endregion
	// -----------------------------------------------


	// -------------- Child sizing -------------------
	//#region 
	public setChildSize(child: GridElement<C>, size: { noRows: number, noCols: number }) {
		let location: { row: number, col: number } | undefined = this.locateElement(child)

		if (location === undefined) {
			console.warn(`Cannot locate child for size change ${child.ref}`)
			return
		}


		if (this.isCellChild(child)) {
			child.placementMode.config.gridSize = { noRows: size.noRows, noCols: size.noCols }
		} else if (this.isSubgridChild(child)) {
			child.setMatrixBottomRight({ row: size.noRows - 1, col: size.noCols - 1 })
		}

		let region: OccupiedCell<C>[][] | undefined = this.getChildRegion(child);
		if (region === undefined) {
			return
		}

		this.removeMatrix(child);
		this.appendElementsInRegion(region, location);
	}

	protected getChildRegion(child: GridElement<C>, overridePosition?: { row: number, col: number }): OccupiedCell<C>[][] | undefined {
		if (this.isSubgridChild(child)) {
			return child.getSubgridRegion();
		}

		let gridConfig: IGridConfig = child.placementMode.config;

		let topLeft: { row: number, col: number } | undefined = gridConfig.coords;
		if (topLeft === undefined) {
			console.warn(`Cannot locate child ${child.ref} in grid object ${this.ref}`)
			return
		}

		let bottomRight: { row: number, col: number } = {
			row: topLeft.row + (gridConfig.gridSize?.noRows ?? 1) - 1,
			col: topLeft.col + (gridConfig.gridSize?.noCols ?? 1) - 1
		};


		let root: { row: number, col: number } = overridePosition ?? topLeft
		gridConfig.coords = root;

		// Construct region
		let entry: OccupiedCell<C> = { elements: [child], sources: { [child.id]: root } }
		let region: OccupiedCell<C>[][] =
			Array<OccupiedCell<C>[]>(gridConfig.gridSize?.noRows ?? 1)
				.fill(Array<OccupiedCell<C>>(gridConfig.gridSize?.noCols ?? 1).fill(entry))

		// Put the top left back to just the element:
		region[0][0] = { elements: [child] };


		return region
	}

	private applySizesToSubgrids() {
		this.subgridChildren.forEach((sg) => {
			let width: number = sg.numColumns;
			let height: number = sg.numRows;

			let topLeft: { row: number, col: number } = sg.placementMode.config.coords;
			let bottomRight: { row: number, col: number } = { row: topLeft.row + height, col: topLeft.col + width };


			if (topLeft.col < 0 || bottomRight.col > this.numColumns ||
				topLeft.row < 0 || bottomRight.row > this.numRows
			) {
				throw new Error(`Subgrid '${sg.ref}' region out of parent grid '${this.ref}' bounds`)
			}

			let columns: Spacial[] = this.gridSizes.columns.slice(topLeft.col, bottomRight.col);
			let rows: Spacial[] = this.gridSizes.rows.slice(topLeft.row, bottomRight.row);

			let totalWidth = columns.reduce((w, c) => w + c.width, 0);
			let totalHeight = rows.reduce((h, r) => h + r.height, 0);

			rows.forEach((row) => {
				row.width = totalWidth
			})
			columns.forEach((col) => {
				col.height = totalHeight
			})

			sg.gridSizes.columns = columns;
			sg.gridSizes.rows = rows;

			sg.width = totalWidth;
			sg.height = totalHeight;

			// Set cells;
			let cellSubregion: Spacial[][] = this.getCellRegion(topLeft, bottomRight);
			sg.cells = cellSubregion;
		})
	}

	private applyPositionsToSubgrids() {
		this.subgridChildren.forEach((sg) => {
			let topLeft: { row: number, col: number } = sg.placementMode.config.coords;
			let topLeftCell: Spacial = this.cells[topLeft.row][topLeft.col];

			sg.x = topLeftCell.x;
			sg.y = topLeftCell.y;

			sg.computeCells();
		})
	}
	//#endregion
	// -----------------------------------------------


	// ---------------- Helpers ---------------------
	//#region 
	protected isCellArrayEmpty(target: GridCell<C>[]): boolean {
		return !target.some((c) => c !== undefined)
	}

	public doesCellHaveCellChildAt(coords: { row: number, col: number }): boolean {
		let cell: GridCell<C> = this.getCell(coords);

		if (cell === undefined) { return true }

		let empty: boolean = true;
		(cell.elements ?? []).forEach((el) => {
			if (this.isCellChild(el)) {
				empty = false
			} else if (this.isSubgridChild(el)) {
				empty = el.doesCellHaveCellChildAt(el.getRelativeCoord(coords));
			}
		})

		return empty;
	}

	public getGridElementsAtCell(coords: {row: number, col: number}): C[] {
		let elements: C[] = [];
		let cell: GridCell<C> = this.getCell(coords);

		(cell?.elements ?? []).forEach((el) => {
			if (this.isCellChild(el)) {
				elements.push(el)
			} else if (this.isSubgridChild(el)) {
				elements.push(...el.getGridElementsAtCell(el.getRelativeCoord(coords)));
			}
		})

		return elements;
	}

	protected numElementsOverArea(topLeft: { row: number, col: number }, size: { noRows: number, noCols: number }): number {
		let count: number = 0;
		let right: number = topLeft.col + size.noCols - 1;
		let bottom: number = topLeft.row + size.noRows - 1;

		for (let r = topLeft.row; r <= bottom; r++) {
			for (let c = topLeft.col; c <= right; c++) {
				let cell: GridCell<C> = this.gridMatrix[r][c];

				if (cell !== undefined && cell.sources === undefined) {
					count += 1;
				}
			}
		}

		return count;
	}

	protected isCellElementSource(child: GridElement<C>, cell: { row: number, col: number }): boolean {
		let targetCell: GridCell<C> = this.gridMatrix[cell.row][cell.col];

		if (targetCell?.elements === undefined) {
			return false
		}

		if (targetCell.elements.indexOf(child) === -1) {
			return false
		}

		if (targetCell.sources?.[child.id] !== undefined) {
			return false
		}

		return true;
	}

	private setCellUndefinedIfEmpty(coords: { row: number, col: number }) {
		let cell: GridCell<C> = this.getCell({ row: coords.row, col: coords.col })
		if (cell !== undefined && Object.values(cell).every(v => v === undefined)) {
			this.gridMatrix[coords.row][coords.col] = undefined
		}
	}

	private getCellRegion(topLeft: { row: number, col: number }, bottomRight: { row: number, col: number }): Spacial[][] {
		if (topLeft.row > bottomRight.row || topLeft.col > bottomRight.col) {
			throw new Error(`Invalid input topLeft: (${topLeft.row}, ${topLeft.col})-(${bottomRight.row}, ${bottomRight.col})`)
		}

		let cells: Spacial[][] = [];

		for (let r = topLeft.row; r <= bottomRight.row; r++) {
			let row: Spacial[] = this.cells[r];
			if (row === undefined) { continue }

			let rowSlice: Spacial[] = row.slice(topLeft.col, bottomRight.col);
			cells.push(rowSlice);
		}

		return cells;
	}

	public get allStructure(): Visual[] {
		let allStructureChildren: Visual[] = super.allStructure;

		for (let structure of allStructureChildren) {
			if (this.isSubgridChild(structure)) {
				allStructureChildren.push(...structure.allStructure)
			}
		}

		return allStructureChildren;
	}

	public isInGrid(coord: {row: number, col: number}): boolean {
		if ((-1 < coord.row) && (coord.row < this.numRows) && (-1 < coord.col) && (coord.col < this.numColumns)) {
			return true
		} else {
			return false
		}
	}
	//#endregion
	// -----------------------------------------------


	public positionElement(child: GridElement<C>, position: { row: number, col: number }) {
		let region: GridCell<C>[][] | undefined = this.getChildRegion(child, position);
		this.removeMatrix(child);

		if (region === undefined) {
			console.warn(`Error positioning child ${child.ref}`)
			return
		}

		this.appendElementsInRegion(region, position);
	}
}




export interface ISubgrid<C extends IVisual = IVisual> extends ICollection<C> {
	placementMode: { type: "subgrid", config: ISubgridConfig }
}

export class Subgrid<C extends Visual = Visual> extends Grid<C> implements ISubgrid {

	get state(): ISubgrid {
		return {
			...super.state,
			placementMode: this.placementMode
		};
	}

	protected declare _placementMode: { type: "subgrid", config: ISubgridConfig };
	public get placementMode() {
		return this._placementMode;
	}
	public set placementMode(value: { type: "subgrid", config: ISubgridConfig }) {
		this._placementMode = value;
	}

	constructor(params: ISubgrid) {
		super(params);
	}

	public getSubgridRegion(): OccupiedCell<C>[][] {
		// Be careful not to cause reference type linkage here. Causes problems ->
		let root: { row: number, col: number } = {...this.placementMode.config.coords};
		let numRows: number = this.numRows;
		let numCols: number = this.numColumns;

		let entry: OccupiedCell<C> = { elements: [this], sources: { [this.id]: root } }

		let region: OccupiedCell<C>[][] =
			Array.from({ length: numRows }, () => Array<OccupiedCell<C>>(numCols).fill(entry))


		// Put the top left back to just the element:
		region[0][0] = { elements: [this] };

		return region;
	}

	public getRelativeCoord(coords: { row: number, col: number }): { row: number, col: number } {
		return {
			row: coords.row - this.placementMode.config.coords.row,
			col: coords.col - this.placementMode.config.coords.col
		}
	}

	public getRelativeCol(col: number): number {
		return col - this.placementMode.config.coords.col;
	}

	public getRelativeRow(row: number): number {
		return row - this.placementMode.config.coords.row;
	}
}