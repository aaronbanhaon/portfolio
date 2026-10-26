const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const themeToggle = document.querySelector(".theme-toggle");
const year = document.querySelector("#current-year");
const marquee = document.querySelector(".hero-marquee");
const marqueeTrack = marquee?.querySelector(".hero-marquee-track");
const marqueeGroups = marqueeTrack?.querySelectorAll(".hero-marquee-group");
const STORAGE_KEY = "janlie-theme";
const root = document.documentElement;
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const updateThemeToggle = (theme) => {
  const isDark = theme === "dark";
  const icon = themeToggle?.querySelector(".theme-toggle-icon");
  const label = themeToggle?.querySelector(".theme-toggle-text");

  if (icon) {
    icon.textContent = isDark ? "☾" : "☀";
  }

  if (label) {
    label.textContent = isDark ? "DARK" : "LIGHT";
  }

  if (themeToggle) {
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.setAttribute("aria-pressed", String(isDark));
  }
};

const applyTheme = (theme) => {
  const resolvedTheme = theme === "dark" ? "dark" : "light";
  root.setAttribute("data-theme", resolvedTheme);
  updateThemeToggle(resolvedTheme);
};

const getPreferredTheme = () => {
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return mediaQuery.matches ? "dark" : "light";
};

if (year) {
  year.textContent = new Date().getFullYear();
}

if (themeToggle) {
  const theme = getPreferredTheme();
  applyTheme(theme);

  themeToggle.addEventListener("click", () => {
    const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  });

  const handleSystemChange = (event) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(event.matches ? "dark" : "light");
    }
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleSystemChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleSystemChange);
  }
}

if (marquee && marqueeGroups?.length === 2) {
  const [firstGroup, secondGroup] = marqueeGroups;
  const originalItem = firstGroup.firstElementChild;

  if (originalItem) {
    const fillMarquee = () => {
      while (firstGroup.children.length > 1) {
        firstGroup.lastElementChild.remove();
      }

      do {
        firstGroup.append(originalItem.cloneNode(true));
      } while (firstGroup.scrollWidth < marquee.clientWidth + originalItem.getBoundingClientRect().width);

      secondGroup.replaceChildren(...Array.from(firstGroup.children, (item) => item.cloneNode(true)));
    };

    fillMarquee();

    if ("ResizeObserver" in window) {
      new ResizeObserver(fillMarquee).observe(marquee);
    } else {
      window.addEventListener("resize", fillMarquee);
    }
  }
}

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox?.querySelector(".lightbox-image");
const lightboxCaption = lightbox?.querySelector(".lightbox-caption");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const lightboxPrevious = lightbox?.querySelector(".lightbox-previous");
const lightboxNext = lightbox?.querySelector(".lightbox-next");
const archiveImages = Array.from(document.querySelectorAll(".gallery img[data-lightbox]"));
let activeImageIndex = -1;

if (
  lightbox instanceof HTMLDialogElement &&
  lightboxImage instanceof HTMLImageElement &&
  lightboxCaption &&
  lightboxClose &&
  lightboxPrevious &&
  lightboxNext &&
  archiveImages.length
) {
  const showImage = (index) => {
    activeImageIndex = (index + archiveImages.length) % archiveImages.length;
    const image = archiveImages[activeImageIndex];
    const figure = image.closest("figure");
    const caption = figure?.querySelector("figcaption")?.textContent?.trim();

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = caption || image.alt;
  };

  archiveImages.forEach((image, index) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `View full-size image: ${image.alt}`);

    const openImage = () => {
      showImage(index);
      lightbox.showModal();
      lightboxClose.focus();
    };

    image.addEventListener("click", openImage);
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openImage();
      }
    });
  });

  lightboxClose.addEventListener("click", () => lightbox.close());
  lightboxPrevious.addEventListener("click", () => showImage(activeImageIndex - 1));
  lightboxNext.addEventListener("click", () => showImage(activeImageIndex + 1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      lightbox.close();
    }
  });

  lightbox.addEventListener("close", () => {
    archiveImages[activeImageIndex]?.focus();
  });

  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showImage(activeImageIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showImage(activeImageIndex + 1);
    }
  });
}

const measuredElements = document.querySelectorAll([
  ".hero-topline",
  ".hero-copy h1",
  ".hero-bottom p",
  ".hero-meta > div",
  ".hero-photo",
  ".hero-marquee",
  ".section-heading",
  ".about-copy",
  ".gallery-item",
  ".education-card",
  ".skills-panel",
  ".timeline-header",
  ".experience-item",
  ".info-card",
  ".project-card",
  ".contact-cta",
  ".social-links",
  ".site-footer",
].join(", "));

if (measuredElements.length) {
  const measurements = new Map();
  const pendingMeasurements = new Set();
  let measurementFrame = 0;

  const updateMeasurements = (elements) => {
    const updates = elements.map((element) => {
      const labels = measurements.get(element);
      if (!labels) {
        return null;
      }

      return {
        ...labels,
        width: element.offsetWidth,
        height: element.offsetHeight,
      };
    }).filter(Boolean);

    updates.forEach(({ widthLabel, heightLabel, width, height }) => {
      const widthText = `W ${width} px`;
      const heightText = `H ${height} px`;

      if (widthLabel.textContent !== widthText) {
        widthLabel.textContent = widthText;
      }
      if (heightLabel.textContent !== heightText) {
        heightLabel.textContent = heightText;
      }
    });
  };

  const scheduleMeasurementUpdate = (elements) => {
    elements.forEach((element) => pendingMeasurements.add(element));
    if (measurementFrame) {
      return;
    }

    measurementFrame = requestAnimationFrame(() => {
      measurementFrame = 0;
      const pendingElements = Array.from(pendingMeasurements);
      pendingMeasurements.clear();
      updateMeasurements(pendingElements);
    });
  };

  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver((entries) => {
    scheduleMeasurementUpdate(entries.map(({ target }) => target));
  }) : null;

  measuredElements.forEach((element) => {
    if (window.getComputedStyle(element).position === "static") {
      element.style.position = "relative";
    }

    const overlay = document.createElement("span");
    overlay.className = "measure-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const horizontalRule = document.createElement("span");
    horizontalRule.className = "measure-horizontal";
    const horizontalLabel = document.createElement("span");
    horizontalLabel.className = "measure-label measure-label-horizontal";

    const verticalRule = document.createElement("span");
    verticalRule.className = "measure-vertical";
    const verticalLabel = document.createElement("span");
    verticalLabel.className = "measure-label measure-label-vertical";

    overlay.append(horizontalRule, horizontalLabel, verticalRule, verticalLabel);
    element.append(overlay);
    measurements.set(element, { widthLabel: horizontalLabel, heightLabel: verticalLabel });
    resizeObserver?.observe(element);
  });

  scheduleMeasurementUpdate(measuredElements);

  if (!resizeObserver) {
    window.addEventListener("resize", () => scheduleMeasurementUpdate(measuredElements), { passive: true });
  }
}

if (menuToggle && navigation) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuToggle.focus();
    }
  });
}
