import { Element, G } from "@svgdotjs/svg.js";
import Collection, { ICollection } from "./collection";
import { ID } from "./point";
import Spacial, { Dimensions, IGridConfig, PlacementConfiguration, SiteNames, Size } from "./spacial";
import Visual, { doesDraw, GridElement, IDraw, IVisual, PulseElement } from "./visual";


export interface IGrid<C extends IVisual = IVisual> extends ICollection<C> {
	minHeight?: number,
	minWidth?: number,

	numRows?: number,
	numColumns?: number
}

export type GridCell<T extends GridElement = GridElement> = OccupiedCell<T> | undefined

export type Elements<T> = T[];
type Sources = { [id: string]: { row: number; col: number } };
export type Ghost = { size: { width: number, height: number }, owner?: ID };
type Extra = { width: number, height: number };

export interface OccupiedCell<M extends GridElement = GridElement> {
	elements?: Elements<M>;  // The element if this is the “owning” cell
	sources?: Sources;  // If this cell is covered by another
	ghosts?: Ghost[];  // Provide spacing to a cell
	extra?: Extra;  // Applies additional width/height to the row/column
}

export type GridPlacementPredicate = (mode: PlacementConfiguration) => IGridConfig | undefined
export type GridPlacementSetter = (element: Visual, value: IGridConfig) => void


export default class Grid<C extends Visual = Visual> extends Collection<C> implements IDraw {
	static isGridElement = (e: Visual): e is GridElement => e.placementMode.type === "grid"

