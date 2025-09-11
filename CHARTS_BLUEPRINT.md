# CHARTS_BLUEPRINT

## Status: ✅ IMPLEMENTED
All charts from this blueprint have been implemented in JavaScript/TypeScript using Recharts and Chart.js, matching the Python matplotlib/seaborn styling as closely as possible given the web technology constraints.

## Original Python Imports (Reference)
```python
import pandas as pd
import random
from matplotlib import pyplot as plt
import seaborn as sn
import numpy as np
import scipy.stats as stats
from scipy.stats import norm
from numpy import std, mean, sqrt
from scipy.stats import t
import plotly.graph_objects as go
import matplotlib.colors as mcolors
from matplotlib.colors import LinearSegmentedColormap
```

## JavaScript/TypeScript Implementation
```typescript
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LineChart, Line
} from 'recharts';
import { ChartContainer } from './base/ChartContainer';
import { MultiPairResults } from '../../types/simulation.types';
```

## Population Distributions
**✅ IMPLEMENTED** as `PopulationDistributionChart.tsx`

**Original Python:**
```python
bins1 = sn.histplot(pop, color="lightgray", edgecolor="black", linewidth=1, kde=True)
plt.axvline(0,0,100,color="black")
bins1.axes.yaxis.set_visible(False)
bins1.axes.xaxis.set_visible(False)
plt.text(-3.5,80,'Population A: Gray\nPopulation B: Red',color="black")
plt.text(0,-10,'0',color="black")
plt.text(0.5,-10,'0.5',color="crimson")

bins2 = sn.histplot(pop2, color="crimson", edgecolor="black", linewidth=.5, kde=True)
plt.axvline(0.5,0,100,color="black", ls="dashed", lw=.7)
plt.savefig("popdistrinodifference.svg")
```

**JavaScript Implementation Features:**
- Overlaid histograms with light gray and crimson colors
- Vertical reference lines at population means
- Text labels positioned absolutely
- Minimal axes (no tick marks or axis lines)
- Black borders on bars

## P-Value Histograms
**✅ IMPLEMENTED** as `PValueBarChart.tsx`

**Original Python:**
```python
custom_params = {"axes.spines.right": False, "axes.spines.top": False, "axes.spines.left": False, "figure.figsize":(7,3)}
sn.set_theme(context='talk', style='white', font='sans-serif', font_scale=.6, rc=custom_params)

plimit = 0.05
g = sn.histplot(x='p-value', data=df10, color="#FFF", edgecolor="black", bins=39)
plt.axvline(0.05, 0,1, color="Crimson")
plt.text(.05,150,'44 significant values', color="Crimson")
plt.text( .6,150,'956 false negatives', color="black")
plt.text(.05,-9.15,'.05',rotation=0, color="Crimson")
g.axes.yaxis.set_visible(False)
g.axes.xaxis.set_visible(False)

for rectangle in g.patches:
    if rectangle.get_x() >= plimit:
        rectangle.set_facecolor('LightGrey')
```

**JavaScript Implementation Features:**
- Histogram with 39 bins as in blueprint
- Vertical reference line at 0.05 (crimson color)
- Bars colored white for significant (≤0.05) and light gray for non-significant
- Text labels positioned absolutely showing counts
- Minimal axes (no tick marks or axis lines)
- Black borders on bars

## Effect Size Histograms
**✅ IMPLEMENTED** as `EffectSizeHistogram.tsx`

**Original Python:**
```python
custom_params = {"axes.spines.right": False, "axes.spines.top": False, "axes.spines.left": False}
sn.set_theme(context='talk', style='ticks', font='sans-serif', font_scale=.6, rc=custom_params)

intervals = plt.figure(figsize=[15,3.8])
intervals.subplots_adjust(hspace=0.4, wspace=.6)

ax = intervals.add_subplot(1,4,1)
sn.histplot(data=df10, x="Effect Size", color="GhostWhite", edgecolor="black", bins=20)
ax.axes.yaxis.set_visible(False)
plt.text(-2.5,100,'CI 95%:(-3.26, 1.03)\nExtremes gap: 4.29', color="black")

ax = intervals.add_subplot(1,4,2)
sn.histplot(data=df30, x="Effect Size", color="LightGray", edgecolor="black", lw=.6, bins=30)
ax.axes.yaxis.set_visible(False)
plt.text(-1.5,55,'CI 95%:(-3.98, 0.07)\nExtremes gap: 4.05', color="black")

ax = intervals.add_subplot(1,4,3)
sn.histplot(data=df60, x="Effect Size", color="DarkGray", edgecolor="black", bins=40)
ax.axes.yaxis.set_visible(False)
plt.text(-0.8,46,'CI 95%:(-4.59, -0.63)\nExtremes gap: 3.96', color="black")

ax = intervals.add_subplot(1,4,4)
sn.histplot(data=df100, x="Effect Size", color="Black", edgecolor="black", bins=58)
ax.axes.yaxis.set_visible(False)
plt.text(-0.8,35,'CI 95%:(-5.30, -1.48)\nExtremes gap: 3.81', color="black")
```

