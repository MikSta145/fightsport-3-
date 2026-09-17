(function () {
  "use strict";

  if (window.FSMobileNav && window.FSMobileNav.initialized) return;

  const drawer = document.getElementById("mobileDrawer");
  if (!drawer) return;

  const panel = drawer.querySelector(".fs-mobile-panel");
  const closeButton = drawer.querySelector(".fs-mobile-close");
  const triggerSelector = "[data-open-mobile]";
  let scrollY = 0;
  let lastTrigger = null;

  function accordionPanel(button) {
    const id = button && button.getAttribute("data-fs-mobile-toggle");
    return id ? document.getElementById(id) : null;
  }

  function setAccordion(button, open) {
    const panelNode = accordionPanel(button);
    if (!panelNode) return;
    button.setAttribute("aria-expanded", open ? "true" : "false");
    panelNode.setAttribute("aria-hidden", open ? "false" : "true");
    panelNode.classList.toggle("is-open", open);
    button.classList.toggle("is-open", open);
    /* Prevent keyboard focus from entering visually collapsed accordions. */
    if ("inert" in panelNode) panelNode.inert = !open;
  }

  function collapseAll() {
    drawer.querySelectorAll("[data-fs-mobile-toggle]").forEach(function (button) {
      setAccordion(button, false);
    });
  }

  function toggleAccordion(button) {
    const open = button.getAttribute("aria-expanded") === "true";
    const level = button.getAttribute("data-fs-mobile-level");
    if (!open && level) {
      drawer.querySelectorAll('[data-fs-mobile-level="' + level + '"]').forEach(function (other) {
        if (other !== button) setAccordion(other, false);
      });
    }
    setAccordion(button, !open);
  }

  function lockScroll() {
    if (document.body.classList.contains("mobile-menu-open")) return;
    scrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = "-" + scrollY + "px";
    document.body.classList.add("mobile-menu-open");
  }

  function unlockScroll() {
    if (!document.body.classList.contains("mobile-menu-open")) return;
    document.body.classList.remove("mobile-menu-open");
    document.body.style.top = "";
    window.scrollTo(0, scrollY);
  }

  function setTriggerState(open) {
    document.querySelectorAll(triggerSelector).forEach(function (button) {
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function open(trigger) {
    if (drawer.classList.contains("open")) return;
    lastTrigger = trigger || document.activeElement;
    collapseAll();
    lockScroll();
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    setTriggerState(true);
    requestAnimationFrame(function () {
      if (closeButton) closeButton.focus({ preventScroll: true });
      else if (panel) panel.focus({ preventScroll: true });
    });
  }

  function close(options) {
    const opts = options || {};
    if (!drawer.classList.contains("open") && !document.body.classList.contains("mobile-menu-open")) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    setTriggerState(false);
    collapseAll();
    unlockScroll();
    if (opts.restoreFocus !== false && lastTrigger && typeof lastTrigger.focus === "function") {
      requestAnimationFrame(function () { lastTrigger.focus({ preventScroll: true }); });
    }
  }

  function focusableElements() {
    if (!panel) return [];
    return Array.from(panel.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(function (element) {
        if (element.closest('[aria-hidden="true"]')) return false;
        const style = window.getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden";
      });
  }

  /* Initialize accordion accessibility state even before first open. */
  collapseAll();
  setTriggerState(false);

  document.addEventListener("click", function (event) {
    const opener = event.target.closest(triggerSelector);
    if (opener) {
      event.preventDefault();
      open(opener);
      return;
    }

    const closer = event.target.closest("[data-close-mobile]");
    if (closer && drawer.contains(closer)) {
      event.preventDefault();
      close();
      return;
    }

    const toggle = event.target.closest("[data-fs-mobile-toggle]");
    if (toggle && drawer.contains(toggle)) {
      event.preventDefault();
      toggleAccordion(toggle);
      return;
    }

    const navLink = event.target.closest(".fs-mobile-menu a[href]");
    if (navLink && drawer.contains(navLink)) close({ restoreFocus: false });
  });

  document.addEventListener("keydown", function (event) {
    if (!drawer.classList.contains("open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "Tab") {
      const focusable = focusableElements();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 860 && drawer.classList.contains("open")) close({ restoreFocus: false });
  }, { passive: true });

  window.FSMobileNav = {
    initialized: true,
    open: open,
    close: close,
    collapseAll: collapseAll
  };
}());
