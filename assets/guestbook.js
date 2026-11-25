(() => {
  'use strict';
  const query = id => document.getElementById(id);
  const home = query('gb-home-quote');
  if (home) {
    const picks = JSON.parse(query('gb-home-picks').textContent);
    const days = Math.floor((Date.now() + 8 * 3600000) / 86400000);
    const pick = picks[days % picks.length];
    home.href = 'guestbook.html#' + pick.id;
    home.querySelector('q').textContent = pick.text;
    home.querySelector('span').textContent = pick.name + ' · ' + pick.world;
  }
  const box = query('gb-search');
  if (!box) return;
  const count = query('gb-count');
  const prev = query('gb-prev'), next = query('gb-next');
  const entries = [...document.querySelectorAll('[data-gb-entry]')].map(element => ({
    element,
    fields: [...element.querySelectorAll('[data-gb-field]')].map(node => ({ node, text: node.textContent }))
  }));
  const nights = [...document.querySelectorAll('[data-gb-night]')];
  const tabs = [...document.querySelectorAll('.gb-month-chip')].map(tab => ({
    tab, month: query(tab.hash.slice(1))
  }));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let matches = [], current = -1, composing = false, latestQuery = '', currentNight;
  const flash = target => {
    target.classList.remove('gb-anchor-flash');
    void target.offsetWidth;
    target.classList.add('gb-anchor-flash');
    setTimeout(() => target.classList.remove('gb-anchor-flash'), 435);
  };
  function updateCount() {
    count.textContent = !latestQuery ? '' : current < 0 ? '找到 ' + matches.length + ' 条' : (current + 1) + ' / ' + matches.length + ' 条';
    prev.disabled = next.disabled = matches.length === 0;
  }
  function search() {
    const needle = box.value.trim();
    if (needle === latestQuery) return;
    latestQuery = needle;
    query('gb-tools').classList.toggle('gb-tools--active', Boolean(needle));
    const pattern = needle && new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu');
    current = -1;
    matches = [];
    for (const {element, fields} of entries) {
      element.classList.remove('gb-current-match');
      let found = false;
      for (const {node, text} of fields) {
        if (!pattern) {
          node.textContent = text;
          continue;
        }
        const hits = [...text.matchAll(pattern)];
        found ||= hits.length > 0;
        if (!hits.length) {
          node.textContent = text;
          continue;
        }
        const fragment = document.createDocumentFragment();
        let end = 0;
        for (const hit of hits) {
          fragment.append(text.slice(end, hit.index));
          const mark = document.createElement('mark');
          mark.textContent = hit[0];
          fragment.append(mark);
          end = hit.index + hit[0].length;
        }
        fragment.append(text.slice(end));
        node.replaceChildren(fragment);
      }
      if (found) matches.push(element);
    }
    updateCount();
  }
  function move(direction) {
    if (!matches.length) return;
    matches[current]?.classList.remove('gb-current-match');
    current = current < 0 ? (direction > 0 ? 0 : matches.length - 1) : (current + direction + matches.length) % matches.length;
    const item = matches[current];
    item.classList.add('gb-current-match');
    item.scrollIntoView({ block: 'center', behavior: reduced.matches ? 'instant' : 'smooth' });
    updateCount();
  }
  let frame = 0;
  let activeTab = tabs.find(({tab}) => tab.hasAttribute('aria-current'));
  function setTab(selected) {
    if (!selected || activeTab === selected) return;
    activeTab?.tab.removeAttribute('aria-current');
    activeTab = selected;
    activeTab.tab.setAttribute('aria-current', 'location');
  }
  function anchor() {
    const target = query(location.hash.slice(1));
    if (target?.matches('[data-gb-entry]')) flash(target);
    if (target?.matches('[data-gb-night]')) currentNight = target;
    setTab(tabs.find(({month}) => month === target?.closest('.gb-month')));
  }
  function scheduleTabs() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const tools = query('gb-tools').getBoundingClientRect();
      const marker = Math.max(150, latestQuery ? tools.bottom + 112 : 150);
      let selected = tabs[0];
      for (const pair of tabs) {
        if (pair.month.getBoundingClientRect().top > marker) break;
        selected = pair;
      }
      setTab(selected);
    });
  }
  box.addEventListener('compositionstart', () => { composing = true; });
  box.addEventListener('compositionend', () => { composing = false; search(); });
  box.addEventListener('input', () => { if (!composing) search(); });
  box.addEventListener('keydown', event => {
    if (event.isComposing || composing || event.keyCode === 229) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      search();
      move(event.shiftKey ? -1 : 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      box.value = '';
      search();
    }
  });
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  query('gb-random').addEventListener('click', () => {
    const alternatives = nights.filter(night => night !== currentNight);
    const target = alternatives[Math.floor(Math.random() * alternatives.length)] || nights[0];
    currentNight = target;
    location.hash = target.id;
    target.focus({ preventScroll: true });
  });
  document.querySelector('[data-gb-tools]').hidden = false;
  addEventListener('hashchange', anchor);
  addEventListener('scroll', scheduleTabs, { passive: true });
  addEventListener('resize', scheduleTabs);
  anchor();
})();



