(() => {
  class STFirmWatchman {
    constructor({ root, screen, hod, program }) {
      if (!root || !screen || !hod || !program) throw new Error("Watchman requires the story root, screen, HOD and production program.");
      this.root = root;
      this.screen = screen;
      this.hod = hod;
      this.program = program;
      this.lastInspection = 0;
      this.recoveries = 0;
      this.report = null;
      this.interval = program.diagnostics?.sampleInterval || 250;
      const search = new URLSearchParams(location.search);
      this.debugEnabled = search.get(program.diagnostics?.queryParameter || "storyDebug") === (program.diagnostics?.enabledValue || "1");
      this.panel = this.debugEnabled ? this.createPanel() : null;
      root.dataset.watchman = "ready";
    }

    createPanel() {
      const panel = document.createElement("aside");
      panel.className = "story-watchman-panel";
      panel.setAttribute("aria-label", "ST-Firm production diagnostics");
      panel.innerHTML = "<strong>ST‑FIRM WATCHMAN</strong><pre></pre>";
      this.screen.append(panel);
      return panel;
    }

    recoverJourney(state, issues) {
      if (state.scene?.id !== "journey" || !state.primaryFrame) return;
      const journey = this.root.querySelector(".story-journey-scene");
      const expected = journey?.querySelector(`.journey-frame-${state.primaryFrame}`);
      const frames = [...(journey?.querySelectorAll(".journey-frame") || [])];
      if (!expected) {
        issues.push(`missing-frame:${state.primaryFrame}`);
        return;
      }
      const selected = frames.filter(frame => frame.classList.contains("is-hod-primary"));
      if (selected.length !== 1 || selected[0] !== expected) {
        frames.forEach(frame => {
          const active = frame === expected;
          frame.classList.toggle("is-hod-primary", active);
          frame.dataset.hodVisible = String(active);
          frame.setAttribute("aria-hidden", String(!active));
        });
        this.recoveries += 1;
        issues.push("recovered-primary-frame");
      }
      if (getComputedStyle(expected).animationName !== "none") {
        expected.style.setProperty("animation", "none", "important");
        this.recoveries += 1;
        issues.push("recovered-legacy-animation");
      }
      if (!expected.complete || expected.naturalWidth < 1) issues.push(`asset-not-decoded:${state.primaryFrame}`);
    }

    inspect(state, soundHealth = {}) {
      const issues = [];
      this.recoverJourney(state, issues);
      const journey = this.root.querySelector(".story-journey-scene");
      const primaryFrames = [...(journey?.querySelectorAll(".journey-frame.is-hod-primary") || [])];
      if (state.scene?.id === "journey" && primaryFrames.length !== this.program.overlapPolicy.maximumPrimaryFrames) {
        issues.push(`primary-frame-count:${primaryFrames.length}`);
      }
      if ((soundHealth.instances || 1) > this.program.overlapPolicy.maximumSoundtracks) issues.push("duplicate-soundtrack");
      const drift = Number.isFinite(soundHealth.currentTime) ? Math.abs(soundHealth.currentTime - state.time) : 0;
      if (soundHealth.playing && drift > this.program.soundtrack.maximumVisualDrift) issues.push(`audio-drift:${drift.toFixed(3)}`);
      if (soundHealth.playbackRate && Math.abs(soundHealth.playbackRate - this.program.soundtrack.playbackRate) > 0.001) {
        issues.push(`playback-rate:${soundHealth.playbackRate}`);
      }
      const expected = state.primaryFrame ? journey?.querySelector(`.journey-frame-${state.primaryFrame}`) : null;
      const computedOpacity = expected ? Number.parseFloat(getComputedStyle(expected).opacity) : null;
      if (expected && computedOpacity < 0.98) {
        expected.style.setProperty("opacity", "1", "important");
        this.recoveries += 1;
        issues.push(`recovered-opacity:${computedOpacity}`);
      }
      const status = issues.some(issue => !issue.startsWith("recovered-")) ? "attention" : "healthy";
      this.root.dataset.watchman = status;
      this.report = {
        status,
        time: state.time,
        chapter: state.chapter?.id,
        scene: state.scene?.id,
        phase: state.phase?.id || "none",
        profile: state.profile,
        primaryFrame: state.primaryFrame || "none",
        background: typeof state.background === "string" ? state.background : "generated",
        transition: state.transition.id,
        typography: state.scene?.typography || "product",
        allowedOverlaps: state.allowedOverlaps,
        audio: soundHealth,
        drift,
        computedOpacity,
        issues,
        recoveries: this.recoveries
      };
      window.__STFIRM_WATCHMAN_REPORT__ = this.report;
      this.updatePanel();
      this.root.dispatchEvent(new CustomEvent("stfirm:watchman-report", { detail: this.report }));
      return this.report;
    }

    observe(state, soundHealth = {}, timestamp = performance.now()) {
      if (timestamp - this.lastInspection < this.interval) return this.report;
      this.lastInspection = timestamp;
      return this.inspect(state, soundHealth);
    }

    updatePanel() {
      const output = this.panel?.querySelector("pre");
      if (!output || !this.report) return;
      const audio = this.report.audio || {};
      output.textContent = [
        `TOTAL ZEIT      ${this.program.duration.toFixed(3)}s`,
        `CURRENT ZEIT    ${this.report.time.toFixed(3)}s`,
        `CHAPTER         ${this.report.chapter}`,
        `SCENE           ${this.report.scene}`,
        `PHASE           ${this.report.phase}`,
        `PROFILE         ${this.report.profile}`,
        `PHOTO           ${this.report.primaryFrame}`,
        `BACKGROUND      ${this.report.background}`,
        `TRANSITION      ${this.report.transition}`,
        `AUDIO           ${audio.playing ? "PLAYING" : audio.ready ? "READY" : "WAITING"}`,
        `VOLUME          ${Number(audio.volume || 0).toFixed(2)}`,
        `DRIFT           ${this.report.drift.toFixed(3)}s`,
        `OVERLAPS        ${this.report.allowedOverlaps.join(", ") || "NONE"}`,
        `RECOVERIES      ${this.report.recoveries}`,
        `STATUS          ${this.report.status.toUpperCase()}`,
        this.report.issues.length ? `ISSUES          ${this.report.issues.join(" | ")}` : ""
      ].filter(Boolean).join("\n");
    }
  }

  window.STFirmWatchman = STFirmWatchman;
})();
