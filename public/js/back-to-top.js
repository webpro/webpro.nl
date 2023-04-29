(() => {
  const button = document.querySelector('.back-to-top');

  if (button) {
    const onClick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          button.style.display = window.pageYOffset > 500 ? 'block' : 'none';
          ticking = false;
        });
        ticking = true;
      }
    };

    button.addEventListener('click', onClick);

    window.addEventListener('scroll', onScroll);
  }
})();
