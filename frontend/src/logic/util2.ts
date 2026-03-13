// DO NOT IMPORT ANY LOGIC LIBRARY THINGS HERE.
// IT WILL CAUSE CIRCULAR DEPENDENCIES AND A LOT OF PAIN

import { Element } from "@svgdotjs/svg.js";


export function cascadeID(el: Element, id: string) {
	el.children().forEach((e) => {
		e.attr({ id: id });
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

export const downloadBlob = (function () {
	var a = document.createElement("a");
	document.body.appendChild(a);
	a.style = "display: none";
	return function (blob: Blob | MediaSource, fileName: string) {
		var url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = fileName;
		a.click();
		window.URL.revokeObjectURL(url);
	};
}());

export function mergeObjectsPreferNonEmpty(obj1: any, obj2: any) {
	const result: any = {};
	for (const key of new Set([...Object.keys(obj1), ...Object.keys(obj2)])) {
		const val1 = obj1[key];
		const val2 = obj2[key];
		if (val1 && typeof val1 === "object" && !Array.isArray(val1) && Object.keys(val1).length === 0) {
			result[key] = val2;
		} else {
			result[key] = val1 ?? val2;
		}
	}
	return result;
}