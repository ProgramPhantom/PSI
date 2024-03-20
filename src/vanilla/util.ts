
export function UpdateObj(obj: any, newVals: any) {
    var newkeyval = Object.entries(newVals);
    let newObj = {...obj}
  
    newkeyval.forEach(([key, val]) => {
      if (typeof val === "object" && 
          !Array.isArray(val) &&
          val !== null) { // If object but not array
  
        newObj[key] = UpdateObj(obj[key], val);
      } else {
        newObj[key] = val
      }
    })
    return newObj;
}