(() => {
  const clamp = (value, minimum = 0, maximum = 1) => Math.max(minimum, Math.min(maximum, value));

  class STFirmStageHOD {
    constructor({ root, screen, program }) {
      if (!root || !screen || !program) throw new Error("Stage HOD requires a story root, screen and production program.");
      this.root = root;
      this.screen = screen;
      this.program = program;
      this.lastState = null;
      this.profile = "laptop";
      this.preloadPromise = null;
      this.assetHealth = new Map();
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.coarsePointer = window.matchMedia("(pointer: coarse)");
      this.resizeObserver = typeof ResizeObserver === "function"
        ? new ResizeObserver(() => this.refreshProfile())
        : null;
      this.resizeObserver?.observe(screen);
      window.visualViewport?.addEventListener("resize", () => this.refreshProfile(), { passive: true });
      window.addEventListener("orientationchange", () => this.refreshProfile(), { passive: true });
      this.refreshProfile();
      root.dataset.hodController = "stage-hod";
      root.dataset.hodProgramVersion = program.version;
    }

    findTimedItem(items, time) {
      if (!Array.isArray(items) || !items.length) return null;
      const boundedTime = time >= this.program.duration ? this.program.duration - Number.EPSILON : Math.max(0, time);
      return items.find(item => boundedTime >= item.start && boundedTime < item.end) || null;
    }

    sceneForTime(time) {
      return this.findTimedItem(this.program.scenes, time) || this.program.scenes[this.program.scenes.length - 1];
    }

    chapterForTime(time) {
      return this.findTimedItem(this.program.chapters, time) || this.program.chapters[this.program.chapters.length - 1];
    }

    phaseForScene(scene, time) {
      return this.findTimedItem(scene?.phases, time);
    }

    parallelState(scene, time) {
      const result = {};
      Object.entries(scene?.parallelTracks || {}).forEach(([track, cues]) => {
        result[track] = this.findTimedItem(cues, time)?.id || "idle";
      });
      return result;
    }

    allowedOverlaps(scene, phase, time) {
      const overlaps = new Set(phase?.allowedOverlaps || []);
      (scene?.allowedOverlaps || []).forEach(entry => {
        if (typeof entry === "string") overlaps.add(entry);
        else if (time >= entry.start && time < entry.end) (entry.layers || []).forEach(layer => overlaps.add(layer));
      });
      return [...overlaps];
    }

    profileForSize(width, height) {
      const landscape = width > height;
      for (const profile of this.program.deviceProfiles) {
        const rule = profile.when || {};
        if (rule.landscape === true && !landscape) continue;
        if (Number.isFinite(rule.maxWidth) && width > rule.maxWidth) continue;
        if (Number.isFinite(rule.minWidth) && width < rule.minWidth) continue;
        if (Number.isFinite(rule.maxHeight) && height > rule.maxHeight) continue;
        return profile.id;
      }
      return "laptop";
    }

    refreshProfile() {
      const bounds = this.screen.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width || window.visualViewport?.width || window.innerWidth || 1024));
      const height = Math.max(1, Math.round(bounds.height || window.visualViewport?.height || window.innerHeight || 576));
      const nextProfile = this.profileForSize(width, height);
      this.profile = nextProfile;
      this.screen.dataset.hodProfile = nextProfile;
      this.screen.dataset.hodOrientation = width > height ? "landscape" : "portrait";
      this.screen.dataset.hodPointer = this.coarsePointer.matches ? "coarse" : "fine";
      this.screen.dataset.hodMotion = this.reducedMotion.matches ? "reduced" : "full";
      this.screen.style.setProperty("--hod-viewport-width", `${width}px`);
      this.screen.style.setProperty("--hod-viewport-height", `${height}px`);
      if (this.lastState) this.applyLayout(this.lastState);
    }

    layoutForPhase(phase) {
      if (!phase?.layout) return null;
      if (["small-phone", "phone", "landscape-phone"].includes(this.profile)) return phase.layout.phone || phase.layout.desktop || null;
      return phase.layout.desktop || phase.layout.phone || null;
    }

    resolve(time) {
      const scene = this.sceneForTime(time);
      const chapter = this.chapterForTime(time);
      const phase = this.phaseForScene(scene, time);
      const parallel = this.parallelState(scene, time);
      const transitionId = phase?.transition || scene?.transition || "none";
      const transition = this.program.transitions[transitionId] || { duration: 0, easing: "linear" };
      return {
        time: clamp(Number(time) || 0, 0, this.program.duration),
        duration: this.program.duration,
        chapter,
        scene,
        phase,
        parallel,
        profile: this.profile,
        transition: { id: transitionId, ...transition },
        primaryFrame: phase?.primaryFrame || null,
        primaryAsset: phase?.primaryAsset || scene?.primaryAsset || null,
        background: phase?.background || scene?.background?.theme || scene?.background || null,
        typography: this.program.typography[scene?.typography || "product"],
        allowedOverlaps: this.allowedOverlaps(scene, phase, time)
      };
    }

    applyLayout(state) {
      const layout = this.layoutForPhase(state.phase);
      const activeFrame = this.root.querySelector(".journey-frame.is-hod-primary");
      if (activeFrame && layout?.objectPosition) activeFrame.style.objectPosition = layout.objectPosition;
      this.screen.dataset.hodTextZone = layout?.textZone || "center";
    }

    applyJourneyFrame(state) {
      const journeyScene = this.root.querySelector(".story-journey-scene");
      if (!journeyScene) return;
      const frames = [...journeyScene.querySelectorAll(".journey-frame")];
      const expectedClass = state.primaryFrame ? `journey-frame-${state.primaryFrame}` : "";
      journeyScene.dataset.hodControlled = "true";
      journeyScene.dataset.hodPrimaryFrame = state.primaryFrame || "none";
      frames.forEach(frame => {
        const selected = Boolean(expectedClass && frame.classList.contains(expectedClass));
        frame.classList.toggle("is-hod-primary", selected);
        frame.dataset.hodVisible = String(selected);
        frame.setAttribute("aria-hidden", String(!selected));
      });
    }

    apply(state) {
      this.lastState = state;
      this.root.dataset.hodChapter = state.chapter?.id || "none";
      this.root.dataset.hodScene = state.scene?.id || "none";
      this.root.dataset.hodPhase = state.phase?.id || "none";
      this.root.dataset.hodStatus = "running";
      this.screen.dataset.hodChapter = state.chapter?.id || "none";
      this.screen.dataset.hodScene = state.scene?.id || "none";
      this.screen.dataset.hodPhase = state.phase?.id || "none";
      this.screen.dataset.hodTransition = state.transition.id;
      this.screen.dataset.hodBackground = typeof state.background === "string" ? state.background : "generated";
      this.screen.dataset.hodAkademieBeat = state.parallel.akademieVocal || "idle";
      this.screen.style.setProperty("--hod-transition-duration", `${state.transition.duration}s`);
      this.screen.style.setProperty("--hod-transition-easing", state.transition.easing);
      if (state.typography?.family) this.screen.style.setProperty("--hod-active-font", state.typography.family);
      this.applyJourneyFrame(state);
      this.applyLayout(state);
      window.__STFIRM_HOD_STATE__ = state;
      this.root.dispatchEvent(new CustomEvent("stfirm:hod-state", { detail: state }));
      return state;
    }

    stateAt(time) {
      return this.apply(this.resolve(time));
    }

    async loadAsset(src) {
      const image = new Image();
      image.decoding = "async";
      image.src = new URL(src, document.baseURI).href;
      try {
        if (typeof image.decode === "function") await image.decode();
        else await new Promise((resolve, reject) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", reject, { once: true });
        });
        const healthy = image.naturalWidth > 0 && image.naturalHeight > 0;
        this.assetHealth.set(src, { healthy, width: image.naturalWidth, height: image.naturalHeight });
      } catch {
        this.assetHealth.set(src, { healthy: false, width: 0, height: 0 });
      }
      return this.assetHealth.get(src);
    }

    prepare() {
      if (!this.preloadPromise) {
        this.root.dataset.hodAssets = "loading";
        this.preloadPromise = Promise.all((this.program.preload || []).map(src => this.loadAsset(src))).then(results => {
          const healthy = results.every(result => result.healthy);
          this.root.dataset.hodAssets = healthy ? "ready" : "degraded";
          return { healthy, assets: this.assetHealth };
        });
      }
      return this.preloadPromise;
    }

    health() {
      return {
        controller: "stage-hod",
        version: this.program.version,
        state: this.lastState,
        profile: this.profile,
        assets: this.assetHealth
      };
    }
  }

  window.STFirmStageHOD = STFirmStageHOD;
})();
