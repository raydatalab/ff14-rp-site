/* Shared progressive enhancement; image information remains available without JS. */
(() => {
  const mark = image => {
    if (image.dataset.failureBound) return;
    image.dataset.failureBound = 'true';
    image.addEventListener('error', () => {
      const slot = image.closest('.img-slot');
      if (slot) { slot.classList.add('is-failed'); slot.dataset.fail ||= '这张照片暂时没有加载出来'; }
    });
  };
  const stamps = new WeakSet();
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-stamped'); observer.unobserve(entry.target); }
  }), { threshold: .3 }) : null;
  const bind = root => {
    root.querySelectorAll('img').forEach(mark);
    root.querySelectorAll('.ticket .stamp').forEach(stamp => {
      if (!stamps.has(stamp)) { stamps.add(stamp); observer?.observe(stamp); }
    });
  };
  bind(document);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType === 1) { if (node.matches('img')) mark(node); bind(node); }
  }))).observe(document.body, {childList:true,subtree:true});
})();