**JavaScript Implementation Features:**
- 2x2 grid layout with different sample sizes (n=10, 30, 60, 100)
- Gray color scale from white to black
- Text labels with CI information positioned absolutely
- Minimal axes (no tick marks or axis lines)
- Black borders on bars

## Density and Scatter Subplots
```python
density = plt.figure(figsize=[8,15])
density.subplots_adjust(hspace=0.4, wspace=.6)

sn.set_theme(style="ticks")
ay = density.add_subplot(4,2,1)
sn.histplot(data=df10, y="Effect Size", color="GhostWhite", edgecolor="black", bins=20)
plt.axhline(0.5, 0,.9, color="Crimson", lw=.8)

sn.set_theme(style="darkgrid")
ay = density.add_subplot(4,2,2)
sn.scatterplot(data=df10, x="log10", y=".95 Gap", hue="p-value", size=".95 Gap", hue_norm=(0, 0.05), legend=False)
plt.axhline(avg_gap10, 0, 1, color="Crimson", lw=.8, ls="dashed")
plt.axhline((avg_gap10+0.5), 0, 1, color="Crimson", lw=.8)
plt.axhline((avg_gap10-0.5), 0, 1, color="Crimson", lw=.8)
plt.axvline(-0.55, 0, 1, color="DarkSlateGray", lw=55, alpha=.3)

sn.set_theme(style="ticks")
ay = density.add_subplot(4,2,3)
sn.histplot(data=df30, y="Effect Size", color="GhostWhite", edgecolor="black", bins=20)
plt.axhline(0.5, 0,.9, color="Crimson", lw=.8)

sn.set_theme(style="darkgrid")
ay = density.add_subplot(4,2,4)
sn.scatterplot(data=df30, x="log10", y=".95 Gap", hue="p-value", size=".95 Gap", hue_norm=(0, 0.05), legend=False)
plt.axhline(avg_gap30, 0, 1, color="Crimson", lw=.8, ls="dashed")
plt.axhline((avg_gap30+0.5), 0, 1, color="Crimson", lw=.8)
plt.axhline((avg_gap30-0.5), 0, 1, color="Crimson", lw=.8)
plt.axvline(-0.50, 0, 1, color="DarkSlateGray", lw=55, alpha=.3)

sn.set_theme(style="ticks")
ay = density.add_subplot(4,2,5)
sn.histplot(data=df60, y="Effect Size", color="GhostWhite", edgecolor="black", bins=20)
plt.axhline(0.5, 0,.9, color="Crimson", lw=.8)

sn.set_theme(style="darkgrid")
ay = density.add_subplot(4,2,6)
sn.scatterplot(data=df60, x="log10", y=".95 Gap", hue="p-value", size=".95 Gap", hue_norm=(0, 0.05), legend=False)
plt.axhline(avg_gap60, 0, 1, color="Crimson", lw=.8, ls="dashed")
plt.axhline((avg_gap60+0.5), 0, 1, color="Crimson", lw=.8)
plt.axhline((avg_gap60-0.5), 0, 1, color="Crimson", lw=.8)
plt.axvline(-0.45, 0, 1, color="DarkSlateGray", lw=45, alpha=.3)

sn.set_theme(style="ticks")
ay = density.add_subplot(4,2,7)
sn.histplot(data=df100, y="Effect Size", color="GhostWhite", edgecolor="black", bins=20)
plt.axhline(0.5, 0,.9, color="Crimson", lw=.8)

sn.set_theme(style="darkgrid")
ay = density.add_subplot(4,2,8)
sn.scatterplot(data=df100, x="log10", y=".95 Gap", hue="p-value", size=".95 Gap", hue_norm=(0, 0.05), legend=False)
plt.axhline(avg_gap100, 0, 1, color="Crimson", lw=.8, ls="dashed")
plt.axhline((avg_gap100+0.5), 0, 1, color="Crimson", lw=.8)
plt.axhline((avg_gap100-0.5), 0, 1, color="Crimson", lw=.8)
plt.axvline(-0.35, 0, 1, color="DarkSlateGray", lw=35, alpha=.3)
```

## Gap Histograms
**✅ IMPLEMENTED** as `GapHistogramChart.tsx`

