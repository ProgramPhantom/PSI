import { Element } from "@svgdotjs/svg.js";
import * as t from "ts-interface-checker";
import { CheckerTypeIndex } from "../typeCheckers";
import { UserComponentType } from "./diagramHandler";
import Point, { ID } from "./point";
import SVGElement, { ISVGElement } from "./svgElement";
import RectElement, { IRectElement } from "./rectElement";
import { Visual } from "./visual";

function isEmpty(obj: any) {
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return true
}

export function UpdateObj(template: any, partial: any) {
    var templateKeyval = Object.entries(template);
    let newObj = {...template, ...partial}
    let partialObj = partial;
  
    templateKeyval.forEach(([key, val]) => {
      if (typeof val === "object" && 
          !Array.isArray(val) &&
          val !== null) { // If object but not array
        
        if (partialObj[key]) {
          newObj[key] = UpdateObj(template[key], partialObj[key]);
        } 
        
      } else {
        if (partialObj[key] !== undefined) {
          newObj[key] = partialObj[key]
        }
      }
    })
    return newObj;
}
// Currently this removes fields not found in the default interface.
// For example "grid" data is lost when run with collection interface 

export function FillObject<T>(pParams: RecursivePartial<T>, defaults: T): T {
  return !isEmpty(pParams) ? UpdateObj(defaults, pParams) : defaults;
}

export function PartialConstruct(element: {new (...args: any[]): any},
                                                      partialArgs: any,
                                                      defaultArgs: any) : any  {
  return new element(partialArgs ? UpdateObj(defaultArgs, partialArgs) : defaultArgs)
}

export type RecursivePartial<T> = {
  [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object | undefined ? RecursivePartial<T[P]> :
    T[P];
};

export type ClassProperties<C> = {  
  [Key in keyof C as C[Key] extends Function ? never : Key]: C[Key]
}

export function posPrecision(val: number): number {
  // return Math.round(val * 100) / 100;
  return val;
}

export function sizePrecision(val: number) : number {
  return Math.round(val);
}

export function cascadeID(el: Element, id: ID) {
    el.children().forEach((e) => {
      e.attr({"id": id})
      cascadeID(e, id);
    })
}

export function createWithTemplate<T>(templateSource: { [key: string]: T }) {
    return function (params: T | RecursivePartial<T>, templateName?: string): T {
        if (templateName && templateSource[templateName]) {
            return FillObject<T>(params as RecursivePartial<T>, templateSource[templateName]);
        } else {
            return params as T;
        }
    };
}

export function getByPath(obj: any, path: string | undefined) {
  if (path === undefined) {return obj}
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function validateData(data: any, supposedType: UserComponentType): true | false {
  var suite: t.ITypeSuite = CheckerTypeIndex[supposedType].suite;
  var type: t.TType = CheckerTypeIndex[supposedType].type;
  const checker = t.createCheckers(suite);

  // Validate
  try {
    checker[`${type}`].check(data);
    return true
  } catch (err) {
    return false
  }
}

export function instantiateByType(data: any, type: UserComponentType): Visual {
  switch (type) {
    case "svg":
      return new SVGElement(data as ISVGElement);
    case "rect":
      return new RectElement(data as IRectElement);
    default:
      throw new Error(`Not implemented`)
  }
}

// Recursive Readonly type (vibed)
export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

// Deep mutable type (inverse of DeepReadonly)
export type DeepMutable<T> = {
  -readonly [P in keyof T]: DeepMutable<T[P]>;
};

// (vibed)
export function mergeObjectsPreferNonEmpty(obj1, obj2) {
  const result = {};
  for (const key of new Set([...Object.keys(obj1), ...Object.keys(obj2)])) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    
    // If val1 is empty object, use val2; otherwise use val1
    if (val1 && typeof val1 === "object" && !Array.isArray(val1) && Object.keys(val1).length === 0) {
      result[key] = val2;
    } else {
      result[key] = val1 ?? val2; // fallback if val1 is null/undefined
    }
  }
  return result;
}