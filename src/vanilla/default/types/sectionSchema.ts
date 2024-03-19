import { Schema } from "@data-driven-forms/react-form-renderer";
import { sectionInterface } from "../../section";

export function sectionSchema(def: sectionInterface): Schema {
  return {"fields": [
    { // timespan
        "component": "text-field",
        "name": "timespan",
        "label": "Timespan",
        "helperText": "[start index, end index]",
        "isRequired": true,
        "initializeOnMount": true,
        "initialValue": `[${def.timespan[0]}, ${def.timespan[1]}]`,
        "validate": [
          {
            "type": "pattern",
            "pattern": "^[\\[]\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*]$",
            "message": "incorrect format"
          }
        ]
    },
    {  // Protrusion
        "component": "text-field",
        "name": "text",
        "label": "Protrusion",
        "isRequired": true,
        "initialValue": def.protrusion,
        "initializeOnMount": true,
        "validate": [
            {
              "type": "pattern",
              "pattern": "^[0-9_]+$",
              "message": "incorrect format"
            }
          ]
    },
    { // Adjustment
        "component": "text-field",
        "name": "adjustment",
        "label": "Adjustment",
        "helperText": "[left/top, right/bottom]",
        "isRequired": true,
        "initializeOnMount": true,
        "initialValue": `[${def.adjustment[0]}, ${def.adjustment[1]}]`,
        "validate": [
          {
            "type": "pattern",
            "pattern": "^[\\[]\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*]$",
            "message": "incorrect format"
          }
        ]
    },
    {  // Style
        "component": "sub-form",
        "name": "style",
        "title": "Style",
        "fields": [
        {  // Stroke Width
          "component": "text-field",
          "name": "style.strokeWidth",
          "label": "Stroke Width",
          "required": true,
          "helperText": "Bracket with",
          "initialValue": def.style.strokeWidth,
          "initializeOnMount": true,
          "validate": [
            {
              "type": "pattern",
              "pattern": "^[0-9_]+$",
              "message": "incorrect format"
            }
          ]
        },
        {  // Bracket Style
            "component": "select",
            "name": "style.bracketType",
            "label": "Bracket Type",
            "isRequired": true,
            "initializeOnMount": true,
            "initialValue": def.style.bracketType,
            "options": [
                {
                "value": "square",
                "label": "square"
                },
                {
                "value": "curly",
                "label": "curly"
                },
            ],
            "helperText": "style of bracket",
        },
        {  // Expression
          "component": "text-field",
          "name": "style.expression",
          "label": "Expression",
          "initializeOnMount": true,
          "helperText": "curvature of curly bracket",
          "initialValue": `${def.style.expression}`,
          "validate": [
            {
              "type": "pattern",
              "pattern": "^\\d+(\\.\\d+)?$",
              "message": "incorrect format"
            }
          ]
        },
        {  // stroke
          "component": "text-field",
          "name": "style.stroke",
          "label": "Stroke",
          "required": true,
          "initializeOnMount": true,
          "initialValue": def.style.stroke,
        }]
    },
    {  // Label on
      "component": "switch",
      "name": "labelOn",
      "label": "Label",
      "isRequired": true,
      "initializeOnMount": true,
      "initialValue": def.labelOn,
    },
    {  // Label form
      "component": "sub-form",
      "name": "labelForm",
      "title": "Label",
      "fields": [
        {
          "component": "text-field",
          "name": "label.text",
          "label": "Text",
          "initialValue": def.label.text,
          "initializeOnMount": true,
        },
        {
          "component": "text-field",
          "name": "label.padding",
          "label": "Padding",
          "helperText": "[top, right, bottom, left]",
          "isRequired": true,
          "initialValue": `[${def.label.padding}]`,
          "initializeOnMount": true,
          "validate": [
            {
              "type": "pattern",
              "pattern": "^[\\[]\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*[\\]]$",
              "message": "incorrect format"
            }
          ]
        },
        {
          "component": "select",
          "name": "label.position",
          "label": "Position",
          "isRequired": true,
          "initialValue": def.label.position,
          "initializeOnMount": true,
          "options": [
            {
              "value": "top",
              "label": "top"
            },
            {
              "value": "bottom",
              "label": "bottom"
            },
            {
              "value": "centre",
              "label": "centre"
            }
          ]
        },
        {
          "component": "sub-form",
          "name": "label.style",
          "title": "Style",
          "fields": [
                {
                "component": "text-field",
                "name": "label.size",
                "label": "Size",
                "isRequired": true,
                "initialValue": def.label.style.size,
                "initializeOnMount": true,
                "validate": [
                  {
                    "type": "pattern",
                    "pattern": "^[0-9_]+$",
                    "message": "incorrect format"
                  }
                ]
                },
                {
                  "component": "text-field",
                  "name": "label.colour",
                  "label": "Colour",
                  "isRequired": true,
                  "initialValue": def.label.style.colour,
                  "initializeOnMount": true,
                  "helperText": "(html color eg 'black' or '#000000')"
                }
          ]
        },
      ],
      "condition": {
        "when": "labelOn",
        "is": true,
        "then": {visible: true},
        "else": {visible: false}
      }
    },
  ]}
}