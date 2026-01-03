import { Element, G } from "@svgdotjs/svg.js";
import Collection, { ICollection } from "./collection";
import { ID } from "./point";
import Spacial, { Dimensions, IGridChildConfig, PlacementConfiguration, SiteNames, Size } from "./spacial";
import Visual, { doesDraw, IDraw } from "./visual";


export interface IGrid extends ICollection {
	minHeight?: number,
	minWidth?: number,

	numRows?: number,
	numColumns?: number
}

export type GridCell<T extends Visual=Visual> = OccupiedCell<T> | undefined

type Elements<T> = T[];
type Sources = {[id: string]: { row: number; col: number }};
export type Ghost = {size: {width: number, height: number}, owner?: ID};
type Extra = {width: number, height: number};

interface OccupiedCell<T> {
  elements?: Elements<T>;  // The element if this is the “owning” cell
  sources?: Sources;  // If this cell is covered by another
  ghosts?: Ghost[];  // Provide spacing to a cell
  extra?: Extra;  // Applies additional width/height to the row/column
}

export type GridPlacementPredicate = (mode: PlacementConfiguration) => IGridChildConfig | undefined
const IdentityPredicate: GridPlacementPredicate = (v) => v.type === "grid" ? v.gridConfig : undefined;


export default class Grid<T extends Visual = Visual> extends Collection implements IDraw {
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
	override get children(): T[] {
		var allChildren: T[] = [];
		
		this.gridMatrix.forEach((row) => {
			row.forEach((cell) => {
				if (cell?.elements !== undefined) {
					cell.elements.forEach((child) => {
						if (cell.sources?.[child.id] === undefined) {
							allChildren.push(child);
						}
					})
				}
			})
		})

		return allChildren;
	}

	private min: {width: number, height: number};

	// Truth
	public gridMatrix: GridCell<T>[][] = [];
	//
	
	public gridSizes: {columns: Spacial[], rows: Spacial[]} = {columns: [], rows: []};
	cells: Spacial[][];

	constructor(params: IGrid) {
		super(params);

		this.cells = [];

		this.min = {width: params.minWidth ?? 0, height: params.minHeight ?? 0};
	}


	public draw(surface: Element) {
		if (this.svg) {
			this.svg.remove();
		}

		var group = new G().id(this.id).attr({title: this.ref});
		group.attr({
			transform: `translate(${this.offset[0]}, ${this.offset[1]})`
		});

		this.svg = group;

		surface.add(this.svg);

		this.children.forEach((uc) => {
			if (doesDraw(uc) ) {
				uc.draw(this.svg!);
			}
		});
	}

