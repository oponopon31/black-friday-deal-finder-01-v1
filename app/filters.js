// Search, filter and sort logic for the deal list. Pure functions over
// the deals array: no DOM access here, so the rules are easy to test.

export const DISCOUNT_BANDS = [
  { id: 'all', label: 'Any discount', test: () => true },
  { id: '50plus', label: '50% off or more', test: (d) => discountPct(d) >= 50 },
  { id: '40plus', label: '40% off or more', test: (d) => discountPct(d) >= 40 },
  { id: '25plus', label: '25% off or more', test: (d) => discountPct(d) >= 25 },
  { id: 'under25', label: 'Under 25% off', test: (d) => discountPct(d) < 25 },
];

export const SORTS = [
  { id: 'biggest-pct', label: 'Biggest discount %' },
  { id: 'biggest-save', label: 'Biggest saving $' },
  { id: 'lowest-price', label: 'Lowest price' },
  { id: 'newest', label: 'Newest check' },
];

export function discountPct(d) {
  if (!d.was || d.was <= 0) return 0;
  return Math.round((1 - d.price / d.was) * 100);
}

export function saving(d) {
  return Math.round((d.was - d.price) * 100) / 100;
}

export function matchesQuery(d, query) {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  const hay = `${d.title} ${d.store} ${d.category} ${d.verdict}`.toLowerCase();
  return q.split(/\s+/).every((word) => hay.includes(word));
}

export function applyFilters(deals, state) {
  const band = DISCOUNT_BANDS.find((b) => b.id === state.band) || DISCOUNT_BANDS[0];
  return deals.filter(
    (d) =>
      matchesQuery(d, state.query) &&
      (state.category === 'all' || d.category === state.category) &&
      (state.store === 'all' || d.store === state.store) &&
      (state.verdict === 'all' || d.verdict === state.verdict) &&
      band.test(d),
  );
}

export function applySort(list, sortId) {
  const copy = [...list];
  if (sortId === 'biggest-pct') copy.sort((a, b) => discountPct(b) - discountPct(a) || saving(b) - saving(a));
  else if (sortId === 'biggest-save') copy.sort((a, b) => saving(b) - saving(a) || discountPct(b) - discountPct(a));
  else if (sortId === 'lowest-price') copy.sort((a, b) => a.price - b.price || discountPct(b) - discountPct(a));
  else if (sortId === 'newest') copy.sort((a, b) => String(b.checked).localeCompare(String(a.checked)) || discountPct(b) - discountPct(a));
  return copy;
}

export function visibleDeals(deals, state) {
  return applySort(applyFilters(deals, state), state.sort);
}

export function uniqueValues(deals, key) {
  return [...new Set(deals.map((d) => d[key]))].sort((a, b) => a.localeCompare(b));
}

export function countByVerdict(deals) {
  const counts = {};
  for (const d of deals) counts[d.verdict] = (counts[d.verdict] || 0) + 1;
  return counts;
}
