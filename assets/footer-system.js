(() => {
  const footers = document.querySelectorAll('[data-premium-footer]');
  if (!footers.length) return;

  document.querySelectorAll('[data-footer-year]').forEach((year) => {
    year.textContent = new Date().getFullYear();
  });

  const canMove = window.matchMedia('(pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canMove) return;

  footers.forEach((footer) => {
    const cards = footer.querySelectorAll('[data-footer-glass]');

    footer.addEventListener('pointermove', (event) => {
      const footerRect = footer.getBoundingClientRect();
      const footerX = ((event.clientX - footerRect.left) / footerRect.width) * 100;
      const footerY = ((event.clientY - footerRect.top) / footerRect.height) * 100;
      footer.style.setProperty('--pf-x', `${footerX}%`);
      footer.style.setProperty('--pf-y', `${footerY}%`);

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--card-x', `${x}%`);
        card.style.setProperty('--card-y', `${y}%`);
      });
    }, { passive: true });
  });
})();
