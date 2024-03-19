import { Schema } from "@data-driven-forms/react-form-renderer";
import { lineInterface } from "../../sequence";

export function lineSchema(def: lineInterface): Schema {
  return {"fields": [
    {  // stroke
        "component": "text-field",
        "name": "stroke",
        "label": "Stroke",
        "required": true,
        "initializeOnMount": true,
        "initialValue": def.stroke,
    },
    {  // Stroke Width
        "component": "text-field",
        "name": "strokeWidth",
        "label": "Stroke Width",
        "required": true,
        "helperText": "Line width",
        "initialValue": def.strokeWidth,
        "initializeOnMount": true,
        "validate": [
          {
            "type": "pattern",
            "pattern": "^[0-9_]+$",
            "message": "incorrect format"
          }
        ]
    },
    { // dashing
        "component": "text-field",
        "name": "dashing",
        "label": "Dashing",
        "helperText": "[filled px, unfilled px]",
        "isRequired": true,
        "initializeOnMount": true,
        "initialValue": `[${def.dashing[0]}, ${def.dashing[1]}]`,
        "validate": [
          {
            "type": "pattern",
            "pattern": "^[\\[]\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*]$",
            "message": "incorrect format"
          }
        ]
    },

  ]}
}