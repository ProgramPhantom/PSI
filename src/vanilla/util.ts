import { Element } from "@svgdotjs/svg.js";
import { Visual } from "./visual";
import { ID } from "./point";

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

export function hasMountConfig(element: Visual): element is Visual {
  return element.mountConfig !== undefined
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