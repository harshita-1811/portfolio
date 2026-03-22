const sticker = document.getElementById('globalSticker');
    const spot1 = document.getElementById('spot1');
    const spot2 = document.getElementById('spot2');
    const aboutSec = document.getElementById('about');

    // Easing function for smoother animated travel
    const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    function renderSticker() {
      // Kill animation for mobile devices (keep them static)
      if (window.innerWidth <= 768) return;

      const r1 = spot1.getBoundingClientRect();
      const r2 = spot2.getBoundingClientRect();

      // Calculate progress based on scroll distance to the second section
      // 'aboutSec.offsetTop' is the total pixel distance down the page.
      let maxScroll = aboutSec.offsetTop;

      // Handle edge case if sections lack absolute offset (should not happen here)
      if (maxScroll <= 0) maxScroll = window.innerHeight;

      let progress = window.scrollY / maxScroll;
      progress = Math.max(0, Math.min(1, progress));

      // Apply easing so the travel starts slowly, speeds up, and settles smoothly
      let p = easeInOutQuad(progress);

      // Interpolate position and size
      const currentLeft = r1.left + (r2.left - r1.left) * p;
      const currentTop = r1.top + (r2.top - r1.top) * p;
      const currentWidth = r1.width + (r2.width - r1.width) * p;

      // We use transform translate for better performance than top/left repaints
      sticker.style.transform = `translate(${currentLeft}px, ${currentTop}px)`;
      sticker.style.width = currentWidth + 'px';
    }

    window.addEventListener('scroll', renderSticker, { passive: true });
    window.addEventListener('resize', renderSticker, { passive: true });
    // Initial render
    renderSticker();
    // Give time for images to load, then re-render
    window.onload = renderSticker;

    // REEL CAROUSEL LOGIC
    const reelsContainer = document.getElementById('reelsContainer');
    const reelTrack = document.getElementById('reelTrack');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    let autoScrollInterval;

    // Clone the items dynamically to create a continuous seamless loop buffer map
    const originalItems = Array.from(reelTrack.children);
    const visibleCount = window.innerWidth <= 768 ? 2 : 4;
    // Clone enough items to span precisely one full viewing width
    for (let i = 0; i < visibleCount + 1; i++) {
      if (originalItems[i]) reelTrack.appendChild(originalItems[i].cloneNode(true));
    }
    const realTrackWidth = () => originalItems.reduce((acc, item) => acc + item.offsetWidth, 0) + (parseInt(window.getComputedStyle(reelTrack).gap) * originalItems.length);

    function getScrollStep() {
      const reelItem = document.querySelector('.reel-item');
      if (!reelItem) return 0;
      const style = window.getComputedStyle(reelTrack);
      const gap = parseInt(style.gap) || 0;
      return reelItem.offsetWidth + gap;
    }

    function scrollNext() {
      const step = getScrollStep();
      const trueWidth = realTrackWidth();

      // If shifted bounds reaches mathematically past original track length, safely fake reset natively
      if (reelsContainer.scrollLeft > trueWidth - 10) {
        // Instantly reset the scroll position back smoothly to perfectly matched visual block!
        reelsContainer.scrollTo({ left: reelsContainer.scrollLeft - trueWidth, behavior: 'instant' });
        // Execute smooth scrolling sequentially into exact next loop position
        requestAnimationFrame(() => reelsContainer.scrollBy({ left: step, behavior: 'smooth' }));
      } else {
        reelsContainer.scrollBy({ left: step, behavior: 'smooth' });
      }
    }

    function scrollPrev() {
      const trueWidth = realTrackWidth();
      if (reelsContainer.scrollLeft <= 10) {
        reelsContainer.scrollTo({ left: reelsContainer.scrollLeft + trueWidth, behavior: 'instant' });
        requestAnimationFrame(() => reelsContainer.scrollBy({ left: -getScrollStep(), behavior: 'smooth' }));
      } else {
        reelsContainer.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      }
    }

    // Bind arrows for desktop users
    if (btnNext) btnNext.addEventListener('click', () => { scrollNext(); pauseAutoForInteraction(); });
    if (btnPrev) btnPrev.addEventListener('click', () => { scrollPrev(); pauseAutoForInteraction(); });

    // Polite Auto Rotation: Pause permanently if they hover/swipe, so they can cleanly intercept
    let autoRotationActive = true;
    function startAuto() {
      if (autoRotationActive) {
        autoScrollInterval = setInterval(scrollNext, 3000); // exactly 3 seconds gap
      }
    }

    function pauseAutoForInteraction() {
      autoRotationActive = false;
      clearInterval(autoScrollInterval);
    }

    reelsContainer.addEventListener('mouseenter', pauseAutoForInteraction);
    reelsContainer.addEventListener('touchstart', pauseAutoForInteraction, { passive: true });

    // Begin 
    startAuto();