import subprocess
import os
from datetime import datetime, date, timedelta
from collections import defaultdict
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import matplotlib.colors as mcolors

def get_commit_timestamps():
    cmd = ['git', 'log', '--format=%an|%ae|%at|%ad', '--date=iso']
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    lines = result.stdout.strip().splitlines()

    commits_by_day = defaultdict(list)
    for line in lines:
        parts = line.split('|')
        if len(parts) < 4:
            continue
        author, email, ts, date_str = parts[0].strip(), parts[1].strip(), int(parts[2].strip()), parts[3].strip()
        
        # Include user commits (Henry / ProgramPhantom)
        if "henry" in author.lower() or "phantom" in author.lower() or "henry" in email.lower():
            d_str = date_str.split()[0]
            commits_by_day[d_str].append(ts)
            
    return commits_by_day

def calculate_daily_hours(commits_by_day, max_diff_sec=3*3600, bonus_sec=1800):
    daily_hours = {}
    for d_str, timestamps in commits_by_day.items():
        sorted_ts = sorted(timestamps)
        total_sec = 0
        prev_ts = None
        for ts in sorted_ts:
            if prev_ts is None or (ts - prev_ts) > max_diff_sec:
                total_sec += bonus_sec
            elif ts >= prev_ts:
                total_sec += (ts - prev_ts)
            prev_ts = ts
        daily_hours[d_str] = min(total_sec / 3600.0, 16.0)
    return daily_hours

def draw_github_heatmap(daily_hours, output_path):
    if not daily_hours:
        print("No daily hours data.")
        return

    dates = [datetime.strptime(d, "%Y-%m-%d").date() for d in daily_hours.keys()]
    min_date = min(dates)
    max_date = max(max(dates), date.today())

    years = list(range(min_date.year, max_date.year + 1))
    n_years = len(years)

    # Style configuration (GitHub Dark Mode palette)
    bg_color = "#0d1117"
    border_color = "#30363d"
    text_color = "#e6edf3"
    text_muted = "#7d8590"
    empty_cell = "#21262d"
    
    cmap = mcolors.LinearSegmentedColormap.from_list("gh_greens", [
        (0.0, "#21262d"),
        (0.001, "#0e4429"),
        (0.25, "#006d32"),
        (0.50, "#26a641"),
        (0.75, "#39d353"),
        (1.0, "#7ee787")
    ])

    fig, axes = plt.subplots(n_years, 1, figsize=(16, 3.6 * n_years), facecolor=bg_color)
    if n_years == 1:
        axes = [axes]

    total_hours_all = sum(daily_hours.values())
    total_days_all = len(daily_hours)

    fig.suptitle(
        f"PSI Project — Estimated Time Spent per Day\n"
        f"Total: {total_hours_all:,.1f} hrs across {total_days_all} active days ({min_date.strftime('%b %Y')} – {max_date.strftime('%b %Y')})",
        fontsize=16, fontweight="bold", color=text_color, y=0.98, linespacing=1.4
    )

    for ax_idx, year in enumerate(years):
        ax = axes[ax_idx]
        ax.set_facecolor(bg_color)

        year_start = date(year, 1, 1)
        year_end = date(year, 12, 31)

        start_offset = year_start.weekday() # 0 is Mon
        cal_start = year_start - timedelta(days=start_offset)

        total_days = (year_end - cal_start).days + 1
        n_weeks = int(np.ceil(total_days / 7))

        grid = np.zeros((7, n_weeks))
        grid[:] = np.nan

        month_labels = {}
        curr_d = cal_start
        for col in range(n_weeks):
            for row in range(7):
                if curr_d.year == year:
                    d_str = curr_d.strftime("%Y-%m-%d")
                    val = daily_hours.get(d_str, 0.0)
                    grid[row, col] = val
                    
                    if curr_d.day <= 7 and curr_d.month not in month_labels and row == 0:
                        month_labels[curr_d.month] = (col, curr_d.strftime("%b"))
                curr_d += timedelta(days=1)

        year_hours = sum(v for d, v in daily_hours.items() if d.startswith(str(year)))
        year_days = sum(1 for d, v in daily_hours.items() if d.startswith(str(year)) and v > 0)

        norm = mcolors.Normalize(vmin=0, vmax=10.0)
        
        for col in range(n_weeks):
            for row in range(7):
                val = grid[row, col]
                if np.isnan(val):
                    continue
                color = empty_cell if val == 0 else cmap(norm(val))

                rect = patches.FancyBboxPatch(
                    (col + 0.08, row + 0.08), 0.84, 0.84,
                    boxstyle="round,pad=0.03,rounding_size=0.15",
                    facecolor=color, edgecolor="#2b313a", linewidth=0.5
                )
                ax.add_patch(rect)

        ax.set_xlim(-1, n_weeks + 1)
        ax.set_ylim(-1.0, 7.8)
        ax.invert_yaxis()
        ax.set_aspect("equal")

        # Month labels
        for m, (m_col, m_name) in month_labels.items():
            ax.text(m_col + 0.5, -0.4, m_name, color=text_muted, fontsize=10, ha="left", va="bottom", fontweight="semibold")

        # Weekday labels
        day_labels = {0: "Mon", 2: "Wed", 4: "Fri", 6: "Sun"}
        for d_idx, d_name in day_labels.items():
            ax.text(-0.6, d_idx + 0.5, d_name, color=text_muted, fontsize=9, ha="right", va="center")

        # Year title
        ax.set_title(
            f"{year}  —  {year_hours:,.1f} hrs  |  {year_days} active days",
            loc="left", color=text_color, fontsize=12, fontweight="bold", pad=14
        )

        for spine in ax.spines.values():
            spine.set_visible(False)
        ax.set_xticks([])
        ax.set_yticks([])

    # Legend / Colorbar
    cbar_ax = fig.add_axes([0.65, 0.02, 0.28, 0.022])
    sm = plt.cm.ScalarMappable(cmap=cmap, norm=norm)
    sm.set_array([])
    cbar = fig.colorbar(sm, cax=cbar_ax, orientation="horizontal")
    cbar.set_label("Estimated Work Hours / Day", color=text_color, fontsize=10, labelpad=5)
    cbar.ax.tick_params(labelsize=9, colors=text_muted)
    cbar.set_ticks([0, 2, 4, 6, 8, 10])
    cbar.set_ticklabels(["0h", "2h", "4h", "6h", "8h", "10h+"])
    cbar.outline.set_edgecolor(border_color)

    plt.subplots_adjust(top=0.90, bottom=0.07, hspace=0.45, left=0.06, right=0.96)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=200, facecolor=bg_color, edgecolor="none")
    plt.close()
    print(f"Heatmap successfully saved to: {output_path}")

if __name__ == '__main__':
    commits_by_day = get_commit_timestamps()
    daily_hours = calculate_daily_hours(commits_by_day, max_diff_sec=4*3600, bonus_sec=3600)
    
    out_file = r"c:\Users\henry\Github\PSI\git_time_heatmap.png"
    artifact_out = r"C:\Users\henry\.gemini\antigravity-ide\brain\83093e61-a3ae-4620-a3c8-cb450363e7a2\git_time_heatmap.png"
    
    draw_github_heatmap(daily_hours, out_file)
    draw_github_heatmap(daily_hours, artifact_out)
