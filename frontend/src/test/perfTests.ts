import ENGINE from "../logic/engine";
import { IChannel } from "../logic/hasComponents/channel";
import { IVisual } from "../logic/visual";
import {
	CHANNEL_13C,
	CHANNEL_19F,
	CHANNEL_1H,
	CHANNEL_Gz,
	CHANNEL_RF,
	CHANNEL_15N,
	CHANNEL_2H,
	CHANNEL_31P,
	CHANNEL_29Si,
	CHANNEL_11B,
	CHANNEL_27Al
} from "../logic/default/channels";
import { DEFAULT_180S } from "../logic/default/svgPulse/180Soft";
import { DEFAULT_RECT_ELEMENT } from "../logic/default/rectElement";
import { DEFAULT_LABEL } from "../logic/default/label";

export interface PerfMetricItem {
	index: number;
	elementId: string;
	templateRef: string;
	duration: number; // total act() duration in ms
	computeDuration: number; // isolated computeDiagram() duration in ms
	totalElementsAfterAdd?: number;
	timestamp: number;
}

export interface ChannelAddMetric extends PerfMetricItem {
	channelId: string;
	totalChannelsAfterAdd: number;
}

export interface ChannelRemoveMetric {
	index: number;
	channelId: string;
	duration: number;
	computeDuration: number;
	totalChannelsAfterRemove: number;
	timestamp: number;
}

export interface ChannelBenchmarkResult {
	channelCount: number;
	addMetrics: ChannelAddMetric[];
	removeMetrics: ChannelRemoveMetric[];
	totalAddDurationMs: number;
	avgAddDurationMs: number;
	minAddDurationMs: number;
	maxAddDurationMs: number;
	medianAddDurationMs: number;
	totalRemoveDurationMs: number;
	avgRemoveDurationMs: number;
	minRemoveDurationMs: number;
	maxRemoveDurationMs: number;
	addedChannelIds: string[];
}

export type FreeElementType = "svg" | "rect" | "label";

export interface FreeElementMetric extends PerfMetricItem {
	elementType: FreeElementType;
}

export interface FreeElementBenchmarkResult {
	elementType: FreeElementType;
	elementCount: number;
	addMetrics: FreeElementMetric[];
	removeMetrics: { index: number; elementId: string; duration: number; computeDuration: number }[];
	totalAddDurationMs: number;
	avgAddDurationMs: number;
	minAddDurationMs: number;
	maxAddDurationMs: number;
	medianAddDurationMs: number;
	totalRemoveDurationMs: number;
	avgRemoveDurationMs: number;
	minRemoveDurationMs: number;
	maxRemoveDurationMs: number;
	addedElementIds: string[];
}

export interface PureLayoutBenchmarkResult {
	iterations: number;
	durations: number[];
	totalDurationMs: number;
	avgDurationMs: number;
	minDurationMs: number;
	maxDurationMs: number;
	medianDurationMs: number;
	opsPerSec: number;
}

export interface BenchmarkProgress {
	current: number;
	total: number;
	message: string;
	percent: number;
}

export const BENCHMARK_CHANNEL_TEMPLATES = [
	CHANNEL_13C,
	CHANNEL_1H,
	CHANNEL_19F,
	CHANNEL_Gz,
	CHANNEL_RF,
	CHANNEL_15N,
	CHANNEL_2H,
	CHANNEL_31P,
	CHANNEL_29Si,
	CHANNEL_11B,
	CHANNEL_27Al
];

export const FREE_ELEMENT_DEFAULTS: Record<FreeElementType, IVisual> = {
	svg: DEFAULT_180S,
	rect: DEFAULT_RECT_ELEMENT,
	label: DEFAULT_LABEL
};

/**
 * Creates a unique channel state cloned from a template, with unique IDs
 * generated for the channel and its child elements.
 */
export function createBenchmarkChannel(template: IChannel, parentId?: string): IChannel {
	const newChannel = JSON.parse(JSON.stringify(template)) as IChannel;
	newChannel.id = Math.random().toString(16).slice(2);

	if (parentId) {
		newChannel.parentId = parentId;
	} else if (ENGINE.handler.diagram.sequences.length > 0) {
		newChannel.parentId = ENGINE.handler.diagram.sequences[0].id;
	} else {
		newChannel.parentId = ENGINE.handler.diagram.id;
	}

	if (newChannel.children) {
		newChannel.children = newChannel.children.map((child: IVisual) => ({
			...child,
			id: Math.random().toString(16).slice(2)
		}));
	}

	return newChannel;
}

