// Venue: reveal on scroll (gold frame draws itself, mandapam line-art is drawn, text rises),
// the live Google map is only loaded when the section comes near, and the illustrated map stays
// underneath as a fallback when there is no network.
export function createVenue(section) {
  const frame = section.querySelector('.vn-map');
  const iframe = section.querySelector('iframe');
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (e.isIntersecting) {
        section.classList.add('in');
        if (!iframe.src) iframe.src = iframe.dataset.src;
      }
    }
  }, { rootMargin: '0px 0px -20% 0px', threshold: 0.15 });
  io.observe(section);
  iframe.addEventListener('load', () => frame.classList.add('live'));
  return { reveal: () => { section.classList.add('in'); } };
}
