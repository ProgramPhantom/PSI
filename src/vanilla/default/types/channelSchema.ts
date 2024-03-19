import { Schema } from "@data-driven-forms/react-form-renderer";
import { channelInterface } from "../../channel";

export function channelSchema(def: channelInterface): Schema {
  return {"fields": [
    {  // identifier
        "component": "text-field",
        "name": "identifier",
        "label": "Identifier",
        "required": true,
        "initializeOnMount": true,
        "initialValue": def.identifier,
        "helperText": "name used to refer to channel",
    },
    {  // Padding
        "component": "text-field",
        "name": "padding",
        "label": "Padding",
        "helperText": "[top, right, bottom, left]",
        "isRequired": true,
        "initialValue": `[${def.padding}]`,
        "initializeOnMount": true,
        "validate": [
          {
            "type": "pattern",
            "pattern": "^[\\[]\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*,\\s*[0-9_]+\\s*[\\]]$",
            "message": "incorrect format"
          }
        ]
    },

    {  // Style
        "component": "sub-form",
        "name": "style",
        "title": "Style",
        "fields": [
        {  // thickness
            "component": "text-field",
            "name": "style.thickness",
            "label": "Thickness",
            "required": true,
            "initializeOnMount": true,
            "initialValue": def.style.thickness,
            "helperText": "thickness of channel bar"
        },
        {  // fill
            "component": "text-field",
            "name": "style.fill",
            "label": "Stroke",
            "required": true,
            "initializeOnMount": true,
            "initialValue": def.style.fill,
            "helperText": "(html color eg 'black' or '#000000')",
        },
        {  // stroke
            "component": "text-field",
            "name": "style.stroke",
            "label": "Stroke",
            "required": true,
            "initializeOnMount": true,
            "initialValue": def.style.stroke,
            "helperText": "(html color eg 'black' or '#000000')",
        },
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
]
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
        {  // Text
          "component": "text-field",
          "name": "label.text",
          "label": "Text",
          "initialValue": def.label.text,
          "initializeOnMount": true,
        },
        {  // Padding
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