	get state(): IGrid {
		return {
			minHeight: this.min.height,
			minWidth: this.min.width,
			numRows: this.numRows,
			numColumns: this.numColumns,
			...super.state
		};
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

	protected gridMatrix: GridCell<GridElement>[][] = [];

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
		// First job is to compute the sizes of all children
		for (let child of this.children) {
			child.computeSize();
		}
		// super.computeSize()

		// Compute the size of the grid by finding the maximum width and height
		// element in each column and row, and then summing them up.

		var gridColumns: GridCell[][] = this.getColumns();
		var gridRows: GridCell[][] = this.gridMatrix;

		// Let's compute the width and height of each column
		var columnRects: Spacial[] = Array.from({ length: gridColumns.length }, () => new Spacial())
		gridColumns.forEach((col, i) => {
			var colEntries: GridCell[] = col.filter((cell) => cell !== undefined);

			// Find width of column
			var widths: number[] = [];
			var extras: number[] = [];
			for (let cell of colEntries) {

				if (cell?.ghosts !== undefined) {
					widths.push(...cell.ghosts.map((g) => g.size.width));
				}

				if (cell?.extra !== undefined) {
					extras.push(cell.extra.width);
				}

				if (cell?.elements !== undefined) {
					for (let child of cell.elements) {
						let placementMode: IGridConfig | undefined = child.placementMode.config;
						var contributing: boolean = true;

						// Manual contribution parameter
						if (placementMode !== undefined && placementMode.contribution !== undefined
							&& placementMode.contribution.x === false
						) { contributing = false; }

						// Grow elements do not provide size
						if (child.sizeMode.x === "grow"
						) { contributing = false; }

						// Compute partial width contribution (distribute evenly):
						let width: number = child.width;

						if (placementMode !== undefined && (placementMode.gridSize?.noCols ?? 0) > 1) {
							width = 0;
						}

						if (contributing === true) {
							widths.push(width)
						}
					}

				}
			}

			// Set the width of this column
			var maxWidth = Math.max(...widths, this.min.width);
			var paddedWidth = maxWidth += extras.reduce((e, v) => e + v, 0)
			columnRects[i].width = paddedWidth;

			// Compute the height of this column
			var colHeight = col.reduce((h, c) => {
				let dh = 0;
				if (c?.elements !== undefined) {
					dh = Math.max(...c.elements.map(e => e.height), ...(c.ghosts ?? []).map((g) => g.size.height));
				}
				return h + dh;
			}, 0);
			columnRects[i].height = colHeight
		})


		// Now lets compute the width and height of each row
		var rowRects: Spacial[] = Array.from({ length: gridRows.length }, () => new Spacial())
		gridRows.forEach((row, i) => {
			var rowEntries: OccupiedCell[] = row.filter((cell) => cell !== undefined);

			// Find height of the row
			var heights: number[] = [];
			var extras: number[] = [];
			for (let cell of rowEntries) {

				if (cell?.ghosts !== undefined) {
					heights.push(...cell?.ghosts.map(g => g.size.height));
				}

				if (cell?.extra !== undefined) {
					extras.push(cell.extra.height);
				}

				if (cell?.elements !== undefined) {
					for (let child of cell.elements) {
						let placementMode: IGridConfig | undefined = child.placementMode.config;
						let contributing: boolean = true;

						// Manual contribution parameter
						if (placementMode !== undefined && placementMode.contribution !== undefined
							&& placementMode.contribution.y === false
						) { contributing = false; }

						// Grow elements do not provide size
						if (child.sizeMode.y === "grow"
						) { contributing = false; }

						// Compute partial width contribution (distribute evenly):
						let height: number = child.height;

						if (placementMode !== undefined && (placementMode.gridSize?.noRows ?? 0) > 1) {
							height = 0;
						}

						if (contributing === true) {
							heights.push(height)
						}
					}

				}
			}

			// Set the width of this column
			var maxHeight = Math.max(...heights, this.min.height)
			var paddedHeight = maxHeight += extras.reduce((e, v) => e + v, 0)
			rowRects[i].height = paddedHeight;


			var rowWidth = row.reduce((w, c) => {
				let dw = 0;
				if (c !== undefined && c.elements !== undefined) {
					if (c?.elements !== undefined) {
						dw = Math.max(...c.elements.map(e => e.width), ...(c.ghosts ?? []).map((g) => g.size.width));
					}
				}
				return w + dw;
			}, 0);
			rowRects[i].width = rowWidth
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
		// super.computeSize();

		// ...so we can use padding
		return { width: this.width, height: this.height };
	}

	public computePositions(root: { x: number, y: number }): void {
		this.x = root.x;
		this.y = root.y;

		// Find dimension and positions of the cells.
		this.computeCells();

		// Update positions of columns and rows
		this.gridSizes.columns.forEach((col, i) => {
			col.x = this.cells[0][i].x;
			col.y = this.cells[0][0].y;
		})

		this.gridSizes.rows.forEach((row, i) => {
			row.y = this.cells[i][0].y;
			row.x = this.cells[0][0].x;
		})

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
	 * Computes the positions and dimensions of cells in a grid layout.
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
					x: this.cx + xCount,
					y: this.cy + yCount,
					ref: "grid-cell",
					type: "lower-abstract"
				})

				xCount += colWidth;
			}

