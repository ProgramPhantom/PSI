import { IChannel } from "../../hasComponents/channel";
import { DEFAULT_BAR } from "../bar";
import { DEFAULT_CHANNEL_TEXT } from "../defaultChannelLabel";
import { DEFAULT_CHANNEL } from "../channel";
import { IText } from "../../text";

export const CHANNEL_1H: IChannel = {
	...DEFAULT_CHANNEL,
	ref: "1H-channel",
	children: [
		{
			...DEFAULT_CHANNEL_TEXT,
			text: "^{1}\\textrm{H}"
		} as IText,
		DEFAULT_BAR
	]
};

export const CHANNEL_19F: IChannel = {
	...DEFAULT_CHANNEL,
	ref: "19F-channel",
	children: [
		{
			...DEFAULT_CHANNEL_TEXT,
			text: "^{19}\\textrm{F}"
		} as IText,
		DEFAULT_BAR
	]
};

export const CHANNEL_Gz: IChannel = {
	...DEFAULT_CHANNEL,
	ref: "Gz-channel",
	children: [
		{
			...DEFAULT_CHANNEL_TEXT,
			text: "\\textrm{G}_\\textrm{z}"
		} as IText,
		DEFAULT_BAR
	]
};

export const CHANNEL_13C: IChannel = {
	...DEFAULT_CHANNEL,
	ref: "13C-channel",
	children: [
		{
			...DEFAULT_CHANNEL_TEXT,
			text: "^{13}\\textrm{C}"
		} as IText,
		DEFAULT_BAR
	]
};

export const CHANNEL_15N: IChannel = {
	...DEFAULT_CHANNEL,
	ref: "15N-channel",
	children: [
		{
			...DEFAULT_CHANNEL_TEXT,
			text: "^{15}\\textrm{N}"
		} as IText,
		DEFAULT_BAR
	]
};

export const CHANNEL_2H: IChannel = {
	...DEFAULT_CHANNEL,
	ref: "2H-channel",
	children: [
		{
			...DEFAULT_CHANNEL_TEXT,
			text: "^{2}\\textrm{H}"
		} as IText,
		DEFAULT_BAR
	]
};

export const CHANNEL_31P: IChannel = {
	...DEFAULT_CHANNEL,
	ref: "31P-channel",
	children: [
		{
			...DEFAULT_CHANNEL_TEXT,
			text: "^{31}\\textrm{P}"
		} as IText,
		DEFAULT_BAR
	]
};

export const CHANNEL_29Si: IChannel = {
	...DEFAULT_CHANNEL,
	ref: "29Si-channel",
	children: [
		{
			...DEFAULT_CHANNEL_TEXT,
			text: "^{29}\\textrm{Si}"
		} as IText,
		DEFAULT_BAR
	]
};

export const CHANNEL_11B: IChannel = {
	...DEFAULT_CHANNEL,
	ref: "11B-channel",
	children: [
		{
			...DEFAULT_CHANNEL_TEXT,
			text: "^{11}\\textrm{B}"
		} as IText,
		DEFAULT_BAR
	]
};

export const CHANNEL_27Al: IChannel = {
	...DEFAULT_CHANNEL,
	ref: "27Al-channel",
	children: [
		{
			...DEFAULT_CHANNEL_TEXT,
			text: "^{27}\\textrm{Al}"
		} as IText,
		DEFAULT_BAR
	]
};
