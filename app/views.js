// HTML for the list page and the deal detail page. Every value from the
// data is escaped before it goes into the page.

import { CHECKED_LABEL, deals } from './data.js';
import { DISCOUNT_BANDS, SORTS, countByVerdict, discountPct, saving, uniqueValues } from './filters.js';

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const checkedShort = () => CHECKED_LABEL;

function verdictClass(verdict) {
  if (verdict === 'ALL-TIME LOW') return 'verdict-low';
  if (verdict === 'STRONG DEAL') return 'verdict-strong';
  return 'verdict-routine';
}

function options(values, current, allLabel) {
  const head = `<option value="all"${current === 'all' ? ' selected' : ''}>${escape(allLabel)}</option>`;
  return head + values.map((v) => `<option value="${escape(v)}"${v === current ? ' selected' : ''}>${escape(v)}</option>`).join('');
}

export function dealCard(d) {
  const pct = discountPct(d);
  return `<article class="card">
  <div class="card-top"><span class="cat">${escape(d.category)}</span><span class="verdict ${verdictClass(d.verdict)}">${escape(d.verdict)}</span></div>
  <h3><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h3>
  <p class="store">${escape(d.store)}</p>
  <p class="prices"><span class="now">${usd(d.price)}</span> <s class="was">${usd(d.was)}</s> <span class="pct">−${pct}%</span></p>
  <p class="save">Save ${usd(saving(d))}</p>
  <p class="meta">Checked ${checkedShort()} · Source: ${escape(d.source)}</p>
  <p class="actions"><a class="store-link" href="${escape(d.url)}" rel="noopener" target="_blank">View at ${escape(d.store)} ↗</a></p>
</article>`;
}

export function filterBar(state) {
  const categories = uniqueValues(deals, 'category');
  const stores = uniqueValues(deals, 'store');
  const verdicts = ['ALL-TIME LOW', 'STRONG DEAL', 'ROUTINE SALE'];
  const bandOptions = DISCOUNT_BANDS.map(
    (b) => `<option value="${b.id}"${b.id === state.band ? ' selected' : ''}>${escape(b.label)}</option>`,
  ).join('');
  const sortOptions = SORTS.map(
    (s) => `<option value="${s.id}"${s.id === state.sort ? ' selected' : ''}>${escape(s.label)}</option>`,
  ).join('');
  return `<form class="filters" id="filters" action="#/" method="get">
  <label class="search-label">Search <input id="q" type="search" name="q" value="${escape(state.query)}" placeholder="Try “headphones”, “TV”, “LEGO”…"></label>
  <label>Category <select id="category">${options(categories, state.category, 'All categories')}</select></label>
  <label>Store <select id="store">${options(stores, state.store, 'All stores')}</select></label>
  <label>Discount <select id="band">${bandOptions}</select></label>
  <label>Verdict <select id="verdict">${options(verdicts, state.verdict, 'All verdicts')}</select></label>
  <label>Sort <select id="sort">${sortOptions}</select></label>
  <button type="button" id="clear-filters">Clear</button>
</form>`;
}

export function listPage(state, shown, total) {
  const counts = countByVerdict(deals);
  const summary = `<p class="summary"><strong>${shown.length} of ${total} deals</strong> · checked ${checkedShort()} · ${counts['ALL-TIME LOW'] || 0} all-time lows · ${counts['STRONG DEAL'] || 0} strong deals · ${counts['ROUTINE SALE'] || 0} routine sales</p>`;
  const cards = shown.length === 0
    ? '<p class="empty">No deal matches those filters. Clear the search or pick a wider discount band.</p>'
    : `<div class="grid">${shown.map(dealCard).join('')}</div>`;
  return `<h1>Black Friday deals, checked today</h1>
<p class="lede">48 real Black Friday and Cyber Monday prices, each read at its store or in a named deals roundup on 27 Nov 2026. Every card shows the sale price, the usual price, the discount, the verdict and when it was checked.</p>
${filterBar(state)}
${summary}
${cards}`;
}

export function detailPage(d) {
  const pct = discountPct(d);
  const same = deals.filter((x) => x.title === d.title && x.id !== d.id);
  const compare = same.length === 0
    ? ''
    : `<section class="compare"><h2>Same product, other store</h2><ul>${same
        .map((x) => `<li><a href="#/deal/${encodeURIComponent(x.id)}">${escape(x.store)} — ${usd(x.price)} (${discountPct(x)}% off)</a></li>`)
        .join('')}</ul></section>`;
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <div class="card-top"><span class="cat">${escape(d.category)}</span><span class="verdict ${verdictClass(d.verdict)}">${escape(d.verdict)}</span></div>
  <h1>${escape(d.title)}</h1>
  <p class="prices big"><span class="now">${usd(d.price)}</span> <s class="was">${usd(d.was)}</s> <span class="pct">−${pct}%</span></p>
  <p class="save">You save ${usd(saving(d))} off the usual price.</p>
  <dl>
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Verdict</dt><dd><strong>${escape(d.verdict)}</strong> — ${escape(d.evidence)}</dd>
    <dt>Checked</dt><dd>${checkedShort()}</dd>
    <dt>Price read in</dt><dd>${escape(d.source)}</dd>
  </dl>
  <p><a class="store-link big-link" href="${escape(d.url)}" rel="noopener" target="_blank">View at ${escape(d.store)} ↗</a></p>
</article>
${compare}`;
}

export function missingPage() {
  return `<h1>Deal not found</h1><p>There is no deal at this address. <a href="#/">See all 48 deals</a>.</p>`;
}
