import { IDiagram } from "../../hasComponents/diagram";
import { ISequence } from "../../hasComponents/sequence";
import { ISequenceAligner } from "../../hasComponents/sequenceAligner";
import { DEFAULT_SEQUENCE } from "../sequence";

export const D1PSYCHE: IDiagram = {
	"children": [
		{
			"mainAxis": "y",
			"minCrossAxis": 0,
			"children": [
				{
					"minHeight": 0,
					"minWidth": 10,
					"numRows": 6,
					"numColumns": 12,
					"children": [
						{
							"minHeight": 0,
							"minWidth": 0,
							"numRows": 3,
							"numColumns": 12,
							"children": [
								{
									"style": {
										"fontSize": 55,
										"colour": "black",
										"background": null,
										"display": "block"
									},
									"text": "^{1}\\textrm{H}",
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										5,
										0,
										0
									],
									"contentWidth": 29.535,
									"contentHeight": 22,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "far",
												"y": "centre"
											},
											"coords": {
												"row": 1,
												"col": 0
											},
											"contribution": {
												"x": true,
												"y": false
											}
										}
									},
									"placementControl": "auto",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"x": 0,
									"y": 65,
									"ref": "channel-label",
									"id": "9263d0cedf22c",
									"type": "latex",
									"parentId": "1a94274bebbd48",
									"role": "label"
								},
								{
									"style": {
										"fill": "#000000",
										"stroke": "black",
										"strokeWidth": 0
									},
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 587.894,
									"contentHeight": 2,
									"placementMode": {
										"type": "grid",
										"config": {
											"gridSize": {
												"noRows": 1,
												"noCols": 11
											},
											"coords": {
												"row": 1,
												"col": 1
											},
											"alignment": {
												"x": "here",
												"y": "centre"
											}
										}
									},
									"placementControl": "auto",
									"sizeMode": {
										"x": "grow",
										"y": "fixed"
									},
									"x": 35,
									"y": 75,
									"ref": "my-channel-bar",
									"id": "569026bc81766",
									"type": "rect",
									"parentId": "1a94274bebbd48",
									"role": "bar"
								},
								{
									"minHeight": 0,
									"minWidth": 0,
									"numRows": 3,
									"numColumns": 3,
									"children": [
										{
											"style": {
												"fill": "#000000",
												"stroke": "black",
												"strokeWidth": 0
											},
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												0,
												0
											],
											"contentWidth": 14,
											"contentHeight": 50,
											"placementMode": {
												"type": "grid",
												"config": {
													"coords": {
														"row": 1,
														"col": 1
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fixed",
												"y": "fixed"
											},
											"pulseLayoutConfig": {
												"channelID": "1a94274bebbd48",
												"sequenceID": "af87912kas83",
												"clipBar": false,
												"noSections": 1,
												"index": 1,
												"orientation": "both",
												"alignment": {
													"x": "centre",
													"y": "far"
												}
											},
											"x": 37,
											"y": 25,
											"ref": "90-pulse",
											"id": "3ed408c28cbf7",
											"type": "rect",
											"parentId": "3123481aefac6",
											"role": "coreChild",
											"pulseData": {
												"pulseType": {
													"category": "shape",
													"type": "Hard"
												}
											}
										},
										{
											"style": {
												"fontSize": 35,
												"colour": "black",
												"background": null,
												"display": "block"
											},
											"text": "\\Phi_1",
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												2,
												0
											],
											"contentWidth": 18.347,
											"contentHeight": 13.195,
											"placementMode": {
												"type": "grid",
												"config": {
													"contribution": {
														"x": true,
														"y": true
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													},
													"coords": {
														"row": 0,
														"col": 1
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fit",
												"y": "fit"
											},
											"x": 35,
											"y": 10,
											"ref": "default-latex",
											"id": "aa9eafe3a142a8",
											"type": "latex",
											"parentId": "3123481aefac6",
											"role": "labelTop"
										}
									],
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 18.347,
									"contentHeight": 65.195,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "far"
											},
											"coords": {
												"row": 0,
												"col": 1
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 1
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "1a94274bebbd48",
										"sequenceID": "af87912kas83",
										"clipBar": false,
										"noSections": 1,
										"index": 1,
										"orientation": "top",
										"alignment": {
											"x": "centre",
											"y": "far"
										}
									},
									"x": 35,
									"y": 10,
									"ref": "90-pulse",
									"id": "3123481aefac6",
									"type": "label-group",
									"parentId": "1a94274bebbd48"
								},
								{
									"style": {
										"fontSize": 35,
										"colour": "black",
										"background": null,
										"display": "block"
									},
									"text": "\\frac{t_1}{2}",
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										8,
										8,
										8,
										8
									],
									"contentWidth": 19.599999999999998,
									"contentHeight": 31.486000000000004,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "centre"
											},
											"coords": {
												"row": 0,
												"col": 2
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 1
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "1a94274bebbd48",
										"sequenceID": "af87912kas83",
										"clipBar": false,
										"noSections": 1,
										"index": 2,
										"orientation": "top",
										"alignment": {
											"x": "centre",
											"y": "centre"
										}
									},
									"x": 53,
									"y": 14,
									"ref": "annotation-t1-half",
									"id": "7ca031e76143b8",
									"type": "latex",
									"parentId": "1a94274bebbd48"
								},
								{
									"minHeight": 0,
									"minWidth": 0,
									"numRows": 3,
									"numColumns": 3,
									"children": [
										{
											"style": {
												"fill": "#000000",
												"stroke": "black",
												"strokeWidth": 0
											},
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												0,
												0
											],
											"contentWidth": 14,
											"contentHeight": 50,
											"placementMode": {
												"type": "grid",
												"config": {
													"coords": {
														"row": 1,
														"col": 1
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fixed",
												"y": "fixed"
											},
											"pulseLayoutConfig": {
												"channelID": "1a94274bebbd48",
												"sequenceID": "af87912kas83",
												"clipBar": false,
												"noSections": 1,
												"index": 1,
												"orientation": "both",
												"alignment": {
													"x": "centre",
													"y": "far"
												}
											},
											"x": 110,
											"y": 25,
											"ref": "90-pulse",
											"id": "e5974b95a8795",
											"type": "rect",
											"parentId": "667f2a6613dc08",
											"role": "coreChild",
											"pulseData": {
												"pulseType": {
													"category": "shape",
													"type": "Hard"
												}
											}
										},
										{
											"style": {
												"fontSize": 35,
												"colour": "black",
												"background": null,
												"display": "block"
											},
											"text": "\\Phi_2",
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												2,
												0
											],
											"contentWidth": 18.347,
											"contentHeight": 13.195,
											"placementMode": {
												"type": "grid",
												"config": {
													"contribution": {
														"x": true,
														"y": true
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													},
													"coords": {
														"row": 0,
														"col": 1
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fit",
												"y": "fit"
											},
											"x": 108,
											"y": 10,
											"ref": "default-latex",
											"id": "bb6f179770978",
											"type": "latex",
											"parentId": "667f2a6613dc08",
											"role": "labelTop"
										}
									],
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 18.347,
									"contentHeight": 65.195,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "far"
											},
											"coords": {
												"row": 0,
												"col": 4
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 1
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "1a94274bebbd48",
										"sequenceID": "af87912kas83",
										"clipBar": false,
										"noSections": 1,
										"index": 4,
										"orientation": "top",
										"alignment": {
											"x": "centre",
											"y": "far"
										}
									},
									"x": 108,
									"y": 10,
									"ref": "90-pulse",
									"id": "667f2a6613dc08",
									"type": "label-group",
									"parentId": "1a94274bebbd48"
								},
								{
									"minHeight": 0,
									"minWidth": 0,
									"numRows": 3,
									"numColumns": 3,
									"children": [
										{
											"asset": {
												"ref": "saltirelohi",
												"id": "6563b6a12f3a0332e2c652e76ba74be6c771a64e283b624f657714d06f201c82"
											},
											"style": {},
											"offset": [
												0,
												1
											],
											"flipped": false,
											"padding": [
												0,
												0,
												0,
												0
											],
											"contentWidth": 100,
											"contentHeight": 40,
											"placementMode": {
												"type": "grid",
												"config": {
													"coords": {
														"row": 1,
														"col": 1
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fixed",
												"y": "fixed"
											},
											"pulseLayoutConfig": {
												"channelID": "1a94274bebbd48",
												"sequenceID": "af87912kas83",
												"clipBar": false,
												"noSections": 1,
												"index": 1,
												"orientation": "both",
												"alignment": {
													"x": "centre",
													"y": "far"
												}
											},
											"x": 167,
											"y": 35,
											"ref": "saltirelohi",
											"id": "d49847553da63",
											"type": "svg",
											"parentId": "9205ec344d8c18",
											"role": "coreChild",
											"pulseData": {
												"pulseType": {
													"category": "shape",
													"type": "Adiabatic"
												}
											}
										},
										{
											"style": {
												"fontSize": 35,
												"colour": "black",
												"background": null,
												"display": "block"
											},
											"text": "\\Phi_3",
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												2,
												0
											],
											"contentWidth": 18.347,
											"contentHeight": 13.44,
											"placementMode": {
												"type": "grid",
												"config": {
													"contribution": {
														"x": true,
														"y": true
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													},
													"coords": {
														"row": 0,
														"col": 1
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fit",
												"y": "fit"
											},
											"x": 208,
											"y": 20,
											"ref": "default-latex",
											"id": "fe339109d7a64",
											"type": "latex",
											"parentId": "9205ec344d8c18",
											"role": "labelTop"
										}
									],
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 100,
									"contentHeight": 55.44,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "far"
											},
											"coords": {
												"row": 0,
												"col": 7
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 1
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "1a94274bebbd48",
										"sequenceID": "af87912kas83",
										"clipBar": false,
										"noSections": 1,
										"index": 7,
										"orientation": "top",
										"alignment": {
											"x": "centre",
											"y": "far"
										}
									},
									"x": 167,
									"y": 20,
									"ref": "saltirelohi",
									"id": "9205ec344d8c18",
									"type": "label-group",
									"parentId": "1a94274bebbd48"
								},
								{
									"minHeight": 0,
									"minWidth": 0,
									"numRows": 3,
									"numColumns": 3,
									"children": [
										{
											"asset": {
												"ref": "saltirehilo",
												"id": "f3f384ca941fb800918169e18599b5c1068f9d9ade395e160ed588db667cc57d"
											},
											"style": {},
											"offset": [
												0,
												1
											],
											"flipped": false,
											"padding": [
												0,
												0,
												0,
												0
											],
											"contentWidth": 100,
											"contentHeight": 40,
											"placementMode": {
												"type": "grid",
												"config": {
													"coords": {
														"row": 1,
														"col": 1
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fixed",
												"y": "fixed"
											},
											"pulseLayoutConfig": {
												"channelID": "1a94274bebbd48",
												"sequenceID": "af87912kas83",
												"clipBar": false,
												"noSections": 1,
												"index": 1,
												"orientation": "both",
												"alignment": {
													"x": "centre",
													"y": "far"
												}
											},
											"x": 267,
											"y": 35,
											"ref": "saltirehilo",
											"id": "f2d8955d27feb",
											"type": "svg",
											"parentId": "609d4b25148b9",
											"role": "coreChild",
											"pulseData": {
												"pulseType": {
													"category": "shape",
													"type": "Adiabatic"
												}
											}
										},
										{
											"style": {
												"fontSize": 35,
												"colour": "black",
												"background": null,
												"display": "block"
											},
											"text": "\\Phi_4",
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												2,
												0
											],
											"contentWidth": 18.347,
											"contentHeight": 13.195,
											"placementMode": {
												"type": "grid",
												"config": {
													"contribution": {
														"x": true,
														"y": true
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													},
													"coords": {
														"row": 0,
														"col": 1
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fit",
												"y": "fit"
											},
											"x": 308,
											"y": 20,
											"ref": "default-latex",
											"id": "8f3a0ca51ec94",
											"type": "latex",
											"parentId": "609d4b25148b9",
											"role": "labelTop"
										}
									],
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 100,
									"contentHeight": 55.195,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "far"
											},
											"coords": {
												"row": 0,
												"col": 8
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 1
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "1a94274bebbd48",
										"sequenceID": "af87912kas83",
										"clipBar": false,
										"noSections": 1,
										"index": 8,
										"orientation": "top",
										"alignment": {
											"x": "centre",
											"y": "far"
										}
									},
									"x": 267,
									"y": 20,
									"ref": "saltirehilo",
									"id": "609d4b25148b9",
									"type": "label-group",
									"parentId": "1a94274bebbd48"
								},
								{
									"style": {
										"fontSize": 35,
										"colour": "black",
										"background": null,
										"display": "block"
									},
									"text": "\\frac{t_1}{2}",
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										8,
										8,
										8,
										8
									],
									"contentWidth": 19.599999999999998,
									"contentHeight": 31.486000000000004,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "centre"
											},
											"coords": {
												"row": 0,
												"col": 10
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 1
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "1a94274bebbd48",
										"sequenceID": "af87912kas83",
										"clipBar": false,
										"noSections": 1,
										"index": 10,
										"orientation": "top",
										"alignment": {
											"x": "centre",
											"y": "centre"
										}
									},
									"x": 387,
									"y": 14,
									"ref": "annotation-t1-half",
									"id": "779144a34d18f",
									"type": "latex",
									"parentId": "1a94274bebbd48"
								},
								{
									"minHeight": 0,
									"minWidth": 0,
									"numRows": 3,
									"numColumns": 3,
									"children": [
										{
											"asset": {
												"ref": "acquire",
												"id": "ebdadfa32e11959e801d64ec14f3a12a462df8f7ce4823e002ef021a6a149ff0"
											},
											"style": {},
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												0,
												0
											],
											"contentWidth": 200,
											"contentHeight": 100,
											"placementMode": {
												"type": "grid",
												"config": {
													"coords": {
														"row": 1,
														"col": 1
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fixed",
												"y": "fixed"
											},
											"pulseLayoutConfig": {
												"channelID": "1a94274bebbd48",
												"sequenceID": "af87912kas83",
												"clipBar": true,
												"noSections": 1,
												"index": 1,
												"orientation": "both",
												"alignment": {
													"x": "centre",
													"y": "far"
												}
											},
											"x": 422,
											"y": 26,
											"ref": "acquire",
											"id": "96465c0d804d9",
											"type": "svg",
											"parentId": "630a31418cbaa8",
											"role": "coreChild"
										},
										{
											"style": {
												"fontSize": 35,
												"colour": "black",
												"background": null,
												"display": "block"
											},
											"text": "t_2",
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												2,
												0
											],
											"contentWidth": 12.628000000000002,
											"contentHeight": 12.292000000000002,
											"placementMode": {
												"type": "grid",
												"config": {
													"contribution": {
														"x": true,
														"y": false
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													},
													"coords": {
														"row": 0,
														"col": 1
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fit",
												"y": "fit"
											},
											"x": 516,
											"y": 12,
											"ref": "default-latex",
											"id": "52cba7d58455f",
											"type": "latex",
											"parentId": "630a31418cbaa8",
											"role": "labelTop"
										}
									],
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 200,
									"contentHeight": 100,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "centre"
											},
											"coords": {
												"row": 1,
												"col": 11
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 1
											},
											"contribution": {
												"x": true,
												"y": false
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "1a94274bebbd48",
										"sequenceID": "af87912kas83",
										"clipBar": true,
										"noSections": 1,
										"index": 11,
										"orientation": "both",
										"alignment": {
											"x": "centre",
											"y": "centre"
										}
									},
									"x": 422,
									"y": 26,
									"ref": "acquire",
									"id": "630a31418cbaa8",
									"type": "label-group",
									"parentId": "1a94274bebbd48"
								}
							],
							"offset": [
								0,
								0
							],
							"flipped": false,
							"padding": [
								10,
								0,
								10,
								0
							],
							"contentWidth": 622.429,
							"contentHeight": 116.195,
							"placementMode": {
								"type": "subgrid",
								"config": {
									"coords": {
										"row": 0,
										"col": 0
									},
									"fill": {
										"cols": true,
										"rows": false
									}
								}
							},
							"placementControl": "auto",
							"sizeMode": {
								"x": "fit",
								"y": "fit"
							},
							"x": 0,
							"y": 0,
							"ref": "my-channel",
							"id": "1a94274bebbd48",
							"type": "channel",
							"parentId": "af87912kas83",
							"role": "channel"
						},
						{
							"minHeight": 0,
							"minWidth": 0,
							"numRows": 3,
							"numColumns": 12,
							"children": [
								{
									"style": {
										"fontSize": 55,
										"colour": "black",
										"background": null,
										"display": "block"
									},
									"text": "\\textrm{G}_\\textrm{z}",
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										5,
										0,
										0
									],
									"contentWidth": 29.413999999999998,
									"contentHeight": 21.274,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "far",
												"y": "centre"
											},
											"coords": {
												"row": 1,
												"col": 0
											},
											"contribution": {
												"x": true,
												"y": false
											}
										}
									},
									"placementControl": "auto",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"x": 0,
									"y": 166,
									"ref": "channel-label",
									"id": "fe7879b5f3022",
									"type": "latex",
									"parentId": "31df93bf9e3f4",
									"role": "label"
								},
								{
									"style": {
										"fill": "#000000",
										"stroke": "black",
										"strokeWidth": 0
									},
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 587.894,
									"contentHeight": 2,
									"placementMode": {
										"type": "grid",
										"config": {
											"gridSize": {
												"noRows": 1,
												"noCols": 11
											},
											"coords": {
												"row": 1,
												"col": 1
											},
											"alignment": {
												"x": "here",
												"y": "centre"
											}
										}
									},
									"placementControl": "auto",
									"sizeMode": {
										"x": "grow",
										"y": "fixed"
									},
									"x": 35,
									"y": 176,
									"ref": "Gz-channel-bar",
									"id": "2570b341b28538",
									"type": "rect",
									"parentId": "31df93bf9e3f4",
									"role": "bar"
								},
								{
									"minHeight": 0,
									"minWidth": 0,
									"numRows": 3,
									"numColumns": 3,
									"children": [
										{
											"asset": {
												"ref": "halfsine",
												"id": "98da452d0f22f49b79f068c22f51c244800bf9728634a7bb35e56dc36494deb2"
											},
											"style": {},
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												0,
												0
											],
											"contentWidth": 20,
											"contentHeight": 20,
											"placementMode": {
												"type": "grid",
												"config": {
													"coords": {
														"row": 1,
														"col": 1
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fixed",
												"y": "fixed"
											},
											"pulseLayoutConfig": {
												"channelID": "31df93bf9e3f4",
												"sequenceID": "af87912kas83",
												"clipBar": false,
												"noSections": 1,
												"index": 1,
												"orientation": "both",
												"alignment": {
													"x": "centre",
													"y": "far"
												}
											},
											"x": 88,
											"y": 156,
											"ref": "shaped_gradient_2",
											"id": "b17cb7158e673",
											"type": "svg",
											"parentId": "ea04a5aa593f08",
											"role": "coreChild",
											"pulseData": {
												"pulseType": {
													"category": "PFG"
												}
											}
										},
										{
											"style": {
												"fontSize": 35,
												"colour": "black",
												"background": null,
												"display": "block"
											},
											"text": "G_1",
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												4,
												0,
												0,
												0
											],
											"contentWidth": 19.362,
											"contentHeight": 13.538,
											"placementMode": {
												"type": "grid",
												"config": {
													"contribution": {
														"x": false,
														"y": false
													},
													"alignment": {
														"x": "centre",
														"y": "here"
													},
													"coords": {
														"row": 2,
														"col": 1
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fit",
												"y": "fit"
											},
											"x": 88,
											"y": 176,
											"ref": "default-latex",
											"id": "2c81640d9a6828",
											"type": "latex",
											"parentId": "ea04a5aa593f08",
											"role": "labelBottom"
										}
									],
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 20,
									"contentHeight": 20,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "far"
											},
											"coords": {
												"row": 0,
												"col": 3
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 1
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "31df93bf9e3f4",
										"sequenceID": "af87912kas83",
										"clipBar": false,
										"noSections": 1,
										"index": 3,
										"orientation": "top",
										"alignment": {
											"x": "centre",
											"y": "far"
										}
									},
									"x": 88,
									"y": 156,
									"ref": "shaped_gradient_2",
									"id": "ea04a5aa593f08",
									"type": "label-group",
									"parentId": "31df93bf9e3f4"
								},
								{
									"minHeight": 0,
									"minWidth": 0,
									"numRows": 3,
									"numColumns": 3,
									"children": [
										{
											"asset": {
												"ref": "halfsine",
												"id": "98da452d0f22f49b79f068c22f51c244800bf9728634a7bb35e56dc36494deb2"
											},
											"style": {},
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												0,
												0
											],
											"contentWidth": 20,
											"contentHeight": 20,
											"placementMode": {
												"type": "grid",
												"config": {
													"coords": {
														"row": 1,
														"col": 1
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fixed",
												"y": "fixed"
											},
											"pulseLayoutConfig": {
												"channelID": "31df93bf9e3f4",
												"sequenceID": "af87912kas83",
												"clipBar": false,
												"noSections": 1,
												"index": 1,
												"orientation": "both",
												"alignment": {
													"x": "centre",
													"y": "far"
												}
											},
											"x": 127,
											"y": 156,
											"ref": "shaped_gradient_2",
											"id": "2068f27368909",
											"type": "svg",
											"parentId": "18ee4458f389c8",
											"role": "coreChild",
											"pulseData": {
												"pulseType": {
													"category": "PFG"
												}
											}
										},
										{
											"style": {
												"fontSize": 35,
												"colour": "black",
												"background": null,
												"display": "block"
											},
											"text": "G_1",
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												4,
												0,
												0,
												0
											],
											"contentWidth": 19.362,
											"contentHeight": 13.538,
											"placementMode": {
												"type": "grid",
												"config": {
													"contribution": {
														"x": false,
														"y": false
													},
													"alignment": {
														"x": "centre",
														"y": "here"
													},
													"coords": {
														"row": 2,
														"col": 1
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fit",
												"y": "fit"
											},
											"x": 127,
											"y": 176,
											"ref": "default-latex",
											"id": "09994384243e08",
											"type": "latex",
											"parentId": "18ee4458f389c8",
											"role": "labelBottom"
										}
									],
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 20,
									"contentHeight": 20,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "far"
											},
											"coords": {
												"row": 0,
												"col": 5
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 1
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "31df93bf9e3f4",
										"sequenceID": "af87912kas83",
										"clipBar": false,
										"noSections": 1,
										"index": 5,
										"orientation": "top",
										"alignment": {
											"x": "centre",
											"y": "far"
										}
									},
									"x": 127,
									"y": 156,
									"ref": "shaped_gradient_2",
									"id": "18ee4458f389c8",
									"type": "label-group",
									"parentId": "31df93bf9e3f4"
								},
								{
									"minHeight": 0,
									"minWidth": 0,
									"numRows": 3,
									"numColumns": 3,
									"children": [
										{
											"asset": {
												"ref": "halfsine",
												"id": "98da452d0f22f49b79f068c22f51c244800bf9728634a7bb35e56dc36494deb2"
											},
											"style": {},
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												0,
												0
											],
											"contentWidth": 20,
											"contentHeight": 30,
											"placementMode": {
												"type": "grid",
												"config": {
													"coords": {
														"row": 1,
														"col": 1
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fixed",
												"y": "fixed"
											},
											"pulseLayoutConfig": {
												"channelID": "31df93bf9e3f4",
												"sequenceID": "af87912kas83",
												"clipBar": false,
												"noSections": 1,
												"index": 1,
												"orientation": "both",
												"alignment": {
													"x": "centre",
													"y": "far"
												}
											},
											"x": 147,
											"y": 146,
											"ref": "shaped_gradient_1",
											"id": "cac803d1ff4d8",
											"type": "svg",
											"parentId": "213d3ac35a44a",
											"role": "coreChild",
											"pulseData": {
												"pulseType": {
													"category": "PFG"
												}
											}
										},
										{
											"style": {
												"fontSize": 35,
												"colour": "black",
												"background": null,
												"display": "block"
											},
											"text": "G_2",
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												4,
												0,
												0,
												0
											],
											"contentWidth": 19.362,
											"contentHeight": 13.538,
											"placementMode": {
												"type": "grid",
												"config": {
													"contribution": {
														"x": false,
														"y": false
													},
													"alignment": {
														"x": "centre",
														"y": "here"
													},
													"coords": {
														"row": 2,
														"col": 1
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fit",
												"y": "fit"
											},
											"x": 147,
											"y": 176,
											"ref": "default-latex",
											"id": "27edbe0b8a2878",
											"type": "latex",
											"parentId": "213d3ac35a44a",
											"role": "labelBottom"
										}
									],
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 20,
									"contentHeight": 30,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "far"
											},
											"coords": {
												"row": 0,
												"col": 6
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 1
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "31df93bf9e3f4",
										"sequenceID": "af87912kas83",
										"clipBar": false,
										"noSections": 1,
										"index": 6,
										"orientation": "top",
										"alignment": {
											"x": "centre",
											"y": "far"
										}
									},
									"x": 147,
									"y": 146,
									"ref": "shaped_gradient_1",
									"id": "213d3ac35a44a",
									"type": "label-group",
									"parentId": "31df93bf9e3f4"
								},
								{
									"minHeight": 0,
									"minWidth": 0,
									"numRows": 3,
									"numColumns": 3,
									"children": [
										{
											"asset": {
												"ref": "halfsine",
												"id": "98da452d0f22f49b79f068c22f51c244800bf9728634a7bb35e56dc36494deb2"
											},
											"style": {},
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												0,
												0
											],
											"contentWidth": 200,
											"contentHeight": 10,
											"placementMode": {
												"type": "grid",
												"config": {
													"coords": {
														"row": 1,
														"col": 1
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fixed",
												"y": "fixed"
											},
											"pulseLayoutConfig": {
												"channelID": "31df93bf9e3f4",
												"sequenceID": "af87912kas83",
												"clipBar": false,
												"noSections": 1,
												"index": 1,
												"orientation": "both",
												"alignment": {
													"x": "centre",
													"y": "far"
												}
											},
											"x": 167,
											"y": 166,
											"ref": "shaped_gradient_2",
											"id": "cd7ac3bce78338",
											"type": "svg",
											"parentId": "a1b5a8eea17a38",
											"role": "coreChild",
											"pulseData": {
												"pulseType": {
													"category": "PFG"
												}
											}
										},
										{
											"style": {
												"fontSize": 35,
												"colour": "black",
												"background": null,
												"display": "block"
											},
											"text": "G_3",
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												4,
												0,
												0,
												0
											],
											"contentWidth": 19.362,
											"contentHeight": 13.79,
											"placementMode": {
												"type": "grid",
												"config": {
													"contribution": {
														"x": false,
														"y": false
													},
													"alignment": {
														"x": "centre",
														"y": "here"
													},
													"coords": {
														"row": 2,
														"col": 1
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fit",
												"y": "fit"
											},
											"x": 257,
											"y": 176,
											"ref": "default-latex",
											"id": "55494ed518ffa8",
											"type": "latex",
											"parentId": "a1b5a8eea17a38",
											"role": "labelBottom"
										}
									],
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 200,
									"contentHeight": 10,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "far"
											},
											"coords": {
												"row": 0,
												"col": 7
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 2
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "31df93bf9e3f4",
										"sequenceID": "af87912kas83",
										"clipBar": false,
										"noSections": 2,
										"index": 7,
										"orientation": "top",
										"alignment": {
											"x": "centre",
											"y": "far"
										}
									},
									"x": 167,
									"y": 166,
									"ref": "shaped_gradient_2",
									"id": "a1b5a8eea17a38",
									"type": "label-group",
									"parentId": "31df93bf9e3f4"
								},
								{
									"minHeight": 0,
									"minWidth": 0,
									"numRows": 3,
									"numColumns": 3,
									"children": [
										{
											"asset": {
												"ref": "halfsine",
												"id": "98da452d0f22f49b79f068c22f51c244800bf9728634a7bb35e56dc36494deb2"
											},
											"style": {},
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												0,
												0,
												0,
												0
											],
											"contentWidth": 20,
											"contentHeight": 30,
											"placementMode": {
												"type": "grid",
												"config": {
													"coords": {
														"row": 1,
														"col": 1
													},
													"alignment": {
														"x": "centre",
														"y": "far"
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fixed",
												"y": "fixed"
											},
											"pulseLayoutConfig": {
												"channelID": "31df93bf9e3f4",
												"sequenceID": "af87912kas83",
												"clipBar": false,
												"noSections": 1,
												"index": 1,
												"orientation": "both",
												"alignment": {
													"x": "centre",
													"y": "far"
												}
											},
											"x": 367,
											"y": 146,
											"ref": "shaped_gradient_1",
											"id": "ac78eb7e7f0158",
											"type": "svg",
											"parentId": "84884373e9af3",
											"role": "coreChild",
											"pulseData": {
												"pulseType": {
													"category": "PFG"
												}
											}
										},
										{
											"style": {
												"fontSize": 35,
												"colour": "black",
												"background": null,
												"display": "block"
											},
											"text": "G_2",
											"offset": [
												0,
												0
											],
											"flipped": false,
											"padding": [
												4,
												0,
												0,
												0
											],
											"contentWidth": 19.362,
											"contentHeight": 13.538,
											"placementMode": {
												"type": "grid",
												"config": {
													"contribution": {
														"x": false,
														"y": false
													},
													"alignment": {
														"x": "centre",
														"y": "here"
													},
													"coords": {
														"row": 2,
														"col": 1
													}
												}
											},
											"placementControl": "auto",
											"sizeMode": {
												"x": "fit",
												"y": "fit"
											},
											"x": 367,
											"y": 176,
											"ref": "default-latex",
											"id": "27aa5bc6f5027",
											"type": "latex",
											"parentId": "84884373e9af3",
											"role": "labelBottom"
										}
									],
									"offset": [
										0,
										0
									],
									"flipped": false,
									"padding": [
										0,
										0,
										0,
										0
									],
									"contentWidth": 20,
									"contentHeight": 30,
									"placementMode": {
										"type": "grid",
										"config": {
											"alignment": {
												"x": "centre",
												"y": "far"
											},
											"coords": {
												"row": 0,
												"col": 9
											},
											"gridSize": {
												"noRows": 1,
												"noCols": 1
											}
										}
									},
									"placementControl": "user",
									"sizeMode": {
										"x": "fit",
										"y": "fit"
									},
									"pulseLayoutConfig": {
										"channelID": "31df93bf9e3f4",
										"sequenceID": "af87912kas83",
										"clipBar": false,
										"noSections": 1,
										"index": 9,
										"orientation": "top",
										"alignment": {
											"x": "centre",
											"y": "far"
										}
									},
									"x": 367,
									"y": 146,
									"ref": "shaped_gradient_1",
									"id": "84884373e9af3",
									"type": "label-group",
									"parentId": "31df93bf9e3f4"
								}
							],
							"offset": [
								0,
								0
							],
							"flipped": false,
							"padding": [
								10,
								0,
								10,
								0
							],
							"contentWidth": 622.429,
							"contentHeight": 42,
							"placementMode": {
								"type": "subgrid",
								"config": {
									"coords": {
										"row": 3,
										"col": 0
									},
									"fill": {
										"cols": true,
										"rows": false
									}
								}
							},
							"placementControl": "auto",
							"sizeMode": {
								"x": "fit",
								"y": "fit"
							},
							"x": 0,
							"y": 136,
							"ref": "Gz-channel",
							"id": "31df93bf9e3f4",
							"type": "channel",
							"parentId": "af87912kas83",
							"role": "channel"
						}
					],
					"offset": [
						0,
						0
					],
					"flipped": false,
					"padding": [
						0,
						0,
						0,
						0
					],
					"contentWidth": 622.429,
					"contentHeight": 198.195,
					"placementMode": {
						"type": "aligner",
						"config": {}
					},
					"placementControl": "auto",
					"sizeMode": {
						"x": "fixed",
						"y": "fixed"
					},
					"x": 0,
					"y": 0,
					"ref": "sequence",
					"id": "af87912kas83",
					"type": "sequence",
					"parentId": "856723473246"
				}
			],
			"offset": [
				0,
				0
			],
			"flipped": false,
			"padding": [
				0,
				0,
				0,
				0
			],
			"contentWidth": 622.429,
			"contentHeight": 198.195,
			"placementMode": {
				"type": "free"
			},
			"placementControl": "user",
			"sizeMode": {
				"x": "fixed",
				"y": "fixed"
			},
			"x": 0,
			"y": 0,
			"ref": "sequence-aligner",
			"id": "856723473246",
			"type": "sequence-aligner",
			"parentId": "c8014d42-f304-4e2e-a076-a6a425131ad4",
			"role": "sequence-aligner"
		} as any
	],
	"offset": [
		0,
		0
	],
	"flipped": false,
	"padding": [
		10,
		10,
		10,
		10
	],
	"contentWidth": 622.429,
	"contentHeight": 198.195,
	"placementMode": {
		"type": "free"
	},
	"placementControl": "user",
	"sizeMode": {
		"x": "fixed",
		"y": "fixed"
	},
	"x": -10,
	"y": -10,
	"ref": "1D PSYCHE",
	"id": "c8014d42-f304-4e2e-a076-a6a425131ad4",
	"type": "diagram"
} as any;