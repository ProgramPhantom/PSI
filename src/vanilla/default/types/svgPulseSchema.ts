import { Schema } from "@data-driven-forms/react-form-renderer";
import { svgPulseInterface } from "../../pulses/image/svgPulse";

export function svgPulseSchema(def: svgPulseInterface): Schema {
  return {"fields": [
    {  // Padding
      "component": "text-field",
      "name": "padding",
      "label": "Padding",
      "helperText": "[[top, right, bottom, left]]",
      "isRequired": true,
      initialValue: `[${def.padding}]`,
      "initializeOnMount": true,
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
    { // Path
      "component": "select",
      "name": "path",
      "label": "Figure",
      "dataType": "string",
      initialValue: def.path,
      "initializeOnMount": true,
      "options": [
        {
          "value": '\\src\\assets\\aquire2.svg',
          "label": "Aquire"
        },
        {
          "value": '\\src\\assets\\saltirelohi.svg',
          "label": "SaltireLoHi"
        },
        {
          "value": '\\src\\assets\\saltirehilo.svg',
          "label": "SaltireHiLo"
        },
        {
          "value": '\\src\\assets\\halfsine.svg',
          "label": "Halfsine"
        },
        {
          "value": '\\src\\assets\\chirplohi.svg',
          "label": "ChirpLoHi"
        },
        {
          "value": '\\src\\assets\\chirphilo.svg',
          "label": "ChirpHiLo"
        },
        {
          "value": '\\src\\assets\\ampseries.svg',
          "label": "Amp Series"
        },
        {
          "value": "\\src\\assets\\180.svg",
          "label": "180"
        },
        {
          "value": "\\src\\assets\\trapezium.svg",
          "label": "Trapezium"
        },
        {
          "value": "\\src\\assets\\talltrapezium.svg",
          "label": "Tall Trapezium"
        }
      ],
      "helperText": "select svg file",
      "isRequired": true
    },
    {  // Config
      "component": "sub-form",
      "name": "config",
      "title": "Config",
      "initializeOnMount": true,
      "fields": [
        {
        "component": "select",
        "name": "config.orientation",
        "label": "Orientation",
        "initializeOnMount": true,
        "initialValue": "top",
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
            "value": "both",
            "label": "both"
          }
        ],
        "helperText": "vertical positioning",
        "isRequired": true
      },
      {
        "component": "select",
        "name": "config.alignment",
        "label": "Alignment",
        "helperText": "horizontal positioning",
        "isRequired": true,
        initialValue: `${def.config.alignment}`,
        "initializeOnMount": true,
        "options": [
          {
            "value": "left",
            "label": "left"
          },
          {
            "value": "right",
            "label": "right"
          },
          {
            "value": "centre",
            "label": "centre"
          }
        ]
      },
      {
        "component": "checkbox",
        "name": "config.overridePad",
        "label": "Override Pad?",
        "isRequired": true,
        "initialValue": def.config.overridePad,
        "initializeOnMount": true,
        "helperText": "remove padding if aligning to left or right?"
      },
      {
        "component": "checkbox",
        "name": "config.inheritWidth",
        "label": "Inherit Width",
        "isRequired": true,
        "initialValue": def.config.inheritWidth,
        "initializeOnMount": true,
        "helperText": "inherit width from widest vertically corresponding element",
      },
      {
        "component": "text-field",
        "name": "config.noSections",
        "label": "Num Sections",
        "required": true,
        "helperText": "element spans this number of vertically corresponding elements",
        "initialValue": def.config.noSections,
        "initializeOnMount": true,
        "validate": [
          {
            "type": "pattern",
            "pattern": "^[0-9_]+$",
            "message": "incorrect format"
          }
        ]
      }]
    },
    {  // Style
      "component": "sub-form",
      "name": "style",
      "title": "Style",
      "initializeOnMount": true,
      "fields": [
      {  // Width
        "component": "text-field",
        "name": "style.width",
        "label": "Width",
        "required": true,
        "initialValue": def.style.width,
        "initializeOnMount": true,
        "validate": [
          {
            "type": "pattern",
            "pattern": "^[0-9_]+$",
            "message": "incorrect format"
          }
        ]
      },
      {  // Height
        "component": "text-field",
        "name": "style.height",
        "label": "Height",
        "required": true,
        "initialValue": def.style.height,
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
    {  // Arrow on
      "component": "switch",
      "name": "arrowOn",
      "label": "Arrow",
      "isRequired": true,
      "initializeOnMount": true,
      "clearOnUnmount": true,
      "initialValue": def.arrowOn
    },
    {  // Arrow form
      "component": "sub-form",
      "name": "arrowForm",
      "title": "Arrow",
      "initializeOnMount": true,
      "fields": [
        {
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
        {
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
        {
          "component": "sub-form",
          "name": "arrow.style",
          "title": "Style",
          "initializeOnMount": true,
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
                "initializeOnMount": true,
                "initialValue": def.arrow.style.stroke,
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
      "clearOnUnmount": true,
      "initialValue": def.labelOn
    },
    {  // Label form
      "component": "sub-form",
      "name": "labelForm",
      "title": "Label",
      "initializeOnMount": true,
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
          "helperText": "[[top, right, bottom, left]]",
          "isRequired": true,
          "initializeOnMount": true,
          "initialValue": `[${def.label.padding}]`,
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
          "initializeOnMount": true,
          "initialValue": def.label.position,
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
          "initializeOnMount": true,
          "fields": [
                {
                "component": "text-field",
                "name": "label.style.size",
                "label": "Size",
                "isRequired": true,
                "initializeOnMount": true,
                "initialValue": def.label.style.size,
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
                  "name": "label.style.colour",
                  "label": "Colour",
                  "isRequired": true,
                  "initializeOnMount": true,
                  "initialValue": def.label.style.colour,
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