/**
 * Creates a "free" placed element configured with unique IDs and positioned on the canvas.
 */
export function createFreeElement(type: FreeElementType, index: number): IVisual {
	const template = FREE_ELEMENT_DEFAULTS[type];
	const element = JSON.parse(JSON.stringify(template)) as IVisual;
	element.id = Math.random().toString(16).slice(2);
	element.parentId = ENGINE.handler.diagram.id;
	element.placementMode = { type: "free" };
	element.x = 20 + (index % 10) * 80;
	element.y = 20 + Math.floor(index / 10) * 80;

	const assignChildIds = (item: IVisual) => {
		const children = (item as unknown as { children?: IVisual[] }).children;
		if (children && Array.isArray(children)) {
			children.forEach((c: IVisual) => {
				c.id = Math.random().toString(16).slice(2);
				c.parentId = item.id;
				assignChildIds(c);
			});
		}
	};
	assignChildIds(element);

	return element;
}

/**
 * Runs a stress-test benchmark by adding channels one by one, retrieving the execution
 * time metrics from ENGINE.handler.act(), and optionally removing them.
 */
export async function runChannelAddBenchmark(
	count: number,
	options: {
		autoRemove?: boolean;
		onProgress?: (progress: BenchmarkProgress) => void;
	} = {}
): Promise<ChannelBenchmarkResult> {
	const addMetrics: ChannelAddMetric[] = [];
	const addedChannelIds: string[] = [];
	const totalSteps = options.autoRemove ? count * 2 : count;

	// 1. Sequential Channel Additions
	for (let i = 0; i < count; i++) {
		const template = BENCHMARK_CHANNEL_TEMPLATES[i % BENCHMARK_CHANNEL_TEMPLATES.length];
		const channel = createBenchmarkChannel(template);
		const channelId = channel.id!;
		addedChannelIds.push(channelId);

		options.onProgress?.({
			current: i + 1,
			total: totalSteps,
			message: `Adding channel ${i + 1}/${count} (${template.ref || "channel"})...`,
			percent: Math.round(((i + 1) / totalSteps) * 100)
		});

		// Yield to event loop to allow UI updates and SVG re-render
		await new Promise((resolve) => setTimeout(resolve, 0));

		const metrics = ENGINE.handler.act({
			type: "add",
			input: {
				child: channel
			}
		});

		const channelsCount = ENGINE.handler.diagram.channels.length;
		addMetrics.push({
			index: i + 1,
			channelId,
			elementId: channelId,
			templateRef: template.ref || `channel-${i + 1}`,
			duration: metrics.duration,
			computeDuration: metrics.computeDuration,
			totalChannelsAfterAdd: channelsCount,
			totalElementsAfterAdd: channelsCount,
			timestamp: Date.now()
		});
	}

	// 2. Sequential Channel Removals (if autoRemove is enabled)
	const removeMetrics: ChannelRemoveMetric[] = [];
	if (options.autoRemove) {
		const idsToRemove = [...addedChannelIds].reverse();
		for (let i = 0; i < idsToRemove.length; i++) {
			const id = idsToRemove[i];
			const channelInstance = ENGINE.handler.identifyElement(id);

			options.onProgress?.({
				current: count + i + 1,
				total: totalSteps,
				message: `Removing channel ${i + 1}/${count}...`,
				percent: Math.round(((count + i + 1) / totalSteps) * 100)
			});

			await new Promise((resolve) => setTimeout(resolve, 0));

			if (channelInstance) {
				const metrics = ENGINE.handler.act({
					type: "remove",
					input: {
						child: channelInstance
					}
				});

				removeMetrics.push({
					index: i + 1,
					channelId: id,
					duration: metrics.duration,
					computeDuration: metrics.computeDuration,
					totalChannelsAfterRemove: ENGINE.handler.diagram.channels.length,
					timestamp: Date.now()
				});
			}
		}
	}

	// Calculate statistical aggregates for additions
	const addDurations = addMetrics.map((m) => m.duration);
	const totalAddDurationMs = addDurations.reduce((a, b) => a + b, 0);
	const avgAddDurationMs = addDurations.length ? totalAddDurationMs / addDurations.length : 0;
	const minAddDurationMs = addDurations.length ? Math.min(...addDurations) : 0;
	const maxAddDurationMs = addDurations.length ? Math.max(...addDurations) : 0;
	const sortedAddDurations = [...addDurations].sort((a, b) => a - b);
	const medianAddDurationMs = sortedAddDurations.length
		? sortedAddDurations[Math.floor(sortedAddDurations.length / 2)]
		: 0;

	// Statistical aggregates for removals
	const removeDurations = removeMetrics.map((m) => m.duration);
	const totalRemoveDurationMs = removeDurations.reduce((a, b) => a + b, 0);
	const avgRemoveDurationMs = removeDurations.length ? totalRemoveDurationMs / removeDurations.length : 0;
	const minRemoveDurationMs = removeDurations.length ? Math.min(...removeDurations) : 0;
	const maxRemoveDurationMs = removeDurations.length ? Math.max(...removeDurations) : 0;

	return {
		channelCount: count,
		addMetrics,
		removeMetrics,
		totalAddDurationMs,
		avgAddDurationMs,
		minAddDurationMs,
		maxAddDurationMs,
		medianAddDurationMs,
		totalRemoveDurationMs,
		avgRemoveDurationMs,
		minRemoveDurationMs,
		maxRemoveDurationMs,
		addedChannelIds
	};
}

