import { Schema } from "@data-driven-forms/react-form-renderer";
import { spanInterface } from "../../span";

export function spanSchema(def: spanInterface): Schema {
  return {"fields": [
    { // Padding
      "component": "text-field",
      "name": "padding",
      "label": "Padding",
      "helperText": "[top, right, bottom, left]",
      "isRequired": true,
      "initializeOnMount": true,
      initialValue: `[${def.padding}]`,
      // resolveProps: (props, {meta, input}, formOptions) => {
      //   return {
      //     value: "[" + input.value + "]"
      //   }
      // },
      "validate": [
        {
          "type": "pattern",
          "pattern": "^[\\[]\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*[\\]]$",
          "message": "incorrect format"
        }
      ]
    },
    {  // Width
        "component": "text-field",
        "name": "width",
        "label": "Width",
        "isRequired": true,
        "initialValue": def.width,
        "initializeOnMount": true,
        "validate": [
          {
            "type": "pattern",
            "pattern": "^[0-9_]+$",
            "message": "incorrect format"
          }
        ]
    },
    {  // Arrow on
      "component": "switch",
      "name": "arrowOn",
      "label": "Arrow",
      "isRequired": true,
      "initializeOnMount": true,
      "initialValue": def.arrowOn,
    },
    {  // Arrow form
      "component": "sub-form",
      "name": "arrowForm",
      "title": "Arrow",
      "fields": [
        {  // Arrow padding
          "component": "text-field",
          "name": "arrow.padding",
          "label": "Padding",
          "helperText": "[top, right, bottom, left]",
          "isRequired": true,
          "initializeOnMount": true,
          "initialValue": `[${def.arrow.padding}]`,
          "validate": [
            {
              "type": "pattern",
              "pattern": "^[\\[]\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*[\\]]$",
              "message": "incorrect format"
            }
          ]
        },
        {  // Arrow Position
          "component": "select",
          "name": "arrow.position",
          "label": "Position",
          "helperText": "vertical positioning",
          "isRequired": true,
          "initializeOnMount": true,
          "initialValue": def.arrow.position,
          "options": [
            {
              "value": "top",
              "label": "top"
            },
            {
              "value": "inline",
              "label": "inline"
            },
            {
              "value": "bottom",
              "label": "bottom"
            },
          ]
        },
        {  // Arrow style
          "component": "sub-form",
          "name": "arrow.style",
          "title": "Style",
          "fields": [
                {
                "component": "text-field",
                "name": "arrow.thickness",
                "label": "Thickness",
                "isRequired": true,
                "initializeOnMount": true,
                "initialValue": def.arrow.style.thickness,
                "validate": [
                  {
                    "type": "pattern",
                    "pattern": "^[0-9_]+$",
                    "message": "incorrect format"
                  }
                ]
              },
              {
                "component": "select",
                "name": "arrow.headStyle",
                "label": "Head Style",
                "isRequired": true,
                "initializeOnMount": true,
                "initialValue": def.arrow.style.headStyle,
                "options": [
                  {
                    "value": "default",
                    "label": "default"
                  }
                ]
              },
              {
                "component": "text-field",
                "name": "arrow.stroke",
                "isRequired": true,
                "initialValue": def.arrow.style.stroke,
                "initializeOnMount": true,
                "label": "Stroke",
                "helperText": "colour of arrow (html color eg 'black' or '#000000')",
              }
          ]
        },
      ],
      "condition": {
        "when": "arrowOn",
        "is": true,
        "then": {visible: true},
        "else": {visible: false}
      }
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
        {  // Label text
          "component": "text-field",
          "name": "label.text",
          "label": "Text",
          "initialValue": def.label.text,
          "initializeOnMount": true,
        },
        {  // Label padding
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
        {  // Label position
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
        {  // Label style
          "component": "sub-form",
          "name": "label.style",
          "title": "Style",
          "fields": [
                {  // Label size
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
                {  // Label colour
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
    }
  ]}
}