			yCount += rowHeight;
		}
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
	//#endregion
	// -------------------------------------------------

	// ---------------- Draw Methods ----------------
	//#region 

	//#endregion
	// -------------------------------------------------

	// ---------------- Add Methods ----------------
	//#region
	public override add(child: C) {
		super.add(child);

		if (Grid.isGridElement(child)) {
			this.addElement(child);
		}
	}

	public appendElementsInRegion(gridRegion: GridCell[][], coords?: { row: number, col: number }) {
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

		this.setMatrixSize({ row: bottomRow, col: rightCol }, true);

		for (let r = 0; r < noRows; r++) {
			for (let c = 0; c < noCols; c++) {
				let row: number = r + topRow;
				let col: number = c + leftCol;

				let toAppend: GridCell = gridRegion[r][c];

				this.appendCellAtCoord(toAppend, { row: row, col: col });
			}
		}
	}

	private addElement(child: GridElement) {

		let insertCoords: { row: number, col: number } | undefined = child.placementMode.config.coords;
		if (insertCoords === undefined) {
			throw new Error(`Adding grid child ${child.ref} with unspecified coords`)
		}

		var region: OccupiedCell[][] | undefined = this.getElementGridRegion(child, { row: insertCoords.row, col: insertCoords.col });

		if (region === undefined) {
			throw new Error(`Could not construct cell region for element ${child.ref}`)
		}

		this.appendElementsInRegion(region, { row: insertCoords.row, col: insertCoords.col })
	}

	public addElementAtCoord(child: GridElement, coords: { row: number, col: number }) {
		var insertCoords: { row: number, col: number } = coords;

		child.placementMode.config.coords = insertCoords;

		this.addElement(child);
	}

	public appendCellAtCoord(cell: GridCell, coords: { row: number, col: number }) {
		if (Object.keys(cell ?? {}).length === 0) { return }

		this.setMatrixSize(coords, true);

		let targetGridCell: GridCell = this.gridMatrix[coords.row][coords.col];

		if (targetGridCell === undefined) {
			targetGridCell = {};
		}

		let currElements: GridElement[] | undefined = targetGridCell.elements ?? [];
		let currSources: { [index: number]: { row: number; col: number } } | undefined = targetGridCell.sources ?? {};
		let currGhosts: Ghost[] | undefined = targetGridCell.ghosts ?? [];

		currElements.push(...(cell?.elements ?? []))
		if (currElements.length === 0) { currElements = undefined }
		else {
			for (let child of currElements) {
				// Don't change child coord with coord of source cells
				if (cell?.sources?.[child.id] === undefined) {
					child.placementMode.config.coords = coords;
				}

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

		let finalCell: GridCell = {
			elements: currElements,
			sources: currSources,
			ghosts: currGhosts,
			extra: extra
		}

		this.gridMatrix[coords.row][coords.col] = finalCell;
	}

	public setMatrixAtCoord(gridEntry: GridCell, coords: { row: number, column: number }) {
		this.gridMatrix[coords.row][coords.column] = gridEntry;
	}

	public setGrid(grid: GridCell[][], sizes: { columns: Spacial[], rows: Spacial[] }, cells: Spacial[][]) {
		this.gridMatrix = grid;
		this.gridSizes = sizes;
		this.cells = cells;
	}

	public setMatrix(matrix: GridCell[][]) {
		this.gridMatrix = matrix;
	}

	public setMatrixRegion(gridRegion: GridCell[][], coords?: { row: number, col: number }) {
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


		this.setMatrixSize({ row: bottomRow, col: rightCol }, true);

		for (let r = 0; r < noRows; r++) {
			for (let c = 0; c < noCols; c++) {
				let row: number = r + topRow;
				let col: number = c + leftCol;

				this.gridMatrix[row][col] = gridRegion[r][c]
			}
		}
	}
	//#endregion
	// -------------------------------------------------

	// ---------------- Remove Methods ----------------
	//#region 
	public remove(child: C, deleteIfEmpty?: { row: boolean, col: boolean }) {
		super.remove(child)

		if (Grid.isGridElement(child)) {
			this.removeMatrix(child, deleteIfEmpty)
		}
	}

	private removeMatrix(child: GridElement, deleteIfEmpty?: { row: boolean, col: boolean }) {
		// First we need to locate this child in the matrix:
		var topLeft: { row: number, col: number } | undefined = this.locateElement(child);
		let bottomRight: { row: number, col: number } | undefined = this.getElementBottomRight(child);
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

				// Remove owned ghosts
				if (cell.ghosts !== undefined) {
					cell.ghosts = cell.ghosts.filter(g => g.owner !== child.id)
				}
				if (cell.ghosts?.length === 0) { cell.ghosts = undefined };

				// Set cell to undefined
				if (Object.values(cell).every(v => v === undefined)) {
					this.gridMatrix[row][col] = undefined
				}

				// Remove row/column
				if (deleteIfEmpty?.row === true) {
					this.removeRow(row, true)
				}

				if (deleteIfEmpty?.col === true) {
					this.removeColumn(col, true)
				}
			}
		}

		// Clean up ghosts:
		// Ghosts can be placed by an element outside of it's region, hence we use the 
		// owned ghosts properties to clear these up.
		let gridConfig: IGridConfig = child.placementMode.config;
		(gridConfig?.ownedGhosts ?? []).forEach((ownedGhost) => {
			let cell: GridCell = this.getCell({ row: ownedGhost.row, col: ownedGhost.col });

			if (cell?.ghosts !== undefined) {
				cell.ghosts = cell.ghosts.filter((ghost) => ghost.owner !== child.id)
				if (cell.ghosts.length === 0) {
					cell.ghosts = undefined;
				}
				this.setCellUndefinedIfEmpty({ row: ownedGhost.row, col: ownedGhost.col })
			}
		})
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
	public setMatrixSize(coords: { row?: number, col?: number }, onlyGrow: boolean = false) {
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
		var trailingRow: GridCell[] = this.getRow(this.numRows - 1)
		var trailingColumn: GridCell[] = this.getColumn(this.numColumns - 1)

		var trailingRowEmpty: boolean = this.isArrayEmpty(trailingRow);
		var trailingColumnEmpty: boolean = this.isArrayEmpty(trailingColumn);

		while (trailingRowEmpty === true) {
			this.removeRow();
			var trailingRow: GridCell[] = this.getRow(this.numRows - 1);
			var trailingRowEmpty: boolean = this.isArrayEmpty(trailingRow);
		}

		while (trailingColumnEmpty === true) {
			this.removeColumn();
			var trailingColumn: GridCell[] = this.getColumn(this.numColumns - 1);
			var trailingColumnEmpty: boolean = this.isArrayEmpty(trailingColumn);
		}
	}

	protected insertEmptyColumn(index?: number) {
		let newColumn: GridCell[] = Array<GridCell>(this.numRows).fill(undefined);
		let INDEX: number | undefined = index;
		if (INDEX === undefined || INDEX < 0 || INDEX > this.numColumns) {
			INDEX = this.numColumns;
		}

		// Grow split elements by 1 in columns
		let splitElements: GridElement[][] = this.getColumnSplitElements(INDEX);
		splitElements.forEach((row, row_index) => {
			for (let element of row) {
				let gridConfig: IGridConfig = element.placementMode.config;

				if (gridConfig.gridSize !== undefined) {
					// Grow
					gridConfig.gridSize.noCols += 1;

					// Add this element so that it spans over the gap
					if (newColumn[row_index]?.sources === undefined) {
						newColumn[row_index] = { sources: { [element.id]: gridConfig.coords ?? { row: 0, col: 0 } } }
					} else {
						newColumn[row_index].sources[element.id] = gridConfig.coords ?? { row: 0, col: 0 }
					}


					if (newColumn[row_index]?.elements === undefined) {
						newColumn[row_index].elements = [element]
					} else {
						newColumn[row_index].elements.push(element)
					}
				}
			}
		})

		for (let i = 0; i < this.numRows; i++) {
			this.gridMatrix[i].splice(INDEX, 0, newColumn[i]);
		}

		this.shiftElementColumnIndexes(INDEX, 1);
	}

	protected insertEmptyRow(index?: number): void {
		var newRow: GridCell[] = Array<GridCell>(this.numColumns).fill(undefined)
		let INDEX: number | undefined = index;
		if (INDEX === undefined || INDEX < 0 || INDEX > this.numRows) {
			INDEX = this.numRows;
		}

		// Grow split elements by 1 in columns
		let splitElements: GridElement[][] = this.getRowSplitElements(INDEX);
		splitElements.forEach((col, col_index) => {
			for (let element of col) {
				let gridConfig: IGridConfig = element.placementMode.config;

				if (gridConfig.gridSize !== undefined) {
					// Grow
					gridConfig.gridSize.noRows += 1;

					// Add this element so that it spans over the gap
					if (newRow[col_index]?.sources === undefined) {
						newRow[col_index] = { sources: { [element.id]: gridConfig.coords ?? { row: 0, col: 0 } } }
					} else {
						newRow[col_index].sources[element.id] = gridConfig.coords ?? { row: 0, col: 0 }
					}


					if (newRow[col_index]?.elements === undefined) {
						newRow[col_index].elements = [element]
					} else {
						newRow[col_index].elements.push(element)
					}
				}
			}
		})

		this.gridMatrix.splice(INDEX, 0, newRow);

		this.shiftElementRowIndexes(INDEX, 1);
	}

	public removeColumn(index?: number, remove: true | false | "if-empty" = false) {
		if (index === undefined || index < 0 || index > this.numColumns - 1) {
			var INDEX = this.numColumns - 1;
		} else {
			INDEX = index;
		}

		var targetColumn: GridCell[] = this.getColumn(INDEX);
		var empty: boolean = this.isArrayEmpty(targetColumn)

		if (remove === false) {return}
		if (remove === "if-empty"  && empty === false) { return }

		for (let i = 0; i < this.numRows; i++) {
			this.gridMatrix[i].splice(INDEX, 1);
		}

		this.shiftElementColumnIndexes(INDEX, -1);
	}

	public removeRow(index?: number, onlyIfEmpty: boolean = false) {
		if (index === undefined || index < 0 || index > this.numRows - 1) {
			var INDEX = this.numRows - 1;
		} else {
			INDEX = index;
		}

		var targetRow: GridCell[] = this.gridMatrix[INDEX];
		var empty: boolean = this.isArrayEmpty(targetRow)

		if (onlyIfEmpty === true && !empty) { return }

		this.gridMatrix.splice(INDEX, 1);

		this.shiftElementRowIndexes(INDEX, -1);
	}

	// --- Helpers ----
	protected getColumnSplitElements(index: number): GridElement[][] {
		if (index > this.numColumns || index < 0) {
			throw new Error(`Index ${index} is out of bounds`)
		}

		// Get elements which have a part on the left and right of the index (insertion index)
		var elements: GridElement[][] = Array.from({ length: this.numRows }, () => []);

		this.getRows().forEach((row, row_index) => {
			let leftCell: GridCell = row[index - 1];
			let rightCell: GridCell = row[index];

			for (let child of (leftCell?.elements ?? [])) {
				let childIndex: number = (rightCell?.elements ?? []).indexOf(child);

				if (childIndex !== -1) {
					elements[row_index].push(child)
				}
			}
		})

		return elements;
	}

	protected getRowSplitElements(index: number): GridElement[][] {
		if (index > this.numRows || index < 0) {
			throw new Error(`Index ${index} is out of bounds`)
		}

		// Get elements which have a part on the left and right of the index (insertion index)
		var elements: GridElement[][] = Array.from({ length: this.numColumns }, () => []);

		this.getColumns().forEach((col, col_index) => {
			let leftCell: GridCell = col[index - 1];
			let rightCell: GridCell = col[index];

			for (let child of (leftCell?.elements ?? [])) {
				let childIndex: number = (rightCell?.elements ?? []).indexOf(child);

				if (childIndex !== -1) {
					elements[col_index].push(child);
				}
			}
		})

		return elements;
	}

	protected shiftElementColumnIndexes(from: number, amount: number = 1) {
		// Update grid indexes
		for (let col_index = from; col_index < this.numColumns; col_index++) {
			let col = this.getColumn(col_index);

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
			let row = this.getRow(row_index);

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
	public getColumns(): GridCell[][] {
		if (this.gridMatrix.length === 0 || this.gridMatrix[0].length === 0) {
			return [];
		}

		const numCols = this.gridMatrix[0].length;
		const columns: GridCell[][] = [];

		for (let col = 0; col < numCols; col++) {
			const column: GridCell[] = this.gridMatrix.map(row => row[col]);
			columns.push(column);
		}

		return columns;
	}

	public getColumn(index: number): GridCell[] {
		return this.gridMatrix.map((row) => row[index]);
	}

	public getRows(): GridCell[][] {
		return this.gridMatrix;
	}

	public getRow(index: number): GridCell[] {
		return this.gridMatrix[index];
	}

	public getCell(coords: { row: number, col: number }): GridCell {
		return this.gridMatrix[coords.row]?.[coords.col];
	}

	public getCells(): Spacial[] {
		return this.cells.flat();
	}

	protected locateElement(target: GridElement): { row: number, col: number } | undefined {
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

	public getElementBottomRight(child: GridElement): { row: number, col: number } | undefined {
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

	public getMatrixInRegion(topLeft: { row: number, col: number }, bottomRight: { row: number, col: number }): GridCell[] {
		// Check valid input:
		if (topLeft.row < bottomRight.row || topLeft.col < bottomRight.col) {
			return []
		}

		let result: GridCell[] = [];

		for (let r = topLeft.row; r <= bottomRight.row; r++) {
			for (let c = topLeft.col; c <= bottomRight.col; c++) {
				result.push(this.gridMatrix[r][c]);
			}
		}

		return result;
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
	//#endregion
	// -----------------------------------------------


	// -------------- Child sizing -------------------
	//#region 
	public setElementSize(child: GridElement, size: { noRows: number, noCols: number }) {
		let location: { row: number, col: number } | undefined = this.locateElement(child)

		if (location === undefined) {
			console.warn(`Cannot locate child for size change ${child.ref}`)
			return
		}

		if (Grid.isGridElement(child)) {
			child.placementMode.config.gridSize = { noRows: size.noRows, noCols: size.noCols }
		}

		let region: OccupiedCell[][] | undefined = this.getElementGridRegion(child);
		if (region === undefined) {
			return
		}

		this.removeMatrix(child);
		this.appendElementsInRegion(region, location);
	}

	protected getElementGridRegion(element: GridElement, overridePosition?: { row: number, col: number }): OccupiedCell[][] | undefined {
		let gridConfig: IGridConfig = element.placementMode.config;

		let topLeft: { row: number, col: number } | undefined = gridConfig.coords;
		if (topLeft === undefined) {
			console.warn(`Cannot locate child ${element.ref} in grid object ${this.ref}`)
			return
		}

		let bottomRight: { row: number, col: number } = {
			row: topLeft.row + (gridConfig.gridSize?.noRows ?? 1) - 1,
			col: topLeft.col + (gridConfig.gridSize?.noCols ?? 1) - 1
		};


		let root: { row: number, col: number } = overridePosition ?? topLeft
		gridConfig.coords = root;

		// Construct region
		let entry: OccupiedCell = { elements: [element], sources: { [element.id]: root } }
		let region: OccupiedCell[][] =
			Array<OccupiedCell[]>(gridConfig.gridSize?.noRows ?? 1)
				.fill(Array<OccupiedCell>(gridConfig.gridSize?.noCols ?? 1).fill(entry))

		// Put the top left back to just the element:
		region[0][0] = { elements: [element] };


		return region
	}
	//#endregion
	// -----------------------------------------------


	// ---------------- Helpers ---------------------
	//#region 
	protected isArrayEmpty(target: GridCell[]): boolean {
		return !target.some((c) => c !== undefined)
	}

	protected isCellEmptyAt(coords: { row: number, col: number }): boolean {
		let cellRow: GridCell[] = this.gridMatrix[coords.row];
		if (cellRow === undefined) { return true }

		let cell: GridCell = cellRow[coords.col];

		if (cell === undefined) {
			return true
		}

		return false
	}

	protected numElementsOverArea(topLeft: { row: number, col: number }, size: { noRows: number, noCols: number }): number {
		let count: number = 0;
		let right: number = topLeft.col + size.noCols - 1;
		let bottom: number = topLeft.row + size.noRows - 1;

		for (let r = topLeft.row; r <= bottom; r++) {
			for (let c = topLeft.col; c <= right; c++) {
				let cell: GridCell = this.gridMatrix[r][c];

				if (cell !== undefined && cell.sources === undefined) {
					count += 1;
				}
			}
		}

		return count;
	}

	protected isCellElementSource(child: GridElement, cell: { row: number, col: number }): boolean {
		let targetCell: GridCell = this.gridMatrix[cell.row][cell.col];

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
		let cell: GridCell = this.getCell({ row: coords.row, col: coords.col })
		if (cell !== undefined && Object.values(cell).every(v => v === undefined)) {
			this.gridMatrix[coords.row][coords.col] = undefined
		}
	}
	//#endregion
	// -----------------------------------------------


	public positionElement(child: GridElement, position: { row: number, col: number }) {
		let region: GridCell[][] | undefined = this.getElementGridRegion(child, position);
		this.removeMatrix(child);

		if (region === undefined) {
			console.warn(`Error positioning child ${child.ref}`)
			return
		}

		this.appendElementsInRegion(region, position);
	}
}