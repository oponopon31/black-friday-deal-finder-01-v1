// Boot and routing for the deal finder. Two routes:
//
//   #/            the deal list, with search and filters
//   #/deal/<id>   one deal, with its verdict and evidence
//
// Filter state lives in the URL query string, so a filtered view (for
// example #/?store=Best+Buy) can be shared and reloaded. window.__shotReady
// is false while a page renders and true once it is on screen, so a
// screenshot script knows when to capture.

import { CHECKED_LABEL, deals } from './data.js';
import { visibleDeals } from './filters.js';
import { detailPage, listPage, missingPage } from './views.js';

const app = document.getElementById('app');
const countLine = document.getElementById('count-line');

// Whether the search box should get focus back after a re-render. It
// starts true (the search box is the first thing a shopper uses) and is
// then set from where the focus actually was, so changing a select does
// not yank focus back into the search box.
let keepSearchFocus = true;

function defaultState() {
  return { query: '', category: 'all', store: 'all', band: 'all', verdict: 'all', sort: 'biggest-pct' };
}

function stateFromHash() {
  const state = defaultState();
  const raw = location.hash.split('?')[1] || '';
  const params = new URLSearchParams(raw);
  if (params.get('q')) state.query = params.get('q');
  if (params.get('category')) state.category = params.get('category');
  if (params.get('store')) state.store = params.get('store');
  if (params.get('band')) state.band = params.get('band');
  if (params.get('verdict')) state.verdict = params.get('verdict');
  if (params.get('sort')) state.sort = params.get('sort');
  return state;
}

function stateToQuery(state) {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (state.category !== 'all') params.set('category', state.category);
  if (state.store !== 'all') params.set('store', state.store);
  if (state.band !== 'all') params.set('band', state.band);
  if (state.verdict !== 'all') params.set('verdict', state.verdict);
  if (state.sort !== 'biggest-pct') params.set('sort', state.sort);
  const text = params.toString();
  return text ? `?${text}` : '';
}

function readStateFromForm() {
  const get = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };
  return {
    query: get('q'),
    category: get('category'),
    store: get('store'),
    band: get('band'),
    verdict: get('verdict'),
    sort: get('sort'),
  };
}

function renderList(state) {
  const shown = visibleDeals(deals, state);
  document.title = 'Black Friday Deal Finder — 48 checked deals';
  app.innerHTML = listPage(state, shown, deals.length);
  countLine.textContent = `${deals.length} deals · checked ${CHECKED_LABEL}`;
  const form = document.getElementById('filters');
  const refresh = () => {
    const searchBox = document.getElementById('q');
    keepSearchFocus = document.activeElement === searchBox;
    const next = readStateFromForm();
    history.replaceState(null, '', `#/${stateToQuery(next)}`);
    render();
  };
  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  document.getElementById('clear-filters').addEventListener('click', () => {
    history.replaceState(null, '', '#/');
    render();
  });
  const search = document.getElementById('q');
  if (keepSearchFocus) {
    search.focus();
    search.setSelectionRange(search.value.length, search.value.length);
  }
}

function renderDetail(id) {
  const found = deals.find((d) => d.id === decodeURIComponent(id));
  document.title = `${found ? found.title : 'Not found'} | Black Friday Deal Finder`;
  app.innerHTML = found ? detailPage(found) : missingPage();
  countLine.textContent = `${deals.length} deals · checked ${CHECKED_LABEL}`;
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) renderDetail(match[1]);
  else renderList(stateFromHash());
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