/**
 * Runs a stress-test benchmark by adding "free" placed elements to the canvas one by one,
 * of a given type ("svg" | "rect" | "label"), retrieving execution metrics from .act().
 */
export async function runFreeElementBenchmark(
	type: FreeElementType,
	count: number,
	options: {
		autoRemove?: boolean;
		onProgress?: (progress: BenchmarkProgress) => void;
	} = {}
): Promise<FreeElementBenchmarkResult> {
	const addMetrics: FreeElementMetric[] = [];
	const addedElementIds: string[] = [];
	const totalSteps = options.autoRemove ? count * 2 : count;

	// 1. Sequential Additions of Free Elements
	for (let i = 0; i < count; i++) {
		const element = createFreeElement(type, i);
		const elementId = element.id!;
		addedElementIds.push(elementId);

		options.onProgress?.({
			current: i + 1,
			total: totalSteps,
			message: `Adding free ${type} element ${i + 1}/${count}...`,
			percent: Math.round(((i + 1) / totalSteps) * 100)
		});

		await new Promise((resolve) => setTimeout(resolve, 0));

		const metrics = ENGINE.handler.act({
			type: "add",
			input: {
				child: element
			}
		});

		addMetrics.push({
			index: i + 1,
			elementId,
			elementType: type,
			templateRef: element.ref || `${type}-${i + 1}`,
			duration: metrics.duration,
			computeDuration: metrics.computeDuration,
			timestamp: Date.now()
		});
	}

	// 2. Sequential Removals (if autoRemove is enabled)
	const removeMetrics: { index: number; elementId: string; duration: number; computeDuration: number }[] = [];
	if (options.autoRemove) {
		const idsToRemove = [...addedElementIds].reverse();
		for (let i = 0; i < idsToRemove.length; i++) {
			const id = idsToRemove[i];
			const elementInstance = ENGINE.handler.identifyElement(id);

			options.onProgress?.({
				current: count + i + 1,
				total: totalSteps,
				message: `Removing free ${type} element ${i + 1}/${count}...`,
				percent: Math.round(((count + i + 1) / totalSteps) * 100)
			});

			await new Promise((resolve) => setTimeout(resolve, 0));

			if (elementInstance) {
				const metrics = ENGINE.handler.act({
					type: "remove",
					input: {
						child: elementInstance
					}
				});

				removeMetrics.push({
					index: i + 1,
					elementId: id,
					duration: metrics.duration,
					computeDuration: metrics.computeDuration
				});
			}
		}
	}

	// Statistics
	const addDurations = addMetrics.map((m) => m.duration);
	const totalAddDurationMs = addDurations.reduce((a, b) => a + b, 0);
	const avgAddDurationMs = addDurations.length ? totalAddDurationMs / addDurations.length : 0;
	const minAddDurationMs = addDurations.length ? Math.min(...addDurations) : 0;
	const maxAddDurationMs = addDurations.length ? Math.max(...addDurations) : 0;
	const sortedAddDurations = [...addDurations].sort((a, b) => a - b);
	const medianAddDurationMs = sortedAddDurations.length
		? sortedAddDurations[Math.floor(sortedAddDurations.length / 2)]
		: 0;

	const removeDurations = removeMetrics.map((m) => m.duration);
	const totalRemoveDurationMs = removeDurations.reduce((a, b) => a + b, 0);
	const avgRemoveDurationMs = removeDurations.length ? totalRemoveDurationMs / removeDurations.length : 0;
	const minRemoveDurationMs = removeDurations.length ? Math.min(...removeDurations) : 0;
	const maxRemoveDurationMs = removeDurations.length ? Math.max(...removeDurations) : 0;

	return {
		elementType: type,
		elementCount: count,
		addMetrics,
		removeMetrics,
		totalAddDurationMs,
		avgAddDurationMs,
		minAddDurationMs,
		maxAddDurationMs,
		medianAddDurationMs,
		totalRemoveDurationMs,
		avgRemoveDurationMs,
		minRemoveDurationMs,
		maxRemoveDurationMs,
		addedElementIds
	};
}

