if (!customElements.get("banner-logo")) {
  class BannerLogo extends HTMLElement {
    constructor() {
      super();

      this.logoWrapper = this.querySelector(".banner-logo__logo-inner");
      this.logo = this.querySelector(".banner-logo__logo");
      this.header = document.querySelector(".site-header");

      this.classes = {
        scaling: "header-logo-scaling",
      };
      this.initialized = false;
    }

    connectedCallback() {
      if (!this.logoWrapper) {
        return;
      }

      this.init();
      window.addEventListener("resize", debounce(this.init.bind(this), 100));
      window.addEventListener("scroll", () => {
        window.requestAnimationFrame(() => this.scrollAnimation());
      });
    }

    calculateMaxScale() {
      const headerEl = document.querySelector(".site-header"),
        computedStyle = window.getComputedStyle(headerEl);

      let logoWidth = computedStyle.getPropertyValue("--logo-mobile-width"),
        ratio = 0.83;

      if (!window.FoxThemeSettings.isMobile) {
        logoWidth = computedStyle.getPropertyValue("--logo-width");
        ratio = 0.58;
      }

      logoWidth = parseInt(logoWidth.trim());

      return (document.body.clientWidth / logoWidth) * ratio; // maxScale.
    }

    init() {
      this.maxScale = this.calculateMaxScale();
      this.scrollAnimation();

      if (!this.initialized) {
        this.logoWrapper.classList.remove("invisible");
        typeof this.logoWrapper.refreshAnimation === "function" &&
          this.logoWrapper.refreshAnimation();
        this.initialized = true;
      }
    }

    scrollAnimation() {
      const scrollTop = window.scrollY;
      const scrollTarget = this.offsetTop + this.logoWrapper.offsetTop + 70;
      const scaleRatio = scrollTop / scrollTarget;
      const scaleValue = Math.max(
        1,
        this.maxScale - scaleRatio * this.maxScale
      );

      if (this.logo) {
        this.logo.style.transform = `scale(${scaleValue})`;
      }

      if (scaleValue <= 1) {
        this.header.headerSection.classList.remove(this.classes.scaling);
        this.logo.style.setProperty("opacity", 0);
      } else {
        this.header.headerSection.classList.add(this.classes.scaling);
        this.logo.style.setProperty("opacity", 1);
      }
    }
  }
  customElements.define("banner-logo", BannerLogo);
}

if (!customElements.get("banner-countdown")) {
  customElements.define(
    "banner-countdown",
    class BannerCountdown extends HTMLElement {
      connectedCallback() {
        window.clearInterval(this.intervalId);
        this.elements = {
          days: this.querySelector("[data-countdown-days]"),
          hours: this.querySelector("[data-countdown-hours]"),
          minutes: this.querySelector("[data-countdown-minutes]"),
          seconds: this.querySelector("[data-countdown-seconds]"),
        };
        this.targetTime = this.getTargetTime();
        this.update();
        this.intervalId = this.targetTime
          ? window.setInterval(() => this.update(), 1000)
          : null;
      }

      disconnectedCallback() {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
      }

      getTargetTime() {
        const date = this.dataset.endDate || "";
        const time = this.dataset.endTime || "00:00";
        const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        const timeMatch = time.match(/^(\d{2}):(\d{2})$/);

        if (!dateMatch || !timeMatch) {
          return null;
        }

        const target = new Date(
          Number(dateMatch[1]),
          Number(dateMatch[2]) - 1,
          Number(dateMatch[3]),
          Number(timeMatch[1]),
          Number(timeMatch[2]),
          0
        );

        if (
          target.getFullYear() !== Number(dateMatch[1]) ||
          target.getMonth() !== Number(dateMatch[2]) - 1 ||
          target.getDate() !== Number(dateMatch[3]) ||
          target.getHours() !== Number(timeMatch[1]) ||
          target.getMinutes() !== Number(timeMatch[2])
        ) {
          return null;
        }

        return target.getTime();
      }

      update() {
        const remaining = Math.max(0, (this.targetTime || 0) - Date.now());
        const days = Math.floor(remaining / 86400000);
        const hours = Math.floor((remaining % 86400000) / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        this.setValue(this.elements.days, days);
        this.setValue(this.elements.hours, hours);
        this.setValue(this.elements.minutes, minutes);
        this.setValue(this.elements.seconds, seconds);

        if (remaining === 0 && this.intervalId) {
          window.clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }

      setValue(element, value) {
        if (element) {
          element.textContent = String(value).padStart(2, "0");
        }
      }
    }
  );
}
