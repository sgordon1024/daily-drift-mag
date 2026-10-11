/* Scroll-linked depth only: no autoplay, scroll interception or perpetual loop. */
(() => {
  const scene = document.querySelector('.immersive-cover');
  if (!scene) return;
  const layers = [...scene.querySelectorAll('[data-depth]')];
  const button = scene.querySelector('.cover-motion');
  if (!layers.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false, visible = true, frame = 0;
  function paint() {
    frame = 0;
    const active = !paused && !reduced.matches;
    scene.dataset.motion = active ? 'active' : 'still';
    if (button) {
      button.hidden = reduced.matches;
      button.textContent = paused ? 'Resume motion' : 'Pause motion';
      button.setAttribute('aria-pressed', String(paused));
    }
    const box = scene.getBoundingClientRect();
    const progress = active ? Math.max(0, Math.min(1, -box.top / box.height)) : 0;
    const scale = innerWidth < 761 ? .42 : 1;
    for (const layer of layers) {
      const y = Number(layer.dataset.depth) * progress * scale;
      const x = Number(layer.dataset.drift || 0) * progress * scale;
      const angle = Number(layer.dataset.turn || 0) * progress;
      layer.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${angle.toFixed(2)}deg)`;
    }
  }
  function queue() { if (!frame && visible) frame = requestAnimationFrame(paint); }
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue, { passive: true });
  reduced.addEventListener('change', paint);
  button?.addEventListener('click', () => { paused = !paused; paint(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) queue(); }, { rootMargin: '100px' }).observe(scene);
  }
  paint();
})();
