import React, { useEffect, useRef } from "react";
import { Button, Card, Elevation } from "@blueprintjs/core";
import { Chart } from "chart.js/auto";
import { PerfMetricItem } from "../../../test/perfTests";

export interface IChannelPerfChartProps {
	metrics: PerfMetricItem[];
	title?: string;
	xAxisLabel?: string;
	lineColor?: string;
	fillColor?: string;
	computeLineColor?: string;
	downloadFilenamePrefix?: string;
	labelFormatter?: (m: PerfMetricItem) => string;
}

export const ChannelPerfChart: React.FC<IChannelPerfChartProps> = ({
	metrics,
	title = "Execution Time",
	xAxisLabel = "Step (#)",
	lineColor = "#2d72d2",
	fillColor = "rgba(45, 114, 210, 0.12)",
	computeLineColor = "#d9822b",
	downloadFilenamePrefix = "benchmark",
	labelFormatter
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const chartInstanceRef = useRef<Chart | null>(null);

	useEffect(() => {
		if (!canvasRef.current || metrics.length === 0) return;

		// Destroy previous chart instance if it exists
		if (chartInstanceRef.current) {
			chartInstanceRef.current.destroy();
			chartInstanceRef.current = null;
		}

		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		const labels = metrics.map(labelFormatter || ((m) => `#${m.index}`));
		const actDurations = metrics.map((m) => Number(m.duration.toFixed(2)));
		const computeDurations = metrics.map((m) => Number(m.computeDuration.toFixed(2)));

		const newChart = new Chart(ctx, {
			type: "line",
			data: {
				labels,
				datasets: [
					{
						label: "Total .act() Time (ms)",
						data: actDurations,
						borderColor: lineColor,
						backgroundColor: fillColor,
						borderWidth: 2,
						pointBackgroundColor: lineColor,
						pointBorderColor: "#ffffff",
						pointRadius: 4,
						pointHoverRadius: 6,
						tension: 0.2,
						fill: true
					},
					{
						label: "Layout Compute Time (ms)",
						data: computeDurations,
						borderColor: computeLineColor,
						backgroundColor: "rgba(217, 130, 43, 0.08)",
						borderWidth: 2,
						borderDash: [4, 4],
						pointBackgroundColor: computeLineColor,
						pointBorderColor: "#ffffff",
						pointRadius: 3,
						pointHoverRadius: 5,
						tension: 0.2,
						fill: false
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: {
					duration: 400
				},
				interaction: {
					mode: "index",
					intersect: false
				},
				plugins: {
					title: {
						display: true,
						text: title,
						font: {
							size: 13,
							weight: "bold"
						},
						padding: {
							top: 6,
							bottom: 10
						}
					},
					tooltip: {
						callbacks: {
							title: (tooltipItems) => {
								const idx = tooltipItems[0]?.dataIndex ?? 0;
								const m = metrics[idx];
								return `Step #${idx + 1} (${m?.templateRef || "Item"})`;
							},
							label: (tooltipItem) => {
								return ` ${tooltipItem.dataset.label}: ${tooltipItem.formattedValue} ms`;
							},
							afterBody: (tooltipItems) => {
								const idx = tooltipItems[0]?.dataIndex ?? 0;
								const m = metrics[idx];
								const count = m?.totalElementsAfterAdd;
								return count !== undefined ? [`Total Elements: ${count}`] : [];
							}
						}
					},
					legend: {
						position: "top",
						labels: {
							boxWidth: 12,
							padding: 8,
							font: {
								size: 11
							}
						}
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: xAxisLabel,
							font: {
								size: 11,
								weight: "bold"
							}
						},
						grid: {
							color: "rgba(128, 128, 128, 0.15)"
						}
					},
					y: {
						title: {
							display: true,
							text: "Time (ms)",
							font: {
								size: 11,
								weight: "bold"
							}
						},
						beginAtZero: true,
						grid: {
							color: "rgba(128, 128, 128, 0.15)"
						}
					}
				}
			}
		});

		chartInstanceRef.current = newChart;

		return () => {
			if (chartInstanceRef.current) {
				chartInstanceRef.current.destroy();
				chartInstanceRef.current = null;
			}
		};
	}, [metrics, title, xAxisLabel, lineColor, fillColor, computeLineColor, labelFormatter]);

	const handleDownload = () => {
		if (metrics.length === 0) return;

		// Create dedicated high-resolution offscreen canvas (2400x1400, 300 DPI publication quality)
		const exportCanvas = document.createElement("canvas");
		const width = 1200;
		const height = 800;
		exportCanvas.width = width;
		exportCanvas.height = height;

		const exportCtx = exportCanvas.getContext("2d");
		if (!exportCtx) return;

		const labels = metrics.map(labelFormatter || ((m) => `#${m.index}`));
		const actDurations = metrics.map((m) => Number(m.duration.toFixed(2)));
		const computeDurations = metrics.map((m) => Number(m.computeDuration.toFixed(2)));

		// Render a crisp vector chart at full high resolution
		const exportChart = new Chart(exportCtx, {
			type: "line",
			data: {
				labels,
				datasets: [
					{
						label: "Total .act() Time (ms)",
						data: actDurations,
						borderColor: lineColor,
						backgroundColor: fillColor,
						borderWidth: 4,
						pointBackgroundColor: lineColor,
						pointBorderColor: "#ffffff",
						pointBorderWidth: 2,
						pointRadius: 6,
						pointHoverRadius: 8,
						tension: 0.2,
						fill: true
					},
					{
						label: "Layout Compute Time (ms)",
						data: computeDurations,
						borderColor: computeLineColor,
						backgroundColor: "rgba(217, 130, 43, 0.08)",
						borderWidth: 4,
						borderDash: [8, 8],
						pointBackgroundColor: computeLineColor,
						pointBorderColor: "#ffffff",
						pointBorderWidth: 2,
						pointRadius: 5,
						pointHoverRadius: 7,
						tension: 0.2,
						fill: false
					}
				]
			},
			plugins: [
				{
					id: "publicationWhiteBackground",
					beforeDraw: (chart) => {
						const { ctx: c, width: chartWidth, height: chartHeight } = chart;
						c.save();
						c.fillStyle = "#ffffff";
						c.fillRect(0, 0, chartWidth, chartHeight);
						c.restore();
					}
				}
			],
			options: {
				responsive: false,
				maintainAspectRatio: false,
				animation: false,
				layout: {
					padding: {
						top: 24,
						bottom: 24,
						left: 32,
						right: 36
					}
				},
				plugins: {
					title: {
						display: true,
						text: title,
						font: {
							size: 28,
							weight: "bold",
							family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
						},
						color: "#182026",
						padding: {
							top: 10,
							bottom: 24
						}
					},
					legend: {
						position: "top",
						labels: {
							boxWidth: 28,
							boxHeight: 14,
							padding: 24,
							font: {
								size: 18,
								weight: "normal",
								family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
							},
							color: "#182026"
						}
					},
					tooltip: {
						enabled: false
					}
				},
				scales: {
					x: {
						title: {
							display: true,
							text: xAxisLabel,
							font: {
								size: 20,
								weight: "bold",
								family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
							},
							color: "#182026",
							padding: { top: 14 }
						},
						ticks: {
							font: {
								size: 16,
								family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
							},
							color: "#5c7080",
							maxRotation: 45
						},
						grid: {
							color: "rgba(128, 128, 128, 0.2)",
							lineWidth: 1.5
						}
					},
					y: {
						title: {
							display: true,
							text: "Time (ms)",
							font: {
								size: 20,
								weight: "bold",
								family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
							},
							color: "#182026",
							padding: { bottom: 14 }
						},
						beginAtZero: true,
						ticks: {
							font: {
								size: 16,
								family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
							},
							color: "#5c7080"
						},
						grid: {
							color: "rgba(128, 128, 128, 0.2)",
							lineWidth: 1.5
						}
					}
				}
			}
		});

		// Export high-res PNG
		const dataUrl = exportCanvas.toDataURL("image/png", 1.0);
		exportChart.destroy();

		const link = document.createElement("a");
		link.href = dataUrl;
		link.download = `${downloadFilenamePrefix}-${Date.now()}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (metrics.length === 0) {
		return null;
	}

	return (
		<Card elevation={Elevation.ONE} style={{ padding: "10px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
				<div style={{ fontWeight: 600, fontSize: "12px" }}>{title}</div>
				<Button
					icon="download"
					small
					minimal
					intent="primary"
					text="Download (PNG)"
					title="Export high-resolution PNG (2400x1400) for publication"
					onClick={handleDownload}
				/>
			</div>

			<div style={{ position: "relative", width: "100%", height: "230px" }}>
				<canvas ref={canvasRef} />
			</div>
		</Card>
	);
};
