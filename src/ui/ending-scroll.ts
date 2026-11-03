type ScrollMetrics = Pick<HTMLElement, 'scrollHeight' | 'clientHeight' | 'scrollTop'>;

export function hasMoreEndingContent({ scrollHeight, clientHeight, scrollTop }: ScrollMetrics): boolean {
  return clientHeight > 0 && scrollHeight - clientHeight - Math.max(0, scrollTop) > 2;
}

/** Rebind after rendering; keep the card's and Gallery's existing scroll containers. */
export function attachEndingScrollCues(root: HTMLElement, reducedMotion: () => boolean): () => void {
  const cleanups: Array<() => void> = [];
  for (const cue of root.querySelectorAll<HTMLButtonElement>('[data-ending-scroll]')) {
    const target = cue.dataset.endingScroll === 'gallery'
      ? cue.closest<HTMLElement>('.gallery-dialog')
      : cue.closest('.ending-card')?.querySelector<HTMLElement>('.ending-reading-scroll');
    if (!target) continue;
    const update = () => {
      const more = hasMoreEndingContent(target);
      if (!more && document.activeElement === cue) target.focus({ preventScroll: true });
      cue.hidden = !more;
    };
    const scroll = () => target.scrollBy({
      top: Math.max(120, target.clientHeight * .7),
      behavior: reducedMotion() ? 'instant' : 'smooth',
    });
    const observer = new ResizeObserver(update);
    observer.observe(target);
    for (const content of target.children) observer.observe(content);
    const reading = target.querySelector('.ending-reading-scroll');
    if (reading) for (const content of reading.children) observer.observe(content);
    target.addEventListener('scroll', update, { passive: true });
    target.addEventListener('toggle', update, true);
    window.addEventListener('resize', update);
    cue.addEventListener('click', scroll);
    const frame = requestAnimationFrame(update);
    cleanups.push(() => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      target.removeEventListener('scroll', update);
      target.removeEventListener('toggle', update, true);
      window.removeEventListener('resize', update);
      cue.removeEventListener('click', scroll);
    });
  }
  return () => cleanups.forEach(cleanup => cleanup());
}
