import { Offset } from "./element";
import Point, { Place } from "./point";
import { Dimensions } from "./spacial";




export default class Collection<T extends Point> extends Point {
    objects: T[] = [];
    get home(): T | undefined { return this.objects[0] }


    constructor(objects: T[]=[]) {
        super();
        
        this.objects = objects;
    }

    addByOffset(object: T, offset: Offset) {
        if (!this.home) {
            this.objects.push(object)
        } else {
            this.home.bind(object, Dimensions.X, "here", object.AnchorFunctions.here.get, offset[0]);
            this.home.bind(object, Dimensions.Y, "here", object.AnchorFunctions.here.get, offset[1]);
        }
    }

    addByCoords(object: T, x?: number, y?: number) {  // Could allow the bind location to change? TODO
        if (!this.home) {
            this.objects.push(object)
        } else {
            var xOffset = this.home.x - (x ? x : 0);
            var yOffset = this.home.y - (y ? y : 0);

            this.home.bind(object, Dimensions.X, "here", object.AnchorFunctions.here.get, xOffset);
            this.home.bind(object, Dimensions.Y, "here", object.AnchorFunctions.here.get, yOffset);
        }
    }

    add(object: T) {
        this.addByCoords(object);
    }
}

var test: Collection<Point> = new Collection<Point>();
var p = new Point(1 ,2);

test.addByCoords(p)