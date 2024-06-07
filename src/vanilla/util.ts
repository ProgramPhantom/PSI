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
    let newObj = {...template}
    let partialObj = {...partial}
  
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

export function FillObject<T>(pParams: Partial<T>, defaults: T): T {
  return !isEmpty(pParams) ? UpdateObj(defaults, pParams) : defaults;
}

export function PartialConstruct(element: {new (...args: any[]): any},
                                                      partialArgs: any,
                                                      defaultArgs: any) : any  {
  return new element(partialArgs ? UpdateObj(defaultArgs, partialArgs) : defaultArgs)
}