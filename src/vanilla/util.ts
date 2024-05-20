import { IDraw } from "./element";
import Positional, { IDefaultConstruct } from "./positional";

export function UpdateObj(template: any, partial: any) {
    var newkeyval = Object.entries(partial);
    let newObj = {...template}
  
    newkeyval.forEach(([key, val]) => {
      if (typeof val === "object" && 
          !Array.isArray(val) &&
          val !== null) { // If object but not array
  
        newObj[key] = UpdateObj(template[key], val);
      } else {
        newObj[key] = val
      }
    })
    return newObj;
}

export function FillObject<T>(pParams: Partial<T>, defaults: T): T {
  return pParams ? UpdateObj(defaults, pParams) : defaults;
}

export function PartialConstruct(element: {new (...args: any[]): any},
                                                      partialArgs: any,
                                                      defaultArgs: any) : any  {
  return new element(partialArgs ? UpdateObj(defaultArgs, partialArgs) : defaultArgs)
}