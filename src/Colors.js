// https://github.com/d3/d3-3.x-api-reference/blob/master/Ordinal-Scales.md
const PALETTE = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf'
]

const DATASETS = {};

export const getDatasetColor = dataset => {
  const existing = DATASETS[dataset];

  if (existing) {
    return existing;
  } else {
    const usedColors = new Set(Object.values(DATASETS));

    const available = PALETTE.find(c => !usedColors.has(c));
    if (available) {
      DATASETS[dataset] = available;
      return available;
    } else {
      throw "Out of colors!"
    }
  }
}