(function () {
  "use strict";

  const shell = document.getElementById("fsJumpShell");
  const bar = document.getElementById("homeJumpBar");
  const header = document.querySelector(".site-header");

  if (!shell || !bar || !header) return;

  let ticking = false;
  let shellTop = 0;
  let barHeight = 0;

  function visibleHeaderBottom() {
    const rect = header.getBoundingClientRect();

    // Header całkowicie zjechał do góry -> pasek ma być przy top: 0.
    if (rect.bottom <= 0) return 0;

    // Header jest widoczny/sticky/ częściowo widoczny.
    // Używamy realnej dolnej krawędzi w viewport coordinates.
    return Math.max(0, Math.round(rect.bottom));
  }

  function measure() {
    const wasFixed = shell.classList.contains("fs-jump-is-fixed");

    if (wasFixed) {
      shell.classList.remove("fs-jump-is-fixed");
    }

    barHeight = Math.round(bar.getBoundingClientRect().height);
    shell.style.height = barHeight + "px";

    const rect = shell.getBoundingClientRect();
    shellTop = Math.round(rect.top + window.scrollY);

    if (wasFixed) {
      shell.classList.add("fs-jump-is-fixed");
    }
  }

  function sync() {
    ticking = false;

    const fixedTop = visibleHeaderBottom();
    document.documentElement.style.setProperty(
      "--fs-jump-fixed-top",
      fixedTop + "px"
    );

    document.documentElement.style.setProperty(
      "--fs-live-scroll-offset",
      (fixedTop + barHeight + 14) + "px"
    );

    // Fixujemy pasek dokładnie wtedy, gdy jego naturalna pozycja
    // doszłaby do miejsca pod aktualnie widocznym headerem.
    const shouldFix = window.scrollY + fixedTop >= shellTop;

    if (shouldFix) {
      shell.classList.add("fs-jump-is-fixed");
      bar.setAttribute("data-fs-fixed", "true");
    } else {
      shell.classList.remove("fs-jump-is-fixed");
      bar.setAttribute("data-fs-fixed", "false");
    }
  }

  function requestSync() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(sync);
  }

  function recalc() {
    measure();
    sync();
  }

  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", recalc, { passive: true });
  window.addEventListener("orientationchange", function () {
    window.setTimeout(recalc, 120);
  }, { passive: true });

  window.addEventListener("load", function () {
    recalc();
    window.setTimeout(recalc, 180);
  }, { once: true });

  document.addEventListener("click", function (event) {
    if (event.target.closest(
      ".fs-mobile-close, .fs-mobile-overlay, [data-fs-mobile-nav-link]"
    )) {
      window.setTimeout(recalc, 320);
    }
  });

  recalc();

  window.FSStickyJumpBar = {
    recalc: recalc,
    sync: sync
  };
}());
