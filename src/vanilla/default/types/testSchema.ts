import { Schema } from "@data-driven-forms/react-form-renderer";
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';

import * as p90 from "../data/simplePulse/90pulse.json";
import { arrowInterface } from "../../arrow";


export var def = p90;
export const schema: Schema = {
  "fields": [
    {
      "component": "text-field",
      "name": "padding",
      "label": "Padding",
      "helperText": "top, right, bottom, left",
      "isRequired": true,
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
    {
      "component": "sub-form",
      "name": "config",
      "title": "Config",
      "fields": [
        {
        "component": "select",
        "name": "config.orientation",
        "label": "Orientation",
        initialValue: `${def.config.orientation}`,
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
        "helperText": "remove padding if aligning to left or right?"
      },
      {
        "component": "checkbox",
        "name": "config.inheritWidth",
        "label": "Inherit Width",
        "isRequired": true,
        "initialValue": def.config.inheritWidth,
        "helperText": "inherit width from widest vertically corresponding element",
      },
      {
        "component": "text-field",
        "name": "config.noSections",
        "label": "Num Sections",
        "required": true,
        "helperText": "element spans this number of vertically corresponding elements",
        "initialValue": def.config.noSections,
        "validate": [
          {
            "type": "pattern",
            "pattern": "^[0-9_]+$",
            "message": "incorrect format"
          }
        ]
      }]
    },
    {
      "component": "switch",
      "name": "arrowOn",
      "label": "Arrow",
      "isRequired": true,
      "initialValue": def.arrowOn
    },
    {
      "component": "sub-form",
      "name": "arrowForm",
      "title": "Arrow",
      "fields": [
        {
          "component": "text-field",
          "name": "arrow.padding",
          "label": "Padding",
          "helperText": "top, right, bottom, left",
          "isRequired": true,
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
          "fields": [
                {
                "component": "text-field",
                "name": "arrow.thickness",
                "label": "Thickness",
                "isRequired": true,
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
    {
      "component": "switch",
      "name": "labelOn",
      "label": "Label",
      "isRequired": true,
      "initialValue": def.labelOn
    },
    {
      "component": "sub-form",
      "name": "labelForm",
      "title": "Label",
      "fields": [
        {
          "component": "text-field",
          "name": "label.text",
          "label": "Text",
          "initialValue": def.label.text,
        },
        {
          "component": "text-field",
          "name": "label.padding",
          "label": "Padding",
          "helperText": "top, right, bottom, left",
          "isRequired": true,
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
          "fields": [
                {
                "component": "text-field",
                "name": "label.size",
                "label": "Size",
                "isRequired": true,
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
                  "name": "label.colour",
                  "label": "Colour",
                  "isRequired": true,
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
  ]
}