/**
 * Cleanly removes a list of elements by their IDs in reverse order (LIFO),
 * capturing removal timings from ENGINE.handler.act().
 */
export async function removeBenchmarkElements(
	elementIds: string[],
	onProgress?: (progress: BenchmarkProgress) => void
): Promise<{ index: number; elementId: string; duration: number; computeDuration: number }[]> {
	const removeMetrics: { index: number; elementId: string; duration: number; computeDuration: number }[] = [];
	const idsToRemove = [...elementIds].reverse();

	for (let i = 0; i < idsToRemove.length; i++) {
		const id = idsToRemove[i];
		const elementInstance = ENGINE.handler.identifyElement(id);

		onProgress?.({
			current: i + 1,
			total: idsToRemove.length,
			message: `Removing element ${i + 1}/${idsToRemove.length}...`,
			percent: Math.round(((i + 1) / idsToRemove.length) * 100)
		});

		await new Promise((resolve) => setTimeout(resolve, 0));

		if (elementInstance) {
			const metrics = ENGINE.handler.act({
				type: "remove",
				input: {
					child: elementInstance
				}
			});

			removeMetrics.push({
				index: i + 1,
				elementId: id,
				duration: metrics.duration,
				computeDuration: metrics.computeDuration
			});
		}
	}

	return removeMetrics;
}

export const removeBenchmarkChannels = removeBenchmarkElements;

/**
 * Pure layout compute benchmark: runs computeDiagram() repeatedly on the current diagram state
 * without triggering SVG redraws or action dispatching, isolating custom layout calculations.
 */
export async function runPureLayoutBenchmark(
	iterations: number = 50,
	onProgress?: (progress: BenchmarkProgress) => void
): Promise<PureLayoutBenchmarkResult> {
	const durations: number[] = [];

	for (let i = 0; i < iterations; i++) {
		if (i % 5 === 0) {
			onProgress?.({
				current: i + 1,
				total: iterations,
				message: `Computing layout ${i + 1}/${iterations}...`,
				percent: Math.round(((i + 1) / iterations) * 100)
			});
			await new Promise((resolve) => setTimeout(resolve, 0));
		}

		const start = performance.now();
		ENGINE.handler.computeDiagram();
		const end = performance.now();
		durations.push(end - start);
	}

	const totalDurationMs = durations.reduce((a, b) => a + b, 0);
	const avgDurationMs = totalDurationMs / durations.length;
	const minDurationMs = Math.min(...durations);
	const maxDurationMs = Math.max(...durations);
	const sorted = [...durations].sort((a, b) => a - b);
	const medianDurationMs = sorted[Math.floor(sorted.length / 2)];
	const opsPerSec = totalDurationMs > 0 ? (iterations / totalDurationMs) * 1000 : 0;

	return {
		iterations,
		durations,
		totalDurationMs,
		avgDurationMs,
		minDurationMs,
		maxDurationMs,
		medianDurationMs,
		opsPerSec
	};
}