	public override computeSize(placementPredicate: GridPlacementPredicate=IdentityPredicate): Size {
		// First job is to compute the sizes of all children
		for (let child of this.children) {
			child.computeSize();
		}
		super.computeSize()

		// Compute the size of the grid by finding the maximum width and height
		// element in each column and row, and then summing them up.

		var gridColumns: GridCell<T>[][] = this.getColumns();
		var gridRows: GridCell<T>[][] = this.gridMatrix;

		// Let's compute the width and height of each column
		var columnRects: Spacial[] = Array.from({length: gridColumns.length}, () => new Spacial())
		gridColumns.forEach((col, i) => {
			var colEntries: GridCell<T>[] = col.filter((cell) => cell !== undefined);
			
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
						let placementMode: IGridChildConfig | undefined = placementPredicate(child.placementMode);
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
		var rowRects: Spacial[] = Array.from({length: gridRows.length}, () => new Spacial())
		gridRows.forEach((row, i) => {
			var rowEntries: GridCell<T>[] = row.filter((cell) => cell !== undefined);
			
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
						let placementMode: IGridChildConfig | undefined = placementPredicate(child.placementMode);
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
		return {width: this.width, height: this.height};
	}

	public computePositions(root: {x: number, y: number}, placementPredicate: GridPlacementPredicate=IdentityPredicate): void {
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
						if (cell.sources?.[element.id] !== undefined) {
							continue
						}

						let gridConfig: IGridChildConfig | undefined = placementPredicate(element.placementMode);
						if (gridConfig === undefined) {
							gridConfig = {
								coords: {row: row_index, col: column_index},
								alignment: {x: "here", y: "here"},
								gridSize: {noRows: 1, noCols: 1}
							}
						}

						if (element.ref === "BAR") {
							console.log()
						}

						var alignment: {x: SiteNames, y: SiteNames} = gridConfig.alignment ?? {x: "here", y: "here"}

						cellRect.internalImmediateBind(element, "x", alignment.x)
						cellRect.internalImmediateBind(element, "y", alignment.y)

						element.computePositions({x: element.x, y: element.y});
					}

				}
			})
		})
	}

	public growElement(containerSize: Size): Record<Dimensions, number> {
		let change = super.growElement(containerSize);

		this.gridMatrix.forEach((row, row_index) => {
			row.forEach((cell, column_index) => {
				if (cell?.elements !== undefined && cell.sources === undefined) {
					let cellRect: Spacial = this.cells[row_index][column_index];
					
					for (let child of cell.elements) {
						let childBottomRight: {row: number, col: number} | undefined = this.getChildBottomRight(child);

						// Create a rect union if the child is in multiple cells
						if (childBottomRight !== undefined && (childBottomRight?.col !== column_index || childBottomRight?.row !== row_index)) {
							cellRect = this.getMultiCellRect({row: row_index, col: column_index}, childBottomRight);
						}

						child.growElement(cellRect.size);
					}

				}
			})
		})

		return change;
	}

	public addChildAtCoord(child: T, row: number, column?: number) {
		if (column === undefined) {
			column = this.getFirstAvailableCell().col;
		}
		var insertCoords: {row: number, col: number} = {row: row, col: column};

		let cell: GridCell<T> = {elements: [child]}

		this.appendCellAtCoord(cell, {row: insertCoords.row, col: insertCoords.col});
	}

	public appendCellAtCoord(cell: GridCell<T>, coords: {row: number, col: number}) {
		if (Object.keys(cell ?? {}).length === 0) {return}
		
		this.setMatrixSize(coords, true);

		let targetGridCell: GridCell<T> = this.gridMatrix[coords.row][coords.col];

		if (targetGridCell === undefined) {
			targetGridCell = {};
		}
		
		let currElements: T[] | undefined = targetGridCell.elements ?? [];
		let currSources: {[index: number]: { row: number; col: number }} | undefined = targetGridCell.sources ?? {};
		let currGhosts: Ghost | undefined = targetGridCell.ghosts ?? [];
		
		currElements.push(...(cell?.elements ?? []))
		if (currElements.length === 0) {currElements = undefined} 
		else {
			for (let child of currElements) {
				// Don't change child coord with coord of source cells
				if (child.placementMode.type === "grid" && cell?.sources?.[child.id] === undefined) {
					child.placementMode.gridConfig.coords = coords;
				}

				if (child.parentId === undefined) {
					child.parentId = this.id;
				}
			}
		}

		Object.assign(currSources, cell?.sources ?? {})
		if (Object.keys(currSources).length === 0) {currSources = undefined}

		currGhosts.push(...(cell?.ghosts ?? []))
		if (currGhosts.length === 0) {currGhosts = undefined}

  		let extra: {width: number, height: number} | undefined = cell?.extra;

		let finalCell: GridCell<T> = {
			elements: currElements,
			sources: currSources,
			ghosts: currGhosts,
			extra: extra
		}

		this.gridMatrix[coords.row][coords.col] = finalCell;
	}

	public setMatrixAtCoord(gridEntry: GridCell<T>, coords: {row: number, column: number}) {
		this.gridMatrix[coords.row][coords.column] = gridEntry;
	}

	public remove(child: T, deleteIfEmpty?: {row: boolean, col: boolean}) {
		// First we need to locate this child in the matrix:
		var topLeft: {row: number, col: number} | undefined = this.locateGridChild(child);
		let bottomRight: {row: number, col: number} | undefined = this.getChildBottomRight(child);
		if (topLeft === undefined || bottomRight === undefined) {
			console.warn(`Cannot locate child ${child.ref} in grid object ${this.ref}`)
			return
		}

		let id: ID = child.id;
		let numRows: number = bottomRight.row - topLeft.row + 1;
		let numCols: number = bottomRight.col - topLeft.col + 1;

		for (let r=0; r<numRows; r++) {
			for (let c=0; c<numCols; c++) {
				let row = r + topLeft.row;
				let col = c + topLeft.col;

				let cell = this.gridMatrix[row][col]
				if (cell?.elements === undefined) {
					console.warn(`Erroneous form for element ${child.ref}`)
					continue
				}
				
				let elementIndex: number = cell.elements.indexOf(child);

				if (elementIndex === -1) {
					console.warn(`Erroneous form for element ${child.ref}`)
					continue
				}

				cell.elements.splice(elementIndex, 1);

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
				if (cell.ghosts?.length === 0) {cell.ghosts = undefined};

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

		
	}

	public deleteCellAtCoord(coords: {row: number, col: number}, deleteIfEmpty?: {row: boolean, col: boolean}) {
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

	public getColumns(): GridCell<T>[][] {
		if (this.gridMatrix.length === 0 || this.gridMatrix[0].length === 0) {
			return [];
		}

		const numCols = this.gridMatrix[0].length;
		const columns: GridCell<T>[][] = [];

		for (let col = 0; col < numCols; col++) {
			const column: GridCell<T>[] = this.gridMatrix.map(row => row[col]);
			columns.push(column);
		}

		return columns;
	}
	public getColumn(index: number): GridCell[] {
		return this.gridMatrix.map((row) => row[index]);
	}

	public getRows(): GridCell<T>[][] {
		return this.gridMatrix;
	}
	public getRow(index: number): GridCell[] {
		return this.gridMatrix[index];
	}

	public getCells(): Spacial[] {
		return this.cells.flat();
	}

	public setGrid(grid: GridCell<T>[][], sizes: {columns: Spacial[], rows: Spacial[]}, cells: Spacial[][]) {
		this.gridMatrix = grid;
		this.gridSizes = sizes;
		this.cells = cells;
	}

	public setMatrix(matrix: GridCell<T>[][]) {
		this.gridMatrix = matrix;
	}

	public setMatrixRegion(gridRegion: GridCell<T>[][], coords?: {row: number, col: number}) {
		if (gridRegion.length === 0 || gridRegion[0].length === 0) {return}
		if (coords === undefined) {
			coords = {row: 0, col: 0}
		}

		let noRows: number = gridRegion.length;
		let noCols: number = gridRegion[0].length;

		let leftCol: number = coords.col;
		let rightCol: number = coords.col + noCols-1;
		
		let topRow: number = coords.row;
		let bottomRow: number = coords.row + noRows-1;


		this.setMatrixSize({row: bottomRow, col: rightCol}, true);

		for (let r = 0; r<noRows; r++) {
			for (let c = 0; c<noCols; c++) {
				let row: number = r + topRow;
				let col: number = c + leftCol;

				this.gridMatrix[row][col] = gridRegion[r][c]
			}
		}
	}

	public appendElementsInRegion(gridRegion: GridCell<T>[][], coords?: {row: number, col: number}) {
		if (gridRegion.length === 0 || gridRegion[0].length === 0) {return}
		if (coords === undefined) {
			coords = {row: 0, col: 0}
		}

		let noRows: number = gridRegion.length;
		let noCols: number = gridRegion[0].length;

		let leftCol: number = coords.col;
		let rightCol: number = coords.col + noCols-1;
		
		let topRow: number = coords.row;
		let bottomRow: number = coords.row + noRows-1;

		this.setMatrixSize({row: bottomRow, col: rightCol}, true);

		for (let r = 0; r<noRows; r++) {
			for (let c = 0; c<noCols; c++) {
				let row: number = r + topRow;
				let col: number = c + leftCol;
				
				let toAppend: GridCell<T> = gridRegion[r][c];

				this.appendCellAtCoord(toAppend, {row: row, col: col});
			}
		}
	}

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

	protected locateGridChild(target: T): {row: number, col: number} | undefined {
		var coords: {row: number, col: number} | undefined = undefined;

		this.gridMatrix.forEach((row, row_index) => {
			row.forEach((cell, column_index) => {
				if (cell?.elements !== undefined) {
					
					cell.elements.forEach((child, child_index) => {
						if (child.id === target.id && coords === undefined) {
							coords = {row: row_index, col: column_index}
						}
					})

					
				}
			})
		})

		return coords;
	}

	protected getFirstAvailableCell(): {row: number, col: number} {
		var coords: {row: number, col: number} | undefined = undefined; 
		for (let row=0; row < this.numRows; row++) {
			for (let col=0; col<this.numColumns; col++) {
				if (this.gridMatrix[row][col] === undefined) {
					coords = {row: row, col: col}
				}
			}
		}

		// If there is nowhere to insert this child, create a new row and put it there
		if (coords === undefined) {
			this.insertEmptyRow();
			coords = {row: this.numRows, col: 0}
		}

		return coords;
	}

	public getChildBottomRight(child: T): {row: number, col: number} | undefined {
		let location: {row: number, col: number} | undefined = this.locateGridChild(child);

		if (location === undefined) {return undefined}

		let right: number = location.col;
		let bottom: number = location.row;

		// Move right:
		while (this.gridMatrix[location.row][right+1] !== undefined && 
			this.gridMatrix[location.row][right+1]?.elements?.some(el => el.id === child.id)) {
			right += 1
		}

		// Move down:
		while (this.gridMatrix[bottom+1] !== undefined && 
			this.gridMatrix[bottom+1][location.col]?.elements?.some(el => el.id === child.id)) {
			bottom += 1
		}
		
		return {row: bottom, col: right}
	}

	public getMatrixInRegion(topLeft: {row: number, col: number}, bottomRight: {row: number, col: number}): GridCell<T>[] {
		// Check valid input:
		if (topLeft.row < bottomRight.row || topLeft.col < bottomRight.col) {
			return []
		}

		let result: GridCell<T>[] = [];

		for (let r = topLeft.row; r<=bottomRight.row; r++) {
			for (let c=topLeft.col; c<=bottomRight.col; c++) {
				result.push(this.gridMatrix[r][c]);
			}
		}

		return result;
	}

	public getCellsInRegion(topLeft: {row: number, col: number}, bottomRight: {row: number, col: number}): Spacial[] {
		// Check valid input:
		if (topLeft.row > bottomRight.row || topLeft.col > bottomRight.col) {
			return []
		}

		let result: Spacial[] = [];

		for (let r = topLeft.row; r<=bottomRight.row; r++) {
			if (this.cells[r] === undefined) {continue}
			for (let c=topLeft.col; c<=bottomRight.col; c++) {
				if (this.cells[r][c] === undefined) {continue}
				result.push(this.cells[r][c]);
			}
		}

		return result;
	}

	public getMultiCellRect(topLeft: {row: number, col: number}, bottomRight: {row: number, col: number}): Spacial {
		// Select

		if (topLeft.row > bottomRight.row || topLeft.col > bottomRight.col) {
			throw new Error(`Erroneous coordinate input topLeft: {row: ${topLeft.row}, col: ${topLeft.col}}, bottomRight: {row: ${bottomRight.row}, col: ${bottomRight.col}}`)
		}

		let cells: Spacial[] = this.getCellsInRegion(topLeft, bottomRight);

		let width: number = cells.reduce((w, c) => w + c.width, 0);
		let height: number = cells.reduce((h, c) => h + c.height, 0);

		return new Spacial(0, 0, width, height);
	}

	protected isArrayEmpty(target: GridCell[]): boolean {
		return !target.some((c) => c !== undefined)
	}

	protected isCellEmptyAt(coords: {row: number, col: number}): boolean {
		let cellRow: GridCell<T>[] = this.gridMatrix[coords.row];
		if (cellRow === undefined) {return true}
		
		let cell: GridCell<T> = cellRow[coords.col];

		if (cell === undefined) {
			return true
		}

		return false
	}

	protected numChildrenOverArea(topLeft: {row: number, col: number}, size: {noRows: number, noCols: number}): number {
		let count: number = 0;
		let right: number = topLeft.col + size.noCols-1;
		let bottom: number = topLeft.row + size.noRows-1;

		for (let r = topLeft.row; r<=bottom; r++) {
			for (let c = topLeft.col; c<=right; c++) {
				let cell: GridCell<T> = this.gridMatrix[r][c];
				
				if (cell !== undefined && cell.sources === undefined) {
					count += 1;
				}
			}
		}

		return count;
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
	public setMatrixSize(coords: {row?: number, col?: number}, onlyGrow: boolean=false) {
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
		var trailingRow: GridCell[] = this.getRow(this.numRows-1)
		var trailingColumn: GridCell[] = this.getColumn(this.numColumns-1)
		
		var trailingRowEmpty: boolean = this.isArrayEmpty(trailingRow);
		var trailingColumnEmpty: boolean = this.isArrayEmpty(trailingColumn);

		while (trailingRowEmpty === true) {
			this.removeRow();
			var trailingRow: GridCell[] = this.getRow(this.numRows-1);
			var trailingRowEmpty: boolean = this.isArrayEmpty(trailingRow);
		}

		while (trailingColumnEmpty === true) {
			this.removeColumn();
			var trailingColumn: GridCell[] = this.getColumn(this.numColumns-1);
			var trailingColumnEmpty: boolean = this.isArrayEmpty(trailingColumn);
		}
	}

	protected insertEmptyColumn(index?: number) {
		let newColumn: GridCell<T>[] = Array<GridCell<T>>(this.numRows).fill(undefined);
		let INDEX: number | undefined = index; 
		if (INDEX === undefined || INDEX < 0 || INDEX > this.numColumns) {
			INDEX = this.numColumns;
		}

		for (let i = 0; i < this.numRows; i++) {
      		this.gridMatrix[i].splice(INDEX, 0, newColumn[i]);
    	}

		this.shiftElementColumnIndexes(INDEX, 1)
	}
	protected insertEmptyRow(index?: number): void {
		var newRow: GridCell<T>[] = Array<GridCell<T>>(this.numColumns).fill(undefined)
		let INDEX: number | undefined = index;
		if (INDEX === undefined || INDEX < 0 || INDEX > this.numRows) {
			INDEX = this.numRows;
		}

		this.gridMatrix.splice(INDEX, 0, newRow);

		this.shiftElementRowIndexes(INDEX, 1);
  	}

	public removeColumn(index?: number, onlyIfEmpty: boolean=false) {
		if (index === undefined || index < 0 || index > this.numColumns-1) {
			var INDEX = this.numColumns - 1;
		} else {
			INDEX = index;
		}

		var targetColumn: GridCell[] = this.getColumn(INDEX);
		var empty: boolean = this.isArrayEmpty(targetColumn)

		if (onlyIfEmpty === true && empty === true) { return }

		for (let i = 0; i < this.numRows; i++) {
			this.gridMatrix[i].splice(INDEX, 1);
		}
		
		this.shiftElementColumnIndexes(INDEX, -1);
	}
	public removeRow(index?: number, onlyIfEmpty: boolean=false) {
		if (index === undefined || index < 0 || index > this.numRows-1) {
			var INDEX = this.numRows - 1;
		} else {
			INDEX = index;
		}

		var targetRow: GridCell<T>[] = this.gridMatrix[INDEX];
		var empty: boolean = this.isArrayEmpty(targetRow)

		if (onlyIfEmpty === true && !empty) { return }

		this.gridMatrix.splice(INDEX, 1);

		this.shiftElementRowIndexes(INDEX, -1);
	}

	protected shiftElementColumnIndexes(from: number, amount: number=1) {
		// Update grid indexes
		for (let i=from; i<this.numColumns; i++) {
			let col = this.getColumn(i);

			for (let cell of col) {
				if (cell?.elements !== undefined) {
					cell.elements.forEach((cell) => {
						if (cell.placementMode.type === "grid" && cell.placementMode.gridConfig.coords !== undefined) {
							cell.placementMode.gridConfig.coords.col += amount;
						}
					})
				}

				if (cell?.sources !== undefined) {
					Object.entries(cell.sources).forEach(([id, coord]) => {
						if (coord.col >= from) {
							coord.col += amount
						}
					})
				}
			}
		}
	}

	protected shiftElementRowIndexes(from: number, amount: number=1) {
		// Update grid indexes
		for (let i=from; i<this.numRows; i++) {
			let row = this.getRow(i);

			for (let cell of row) {
				if (cell?.elements !== undefined) {
					cell.elements.forEach((cell) => {
						if (cell.placementMode.type === "grid" && cell.placementMode.gridConfig.coords !== undefined) {
							cell.placementMode.gridConfig.coords.row += amount;
						}
					})
				}

				if (cell?.sources !== undefined) {
					Object.entries(cell.sources).forEach(([id, coord]) => {
						if (coord.row >= from) {
							coord.row += amount
						}
					})
				}
			}
		}
	}

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

		this.cells = Array.from({length: this.numRows}, () => Array.from({length: this.numColumns}, () => new Spacial()));

		var xCount: number = 0;
		var yCount: number = 0;
		

		for (var row=0; row<this.numRows; row++) {
			xCount = 0;
			var rowHeight: number = this.gridSizes.rows[row].height;

			for (var col=0; col<this.numColumns; col++) {
				var colWidth: number = this.gridSizes.columns[col].width;

				this.cells[row][col] = new Spacial(this.cx + xCount,this.cy + yCount, colWidth, rowHeight)

				xCount += colWidth;
			}

			yCount += rowHeight;
		}
	}

	protected applyCellSizes() {
		this.cells = Array.from({length: this.numRows}, () => Array.from({length: this.numColumns}, () => new Spacial()));

		this.gridSizes.rows.forEach((row, row_index) => {
			this.gridSizes.columns.forEach((column, column_index) => {
				let targetCell = this.cells[row_index][column_index];

				targetCell.width = column.width;
				targetCell.height = row.height;
			})
		})
	}

	public setChildSize(child: T, size: {noRows: number, noCols: number}) {
		let location: {row: number, col: number} | undefined = this.locateGridChild(child)

		if (location === undefined) {
			console.warn(`Cannot locate child for size change ${child.ref}`)
			return
		}

		if (child.placementMode.type === "grid") {
			child.placementMode.gridConfig.gridSize = {noRows: size.noRows, noCols: size.noCols}
		}

		let region: OccupiedCell<T>[][] | undefined = this.getElementGridRegion(child);
		if (region === undefined) {
			return
		}

		this.remove(child);
		this.appendElementsInRegion(region, location);
	}

	public positionElement(child: T, position: {row: number, col: number}) {
		let region: GridCell<T>[][] | undefined = this.getElementGridRegion(child, position);
		this.remove(child);

		if (region === undefined) {
			console.warn(`Error positioning child ${child.ref}`)
			return
		}

		this.appendElementsInRegion(region, position);
	}

	protected getElementGridRegion(child: T, overridePosition?: {row: number, col: number}): OccupiedCell<T>[][] | undefined {
		if (child.placementMode.type !== "grid") {
			console.warn(`Trying to position non-grid placement element ${child.ref} in grid ${this.ref}`)
			return
		}
		
		let topLeft: {row: number, col: number} | undefined = child.placementMode.gridConfig.coords;
		if (topLeft === undefined) {
			console.warn(`Cannot locate child ${child.ref} in grid object ${this.ref}`)
			return
		}

		let bottomRight: {row: number, col: number} = {
			row: topLeft.row + (child.placementMode.gridConfig.gridSize?.noRows ?? 1) -1,
			col: topLeft.col + (child.placementMode.gridConfig.gridSize?.noCols ?? 1) - 1
		};


		let root: {row: number, col: number} = overridePosition ?? topLeft
		child.placementMode.gridConfig.coords = root;

		// Construct region
		let entry: OccupiedCell<T> = {elements: [child], sources: {[child.id]: root}}
		let region: OccupiedCell<T>[][] = 
							Array<OccupiedCell<T>[]>(child.placementMode.gridConfig.gridSize?.noRows ?? 1)
							.fill(Array<OccupiedCell<T>>(child.placementMode.gridConfig.gridSize?.noCols ?? 1).fill(entry))

		// Put the top left back to just the element:
		region[0][0] = {elements: [child]};

		return region
	}
}