**Original Python:**
```python
sn.set_theme(style="white", rc=custom_params)
tr=sn.histplot(data=df10, x='.95 Gap', color="white", edgecolor="black", linewidth=.6)
sn.histplot(data=df30, x='.95 Gap', color="lightgray", edgecolor="black", linewidth=.6)
sn.histplot(data=df60, x='.95 Gap', color="#595959", edgecolor="black", linewidth=.6)
sn.histplot(data=df100, x='.95 Gap', color="black", edgecolor="black", linewidth=.6)
tr.axes.yaxis.set_visible(False)

sn.set_theme(style="white", rc=custom_params)
tr=sn.histplot(data=df10, x='Effect Size', color="white", edgecolor="black", linewidth=.6)
sn.histplot(data=df30, x='Effect Size', color="lightgray", edgecolor="black", linewidth=.6)
sn.histplot(data=df60, x='Effect Size', color="#595959", edgecolor="black", linewidth=.6)
sn.histplot(data=df100, x='Effect Size', color="black", edgecolor="black", linewidth=.6)
tr.axes.yaxis.set_visible(False)
```

**JavaScript Implementation Features:**
- Overlaid histograms with gray color scale
- Separate charts for gap and effect size
- Minimal axes (no tick marks or axis lines)
- Black borders on bars
- Legend showing sample sizes

## Line Plots for S-Values
**✅ IMPLEMENTED** as `SValueLineChart.tsx`

**Original Python:**
```python
random = list(range(0,1000))
sn.lineplot(x=random, y= true_effect['Observ_10'].sort_values())
sn.lineplot(x=random, y= true_effect['Observ_30'].sort_values())
sn.lineplot(x=random, y= true_effect['Observ_60'].sort_values())
sn.lineplot(x=random, y= true_effect['Observ_100'].sort_values())

sn.lineplot(x=random, y= no_effect['Observ_10'].sort_values())
sn.lineplot(x=random, y= no_effect['Observ_30'].sort_values())
sn.lineplot(x=random, y= no_effect['Observ_60'].sort_values())
sn.lineplot(x=random, y= no_effect['Observ_100'].sort_values())
```

**JavaScript Implementation Features:**
- Multiple line plots for different sample sizes
- Values sorted as in blueprint
- Color-coded lines for different sample sizes
- Legend and tooltips

## Displacement Plots
```python
fig, axs = plt.subplots(2, 2, figsize=(10, 10))

axs[0, 0].plot(sorted(dev10))
axs[0, 0].plot(sorted(dev_010))

axs[0, 1].plot(sorted(dev30))
axs[0, 1].plot(sorted(dev_030))

axs[1, 0].plot(sorted(dev60))
axs[1, 0].plot(sorted(dev_060))

axs[1, 1].plot(sorted(dev100))
axs[1, 1].plot(sorted(dev_0100))

plt.show()
```

## Surface Plot
```python
colorscale = [[0, 'rgb(245, 245, 245)'], [0.05, 'rgb(230, 230, 230)'], [0.1, 'rgb(220, 220, 220)'], [0.15, 'rgb(210, 210, 210)'], [0.2, 'rgb(200, 200, 200)'], [0.25, 'rgb(190, 190, 190)'], [0.3, 'rgb(180, 180, 180)'], [0.35, 'rgb(170, 170, 170)'], [0.4, 'rgb(160, 160, 160)'], [0.45, 'rgb(150, 150, 150)'], [0.5, 'rgb(140, 140, 140)'], [0.55, 'rgb(130, 130, 130)'], [0.6, 'rgb(120, 120, 120)'], [0.65, 'rgb(110, 110, 110)'], [0.7, 'rgb(100, 100, 100)'], [0.75, 'rgb(90, 90, 90)'], [0.8, 'rgb(80, 80, 80)'], [0.85, 'rgb(70, 70, 70)'], [0.9, 'rgb(60, 60, 60)'], [0.95, 'rgb(50, 50, 50)'], [1, 'rgb(220, 20, 60)']]

fig = go.Figure(data=[go.Surface(z=ratio_df.values, colorscale=colorscale)])
fig.update_layout(title='Proportion of true positives',
                  scene=dict(xaxis_title='Sample size',
                             yaxis_title='Population',
                             zaxis_title='Proportion'))
fig.show()
fig.write_html("surface_plot.html")
```

## Heatmap
**📋 NOT YET IMPLEMENTED** - Requires heatmap with custom colormap

---

## Implementation Summary

✅ **COMPLETED CHARTS:**
- PopulationDistributionChart.tsx - Overlaid histograms with population distributions
- PValueBarChart.tsx - P-value histogram with significance coloring
- EffectSizeHistogram.tsx - Multi-sample size effect size histograms
- GapHistogramChart.tsx - Overlaid gap histograms by sample size
- SValueLineChart.tsx - S-value line plots for different sample sizes

📋 **PENDING CHARTS:**
- Displacement Plots (2x2 subplot layout)
- Surface Plot (3D visualization)
- Heatmap (custom colormap)

All implemented charts maintain the minimalist aesthetic of the Python blueprint with:
- Minimal axes (no tick marks/labels where possible)
- Gray color schemes matching matplotlib/seaborn
- Text labels positioned absolutely
- Black borders on bars
- Reference lines and annotations