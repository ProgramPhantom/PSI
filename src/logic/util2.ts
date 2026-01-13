// DO NOT IMPORT ANY LOGIC LIBRARY THINGS HERE.
// IT WILL CAUSE CIRCULAR DEPENDENCIES AND A LOT OF PAIN

import { Element } from "@svgdotjs/svg.js";


export function cascadeID(el: Element, id: string) {
	el.children().forEach((e) => {
		e.attr({id: id});
		cascadeID(e, id);
	});
}

export function getByPath(obj: any, path: string | undefined) {
	if (path === undefined) {
		return obj;
	}
	if (path.endsWith(".")) {
		path = path.substring(0, path.length - 1);
	}
	if (path === "") {
		return obj
	}
	return path.split(".").reduce((acc, key) => acc?.[key], obj);
}