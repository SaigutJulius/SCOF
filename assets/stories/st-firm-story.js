(() => {
  const root = document.querySelector('[data-st-firm-story]');
  if (!root) return;

  const player = root.querySelector('.story-player');
  const screen = root.querySelector('[data-story-screen]');
  const program = window.STFirmStoryProgram;
  if (!program || !window.STFirmStageHOD || !window.STFirmWatchman) {
    root.dataset.hodStatus = 'unavailable';
    return;
  }
  const scenes = [...root.querySelectorAll('[data-story-scene]')];
  const watch = root.querySelector('[data-story-watch]');
  const toggle = root.querySelector('[data-story-toggle]');
  const sound = root.querySelector('[data-story-sound]');
  const volumeInput = root.querySelector('[data-story-volume]');
  const volumeLabel = root.querySelector('.story-volume-label');
  const languageButton = root.querySelector('[data-story-language]');
  const replay = root.querySelector('[data-story-replay]');
  const fullscreen = root.querySelector('[data-story-fullscreen]');
  const progress = root.querySelector('[data-story-progress]');
  const timeLabel = root.querySelector('[data-story-time]');
  const caption = root.querySelector('[data-story-caption]');
  const chapterButtons = [...root.querySelectorAll('[data-story-seek]')];
  const openingCues = [...root.querySelectorAll('[data-story-at]')];
  const journeyCues = [...root.querySelectorAll('[data-journey-at]')];
  const akademieParticles = root.querySelector('[data-akademie-particles]');
  const ecosystemMembers = root.querySelector('[data-ecosystem-members]');
  const capabilityScene = root.querySelector('.story-skills-scene');
  const journeyScene = root.querySelector('.story-journey-scene');
  const ecosystemScene = root.querySelector('.story-ecosystem-scene');
  const appreciate = root.querySelector('[data-story-appreciate]');
  const share = root.querySelector('[data-story-share]');
  const shareDialog = document.querySelector('[data-story-share-dialog]');
  const duration = program.duration;
  const tempo = program.tempo;
  const beatDuration = 60 / tempo;
  const sceneStarts = program.sceneStarts;
  const captions = {
    en: [
      'ST‑Firm presents.',
      'Powered by SSOS. Sovereign intelligence. Business continuity.',
      'Learn. Build. Share. Empower.',
      'Ravine to the World! Twende pamoja! 29 active online members.',
      'Knowledge becomes practical capability.',
      'From Eldama Ravine through Mombasa to Berlin—knowledge becomes a sovereign system.',
      'Akädemie opens doors. SSOS turns intelligence into action. SCOF connects the farm to the world.',
      'Taking Ravine to the World and bringing the World to Eldama Ravine. Engineer Saigut Julius Kipkorir, AKA KingKunta.'
    ],
    sw: [
      'ST‑Firm inawasilisha.',
      'Inaendeshwa na SSOS. Akili huru. Mwendelezo wa biashara.',
      'Jifunze. Jenga. Shiriki. Wezesha.',
      'Ravine hadi Duniani! Twende pamoja! Wanachama 29 wanaoshiriki mtandaoni.',
      'Maarifa yanakuwa uwezo wa vitendo.',
      'Kutoka Eldama Ravine kupitia Mombasa hadi Berlin—maarifa yanakuwa mfumo huru.',
      'Akädemie inafungua milango. SSOS inaweka akili kwa vitendo. SCOF inaunganisha shamba na dunia.',
      'Taking Ravine to the World and bringing the World to Eldama Ravine. Engineer Saigut Julius Kipkorir, AKA KingKunta.'
    ]
  };
  const ecosystemCaptions = {
    en: {
      'ssos-call': 'Sema SSOS. Sovereign intelligence. Business continuity.',
      'akademie-call': 'Akädemie. Learn. Build. Share. Empower.',
      'st-link': 'Knowledge becomes capability. Capability becomes engineering.',
      'intelligence-link': 'Engineering connects intelligence.',
      'operations-link': 'Intelligence strengthens real operations.',
      'value-link': 'Coffee, technology and markets create real-world value.',
      'return-link': 'Value returns to people and builds the next generation.'
    },
    sw: {
      'ssos-call': 'Sema SSOS. Akili huru. Mwendelezo wa biashara.',
      'akademie-call': 'Akädemie. Jifunze. Jenga. Shiriki. Wezesha.',
      'st-link': 'Maarifa yanakuwa uwezo. Uwezo unakuwa uhandisi.',
      'intelligence-link': 'Uhandisi unaunganisha akili.',
      'operations-link': 'Akili inaimarisha shughuli halisi.',
      'value-link': 'Kahawa, teknolojia na masoko vinatengeneza thamani halisi.',
      'return-link': 'Thamani inawarudia watu na kujenga kizazi kijacho.'
    }
  };
  const capabilityCaptions = {
    en: {
      intro: 'Knowledge becomes something you can use.',
      'wave-one': 'Artificial intelligence, Python, automation and cybersecurity.',
      'wave-two': 'Entrepreneurship, leadership, financial literacy and sustainability.',
      bridge: 'Knowledge becomes capability. Capability begins the journey.'
    },
    sw: {
      intro: 'Maarifa yanakuwa kitu unachoweza kutumia.',
      'wave-one': 'Akili bandia, Python, automation na cybersecurity.',
      'wave-two': 'Ujasiriamali, uongozi, elimu ya fedha na uendelevu.',
      bridge: 'Maarifa yanakuwa uwezo. Uwezo unaanza safari.'
    }
  };
  const journeyCaptions = {
    en: {
      ravine: 'Nilitoka Eldama na ndoto mfukoni.',
      mombasa: 'Moi International, Mombasa runway—the journey begins.',
      takeoff: 'Ndege ikapaa. A new day begins.',
      flight: 'Kenya to Deutschland—carrying the roots forward.',
      landing: 'Touchdown in Berlin.',
      'berlin-arrival': 'Landed in Berlin. A new chapter begins.',
      'berlin-established': 'Berlin became the workshop for building sovereign systems.',
      handoff: 'The journey became a system. The laptop becomes an intelligence layer.'
    },
    sw: {
      ravine: 'Nilitoka Eldama na ndoto mfukoni.',
      mombasa: 'Moi International, Mombasa runway—safari inaanza.',
      takeoff: 'Ndege ikapaa. Siku mpya inaanza.',
      flight: 'Kenya hadi Deutschland—mizizi ikiendelea mbele.',
      landing: 'Tumetua Berlin.',
      'berlin-arrival': 'Nimetua Berlin. Sura mpya inaanza.',
      'berlin-established': 'Berlin ikawa warsha ya kujenga mifumo huru.',
      handoff: 'Safari ikawa mfumo. Laptop ikawa safu ya akili.'
    }
  };

  let elapsed = 0;
  let lastFrame = 0;
  let frame = 0;
  let playing = false;
  let muted = true;
  let language = 'en';
  let activeScene = -1;
  let activeCapabilityPhase = 'idle';
  let activeJourneyPhase = 'idle';
  let activeEcosystemPhase = 'idle';
  let activeAkademieBeat = 'idle';
  let ecosystemPointerFrame = 0;
  // Resilient-transport state: the film clock survives audio stalls/seeks.
  let audioClockPrev = -1;
  let recoverAttemptAt = 0;
  let holdWall = 0;
  let seekWatchdog = 0;
  let scrubFrame = 0;
  let scrubTarget = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stageHOD = new window.STFirmStageHOD({ root, screen, program });
  const watchman = new window.STFirmWatchman({ root, screen, hod: stageHOD, program });
  const bufferIndicator = document.createElement('div');
  bufferIndicator.className = 'story-buffer-indicator';
  bufferIndicator.setAttribute('aria-hidden', 'true');
  screen.append(bufferIndicator);

  function resetEcosystemTilt() {
    if (ecosystemPointerFrame) cancelAnimationFrame(ecosystemPointerFrame);
    ecosystemPointerFrame = 0;
    screen.style.removeProperty('--ecosystem-tilt-x');
    screen.style.removeProperty('--ecosystem-tilt-y');
  }

  function moveEcosystemTilt(event) {
    if (activeScene !== 6 || reducedMotion.matches || event.pointerType === 'touch') return;
    const { left, top, width, height } = screen.getBoundingClientRect();
    const horizontal = Math.max(-1, Math.min(1, ((event.clientX - left) / width - .5) * 2));
    const vertical = Math.max(-1, Math.min(1, ((event.clientY - top) / height - .5) * 2));
    if (ecosystemPointerFrame) cancelAnimationFrame(ecosystemPointerFrame);
    ecosystemPointerFrame = requestAnimationFrame(() => {
      screen.style.setProperty('--ecosystem-tilt-x', `${(-vertical * 1.8).toFixed(2)}deg`);
      screen.style.setProperty('--ecosystem-tilt-y', `${(horizontal * 2.4).toFixed(2)}deg`);
      ecosystemPointerFrame = 0;
    });
  }

  screen.addEventListener('pointermove', moveEcosystemTilt);
  screen.addEventListener('pointerleave', resetEcosystemTilt);

  class StorySoundtrack {
    constructor() {
      this.track = null;
      this.production = false;
      this.checked = false;
      this.ready = false;
      this.buffering = false;
      this.seeking = false;
      this.level = program.soundtrack.defaultVolume;
      const audioUrl = new URL(program.soundtrack.src, document.baseURI);
      if (location.protocol !== 'file:') audioUrl.searchParams.set('v', program.version);
      this.url = audioUrl.href;
      this.onended = null;
    }
    async discover() {
      if (this.checked) return this.production;
      this.checked = true;
      try {
        this.track = new Audio();
        this.track.preload = 'auto';
        this.track.volume = this.level;
        this.track.playbackRate = program.soundtrack.playbackRate;
        this.track.setAttribute('playsinline', '');
        this.track.addEventListener('ended', () => this.onended?.());
        this.track.addEventListener('canplay', () => { this.ready = true; this.buffering = false; });
        this.track.addEventListener('canplaythrough', () => { this.ready = true; this.buffering = false; });
        this.track.addEventListener('playing', () => { this.ready = true; this.buffering = false; });
        this.track.addEventListener('waiting', () => { this.buffering = true; });
        this.track.addEventListener('stalled', () => { this.buffering = true; });
        this.track.addEventListener('seeking', () => { this.seeking = true; });
        this.track.addEventListener('seeked', () => { this.seeking = false; this.buffering = false; });
        this.track.addEventListener('ratechange', () => {
          if (Math.abs(this.track.playbackRate - program.soundtrack.playbackRate) > .001) {
            this.track.playbackRate = program.soundtrack.playbackRate;
          }
        });
        this.track.src = this.url;
        this.track.load();
        window.__STFIRM_SOUND_INSTANCES__ ||= new Set();
        window.__STFIRM_SOUND_INSTANCES__.add(this.track);
        this.production = true;
      } catch {
        this.production = false;
      }
      return this.production;
    }
    async start(at = 0) {
      if (!(await this.discover()) || !this.track) throw new Error('The ST-Firm anthem could not be loaded.');
      this.track.playbackRate = program.soundtrack.playbackRate;
      if (Math.abs(this.track.currentTime - at) > .35) this.track.currentTime = at;
      await this.track.play();
    }
    pause() {
      this.track?.pause();
    }
    seek(value) {
      if (this.track && Number.isFinite(value)) {
        // Set the flag proactively: on file:// the 'seeking' event is not always
        // reliable, and settling() must reflect the seek immediately.
        this.seeking = true;
        try { this.track.currentTime = value; } catch { this.seeking = false; }
      }
    }
    clearSeek() {
      // Backstop for environments where 'seeked' never fires (e.g. file://).
      this.seeking = false;
    }
    settling() {
      // True while the media element cannot be trusted as a clock.
      return this.seeking || this.buffering;
    }
    resume() {
      if (this.track && this.track.paused) {
        const started = this.track.play();
        if (started && typeof started.catch === 'function') started.catch(() => {});
      }
    }
    currentTime() {
      return this.production && this.track ? this.track.currentTime : null;
    }
    setVolume(value) {
      this.level = Math.max(0, Math.min(1, Number(value)));
      if (this.track) this.track.volume = this.level;
    }
    health() {
      const instances = [...(window.__STFIRM_SOUND_INSTANCES__ || [])];
      const playingInstances = instances.filter(track => !track.paused && !track.ended).length;
      return {
        ready: this.ready,
        playing: Boolean(this.track && !this.track.paused && !this.track.ended),
        buffering: this.buffering,
        currentTime: this.track?.currentTime ?? null,
        duration: Number.isFinite(this.track?.duration) ? this.track.duration : program.soundtrack.duration,
        volume: this.track?.volume ?? this.level,
        playbackRate: this.track?.playbackRate ?? program.soundtrack.playbackRate,
        instances: playingInstances
      };
    }
  }
  const soundtrack = new StorySoundtrack();

  function formatTime(value) {
    const seconds = Math.max(0, Math.floor(value));
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function sceneForTime(value) {
    return stageHOD.sceneForTime(value).index;
  }

  function ecosystemPhaseForTime(value) {
    const scene = stageHOD.sceneForTime(value);
    return scene.id === 'ecosystem' ? stageHOD.phaseForScene(scene, value)?.id || 'idle' : 'idle';
  }

  function akademieBeatForTime(value) {
    const scene = stageHOD.sceneForTime(value);
    return scene.id === 'ecosystem' ? stageHOD.parallelState(scene, value).akademieVocal || 'idle' : 'idle';
  }

  function capabilityPhaseForTime(value) {
    const scene = stageHOD.sceneForTime(value);
    return scene.id === 'capability' ? stageHOD.phaseForScene(scene, value)?.id || 'idle' : 'idle';
  }

  function journeyPhaseForTime(value) {
    const scene = stageHOD.sceneForTime(value);
    return scene.id === 'journey' ? stageHOD.phaseForScene(scene, value)?.id || 'idle' : 'idle';
  }

  function currentCaptionText() {
    if (activeScene === 4 && activeCapabilityPhase !== 'idle') {
      return capabilityCaptions[language][activeCapabilityPhase];
    }
    if (activeScene === 5 && activeJourneyPhase !== 'idle') {
      return journeyCaptions[language][activeJourneyPhase];
    }
    if (activeScene === 6 && activeEcosystemPhase !== 'idle') {
      return ecosystemCaptions[language][activeEcosystemPhase];
    }
    return captions[language][activeScene < 0 ? 0 : activeScene];
  }

  function renderOpeningRhythm() {
    const openingActive = activeScene === 0 || activeScene === 1;
    const akademieActive = activeScene === 2;
    const cinematicActive = openingActive || akademieActive;
    openingCues.forEach(cue => {
      const cueTime = Number(cue.dataset.storyAt);
      cue.classList.toggle('is-cued', elapsed >= cueTime && elapsed < 12);
    });
    screen.classList.toggle('is-opening-active', openingActive);
    screen.classList.toggle('is-akademie-active', akademieActive);
    if (!cinematicActive) {
      screen.classList.remove('is-strong-beat');
      screen.removeAttribute('data-opening-beat');
      screen.style.removeProperty('--story-glow-opacity');
      screen.style.removeProperty('--story-glow-scale');
      screen.style.removeProperty('--story-wave-scale');
      screen.style.removeProperty('--story-signal-offset');
      return;
    }
    const sceneOrigin = activeScene === 2 ? 8 : activeScene === 1 ? 4 : 0;
    const localBeat = Math.max(0, (elapsed - sceneOrigin) / beatDuration);
    const beatIndex = Math.floor(localBeat);
    const beatPhase = localBeat - beatIndex;
    const pulse = reducedMotion.matches ? .16 : Math.pow(1 - beatPhase, 3.4);
    const strongBeat = beatIndex % 4 === 0;
    const glowStrength = .2 + pulse * (strongBeat ? .58 : .38);
    const glowScale = 1.018 + pulse * (strongBeat ? .052 : .032);
    const waveScale = .86 + pulse * (strongBeat ? .18 : .11);
    const signalPhase = reducedMotion.matches ? 0 : 1 - ((localBeat / 4) % 1);
    screen.dataset.openingBeat = String(beatIndex);
    screen.classList.toggle('is-strong-beat', !reducedMotion.matches && strongBeat && beatPhase < .42);
    screen.style.setProperty('--story-glow-opacity', glowStrength.toFixed(3));
    screen.style.setProperty('--story-glow-scale', glowScale.toFixed(3));
    screen.style.setProperty('--story-wave-scale', waveScale.toFixed(3));
    screen.style.setProperty('--story-signal-offset', signalPhase.toFixed(4));
  }

  function renderCapabilityRhythm() {
    if (activeScene !== 4) {
      ['--capability-pulse', '--capability-signal-offset', '--capability-orb-opacity', '--capability-orb-scale', '--capability-icon-glow', '--capability-bridge-scale'].forEach(property => screen.style.removeProperty(property));
      return;
    }
    const localBeat = Math.max(0, (elapsed - 22) / beatDuration);
    const beatPhase = localBeat - Math.floor(localBeat);
    const pulse = reducedMotion.matches ? .12 : Math.pow(1 - beatPhase, 3.1);
    const signalOffset = reducedMotion.matches ? 0 : 1 - ((localBeat / 2) % 1);
    screen.style.setProperty('--capability-pulse', pulse.toFixed(3));
    screen.style.setProperty('--capability-signal-offset', signalOffset.toFixed(4));
    screen.style.setProperty('--capability-orb-opacity', (.18 + pulse * .18).toFixed(3));
    screen.style.setProperty('--capability-orb-scale', (1 + pulse * .08).toFixed(3));
    screen.style.setProperty('--capability-icon-glow', `${(7 + pulse * 8).toFixed(2)}px`);
    screen.style.setProperty('--capability-bridge-scale', (1 + pulse * .018).toFixed(3));
  }

  function renderJourneyRhythm() {
    journeyCues.forEach(cue => {
      const cueTime = Number(cue.dataset.journeyAt);
      const cueUntil = Number(cue.dataset.journeyUntil ?? 43);
      cue.classList.toggle('is-cued', activeScene === 5 && elapsed >= cueTime && elapsed < cueUntil);
    });
    screen.classList.toggle('is-journey-active', activeScene === 5);
    if (activeScene !== 5) {
      ['--journey-takeoff-progress', '--journey-takeoff-x', '--journey-takeoff-y', '--journey-takeoff-scale', '--journey-takeoff-rotate', '--journey-takeoff-opacity', '--journey-takeoff-flash', '--journey-contrail-one-opacity', '--journey-contrail-two-opacity', '--journey-flight-progress', '--journey-flight-map-position', '--journey-cloud-shift', '--journey-cloud-opacity', '--journey-landing-progress', '--journey-landing-x', '--journey-landing-y', '--journey-landing-scale', '--journey-landing-opacity', '--journey-landing-flash', '--journey-smoke-left', '--journey-smoke-shift', '--journey-smoke-scale', '--journey-arrival-progress', '--journey-established-progress', '--journey-handoff-progress', '--journey-handoff-opacity', '--journey-shake-x', '--journey-shake-y'].forEach(property => screen.style.removeProperty(property));
      return;
    }
    const clamp = value => Math.max(0, Math.min(1, value));
    const takeoffProgress = clamp((elapsed - 31.5) / 1.8);
    const flightProgress = clamp((elapsed - 33.3) / 1);
    const landingProgress = clamp((elapsed - 34.3) / 1.3);
    const arrivalProgress = clamp((elapsed - 35.6) / 2.5);
    const establishedProgress = clamp((elapsed - 38.1) / 3.6);
    const handoffProgress = clamp((elapsed - 41.7) / 1.3);
    const takeoffImpact = takeoffProgress > .5 && takeoffProgress < .94 ? Math.sin(takeoffProgress * Math.PI * 11) * (1 - takeoffProgress) : 0;
    const landingImpact = landingProgress > .78 ? Math.sin(landingProgress * Math.PI * 9) * (1 - landingProgress) : 0;
    const cameraImpact = reducedMotion.matches ? 0 : takeoffImpact + landingImpact;
    screen.style.setProperty('--journey-takeoff-progress', takeoffProgress.toFixed(3));
    screen.style.setProperty('--journey-takeoff-x', `${(-38 + takeoffProgress * 156).toFixed(2)}%`);
    screen.style.setProperty('--journey-takeoff-y', `${(58 - takeoffProgress * 111).toFixed(2)}%`);
    screen.style.setProperty('--journey-takeoff-scale', (.26 + takeoffProgress * 1.18).toFixed(3));
    screen.style.setProperty('--journey-takeoff-rotate', `${(-5 + takeoffProgress * 11).toFixed(2)}deg`);
    screen.style.setProperty('--journey-takeoff-opacity', takeoffProgress > .96 ? (1 - takeoffProgress) / .04 : 1);
    screen.style.setProperty('--journey-takeoff-flash', (takeoffProgress * .16).toFixed(3));
    screen.style.setProperty('--journey-contrail-one-opacity', (.28 + takeoffProgress * .62).toFixed(3));
    screen.style.setProperty('--journey-contrail-two-opacity', (.18 + takeoffProgress * .45).toFixed(3));
    screen.style.setProperty('--journey-flight-progress', flightProgress.toFixed(3));
    screen.style.setProperty('--journey-flight-map-position', `${(flightProgress * 100).toFixed(2)}%`);
    screen.style.setProperty('--journey-cloud-shift', `${(flightProgress * -35).toFixed(2)}%`);
    screen.style.setProperty('--journey-cloud-opacity', (.82 - landingProgress * .7).toFixed(3));
    screen.style.setProperty('--journey-landing-progress', landingProgress.toFixed(3));
    screen.style.setProperty('--journey-landing-x', `${(46 - landingProgress * 66).toFixed(2)}%`);
    screen.style.setProperty('--journey-landing-y', `${(-34 + landingProgress * 72).toFixed(2)}%`);
    screen.style.setProperty('--journey-landing-scale', (.18 + landingProgress * .48).toFixed(3));
    screen.style.setProperty('--journey-landing-opacity', (.35 + landingProgress * .65).toFixed(3));
    screen.style.setProperty('--journey-landing-flash', (landingProgress * .2).toFixed(3));
    screen.style.setProperty('--journey-smoke-left', `${(18 + landingProgress * 38).toFixed(2)}%`);
    screen.style.setProperty('--journey-smoke-shift', `${(landingProgress * 70).toFixed(2)}px`);
    screen.style.setProperty('--journey-smoke-scale', (.45 + landingProgress * 1.3).toFixed(3));
    screen.style.setProperty('--journey-arrival-progress', arrivalProgress.toFixed(3));
    screen.style.setProperty('--journey-established-progress', establishedProgress.toFixed(3));
    screen.style.setProperty('--journey-handoff-progress', handoffProgress.toFixed(3));
    screen.style.setProperty('--journey-handoff-opacity', (.35 + handoffProgress * .65).toFixed(3));
    screen.style.setProperty('--journey-shake-x', `${(cameraImpact * 5).toFixed(2)}px`);
    screen.style.setProperty('--journey-shake-y', `${(cameraImpact * -3).toFixed(2)}px`);
  }

  function renderEcosystemRhythm() {
    if (activeScene !== 6) {
      screen.style.removeProperty('--ecosystem-pulse');
      screen.style.removeProperty('--ecosystem-wave-offset');
      screen.style.removeProperty('--akademie-mie-scale');
      screen.style.removeProperty('--akademie-mie-glow');
      screen.style.removeProperty('--ecosystem-product-scale');
      screen.style.removeProperty('--ecosystem-product-lift');
      screen.style.removeProperty('--akademie-morph-progress');
      screen.style.removeProperty('--akademie-morph-opacity');
      screen.style.removeProperty('--akademie-morph-scale');
      screen.style.removeProperty('--akademie-morph-blur');
      return;
    }
    const localBeat = Math.max(0, (elapsed - 43) / beatDuration);
    const beatPhase = localBeat - Math.floor(localBeat);
    const pulse = reducedMotion.matches ? .12 : Math.pow(1 - beatPhase, 3.2);
    const waveOffset = reducedMotion.matches ? 0 : 1 - ((localBeat / 4) % 1);
    screen.style.setProperty('--ecosystem-pulse', pulse.toFixed(3));
    screen.style.setProperty('--ecosystem-wave-offset', waveOffset.toFixed(4));
    const stretchProgress = Math.max(0, Math.min(1, (elapsed - 48.35) / .8));
    screen.style.setProperty('--akademie-mie-scale', (1 + stretchProgress * .12).toFixed(3));
    screen.style.setProperty('--akademie-mie-glow', `${(12 + pulse * 18).toFixed(2)}px`);
    screen.style.setProperty('--ecosystem-product-scale', (1 + pulse * .035).toFixed(3));
    screen.style.setProperty('--ecosystem-product-lift', `${(-pulse * 3).toFixed(2)}px`);
    const morphProgress = Math.max(0, Math.min(1, (elapsed - 51.8) / .6));
    screen.style.setProperty('--akademie-morph-progress', morphProgress.toFixed(3));
    screen.style.setProperty('--akademie-morph-opacity', (1 - morphProgress).toFixed(3));
    screen.style.setProperty('--akademie-morph-scale', (1 - morphProgress * .46).toFixed(3));
    screen.style.setProperty('--akademie-morph-blur', `${(morphProgress * 2).toFixed(2)}px`);
  }

  function render() {
    const hodState = stageHOD.resolve(elapsed);
    const nextScene = hodState.scene.index;
    const nextCapabilityPhase = hodState.scene.id === 'capability' ? hodState.phase?.id || 'idle' : 'idle';
    const nextJourneyPhase = hodState.scene.id === 'journey' ? hodState.phase?.id || 'idle' : 'idle';
    const nextEcosystemPhase = hodState.scene.id === 'ecosystem' ? hodState.phase?.id || 'idle' : 'idle';
    const nextAkademieBeat = hodState.parallel.akademieVocal || 'idle';
    let captionChanged = false;
    if (nextScene !== activeScene) {
      activeScene = nextScene;
      captionChanged = true;
      scenes.forEach((scene, index) => {
        const selected = index === activeScene;
        scene.classList.toggle('is-active', selected);
        scene.setAttribute('aria-hidden', String(!selected));
      });
      screen.classList.toggle('is-ecosystem-active', activeScene === 6);
      if (activeScene !== 6) resetEcosystemTilt();
      chapterButtons.forEach((button, index) => {
        const nextStart = Number(chapterButtons[index + 1]?.dataset.storySeek ?? duration + 1);
        button.classList.toggle('is-active', elapsed >= Number(button.dataset.storySeek) && elapsed < nextStart);
      });
    }
    if (nextCapabilityPhase !== activeCapabilityPhase) {
      activeCapabilityPhase = nextCapabilityPhase;
      capabilityScene?.setAttribute('data-capability-phase', activeCapabilityPhase);
      captionChanged = true;
    }
    if (nextJourneyPhase !== activeJourneyPhase) {
      activeJourneyPhase = nextJourneyPhase;
      journeyScene?.setAttribute('data-journey-phase', activeJourneyPhase);
      captionChanged = true;
    }
    if (nextEcosystemPhase !== activeEcosystemPhase) {
      activeEcosystemPhase = nextEcosystemPhase;
      ecosystemScene?.setAttribute('data-ecosystem-phase', activeEcosystemPhase);
      captionChanged = true;
    }
    if (nextAkademieBeat !== activeAkademieBeat) {
      activeAkademieBeat = nextAkademieBeat;
      ecosystemScene?.setAttribute('data-akademie-beat', activeAkademieBeat);
    }
    renderOpeningRhythm();
    renderCapabilityRhythm();
    renderJourneyRhythm();
    renderEcosystemRhythm();
    stageHOD.apply(hodState);
    watchman.observe(hodState, soundtrack.health());
    if (captionChanged) caption.textContent = currentCaptionText();
    progress.value = String(Math.round(elapsed * 10));
    timeLabel.textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
  }

  function animate(timestamp) {
    if (!playing) return;
    if (!lastFrame) lastFrame = timestamp;
    const delta = timestamp - lastFrame;
    lastFrame = timestamp;
    const soundtrackTime = muted ? null : soundtrack.currentTime();

    if (soundtrackTime === null) {
      // Muted, or audio failed to load: the film runs on its own wall clock.
      elapsed += Math.min(delta / 1000, .1);
      holdWall = 0;
      player.classList.remove('is-buffering');
    } else {
      const settling = soundtrack.settling();
      const advanced = Math.abs(soundtrackTime - audioClockPrev) > 0.001;
      audioClockPrev = soundtrackTime;
      if (!settling && advanced) {
        // Healthy playback — audio is the master clock (within the drift budget).
        holdWall = 0;
        player.classList.remove('is-buffering');
        elapsed = Math.min(duration, soundtrackTime);
      } else {
        // Seeking, re-buffering, or a frozen currentTime (classic file:// seek
        // stall). Hold the visuals steady while we wait — but never forever.
        holdWall += delta;
        if (holdWall > 350) player.classList.add('is-buffering');
        if (holdWall > 800 && timestamp - recoverAttemptAt > 1000) {
          recoverAttemptAt = timestamp;
          soundtrack.resume();
        }
        if (holdWall <= 2500) {
          // Brief hold: keep the loop alive so we resume the instant audio
          // recovers, instead of dead-freezing on a stale time.
          frame = requestAnimationFrame(animate);
          return;
        }
        // Audio is wedged: keep the film alive on the wall clock so it can never
        // permanently hang, and keep nudging the audio to catch back up.
        elapsed = Math.min(duration, elapsed + Math.min(delta / 1000, .1));
      }
    }

    if (elapsed >= duration) {
      finishStory();
      return;
    }
    render();
    if (playing) frame = requestAnimationFrame(animate);
  }

  function setSoundUi(enabled) {
    sound.setAttribute('aria-pressed', String(!enabled));
    sound.setAttribute('aria-label', enabled ? 'Mute soundtrack' : 'Enable soundtrack');
    sound.innerHTML = `<span aria-hidden="true">${enabled ? '♫' : '♩'}</span>`;
    volumeLabel.hidden = !enabled;
  }

  function setStartButton(state = 'ready') {
    const label = watch.querySelector('strong');
    const detail = watch.querySelector('small');
    watch.disabled = state === 'loading';
    player.classList.toggle('is-loading', state === 'loading');
    if (state === 'loading') {
      label.textContent = 'Loading the anthem…';
      detail.textContent = 'Preparing film + sound';
    } else if (state === 'retry') {
      label.textContent = 'Retry with sound';
      detail.textContent = 'The anthem did not start';
    } else {
      label.textContent = 'Start film with sound';
      detail.textContent = 'Film + anthem · 01:10';
    }
  }

  function finishStory() {
    playing = false;
    elapsed = duration;
    lastFrame = 0;
    player.classList.remove('is-playing', 'is-buffering');
    holdWall = 0;
    toggle.innerHTML = '<span aria-hidden="true">▶</span>';
    toggle.setAttribute('aria-label', 'Replay story');
    cancelAnimationFrame(frame);
    soundtrack.pause();
    render();
  }

  async function playStory() {
    if (elapsed >= duration) elapsed = 0;
    if (!muted) {
      setStartButton('loading');
      try {
        await stageHOD.prepare();
        await soundtrack.start(elapsed);
      } catch {
        playing = false;
        muted = true;
        player.classList.remove('is-started', 'is-playing');
        setSoundUi(false);
        setStartButton('retry');
        caption.textContent = 'The anthem could not start. Tap again to retry with sound.';
        return false;
      }
    }
    playing = true;
    lastFrame = 0;
    setStartButton('ready');
    player.classList.add('is-started', 'is-playing');
    toggle.innerHTML = '<span aria-hidden="true">Ⅱ</span>';
    toggle.setAttribute('aria-label', 'Pause story');
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(animate);
    return true;
  }

  function pauseStory() {
    playing = false;
    player.classList.remove('is-playing', 'is-buffering');
    holdWall = 0;
    toggle.innerHTML = '<span aria-hidden="true">▶</span>';
    toggle.setAttribute('aria-label', 'Play story');
    cancelAnimationFrame(frame);
    soundtrack.pause();
  }

  function seek(value) {
    elapsed = Math.max(0, Math.min(duration, Number(value)));
    soundtrack.seek(elapsed);
    activeScene = -1;
    holdWall = 0;
    audioClockPrev = -1;
    if (playing && !muted) soundtrack.resume();
    // Backstop: if the browser never fires 'seeked' (common on file://), clear
    // the seeking flag so the loop can re-sync instead of holding indefinitely.
    clearTimeout(seekWatchdog);
    seekWatchdog = setTimeout(() => soundtrack.clearSeek(), 1200);
    render();
  }

  async function toggleStory() {
    if (playing) pauseStory();
    else if (!player.classList.contains('is-started') && muted) await enableAnthem();
    else await playStory();
  }

  const orbit = root.querySelector('[data-member-orbit]');
  if (orbit) {
    for (let index = 0; index < 29; index += 1) {
      const dot = document.createElement('i');
      dot.style.setProperty('--angle', `${index * (360 / 29)}deg`);
      dot.style.setProperty('--delay', `${-(index % 8) * .24}s`);
      orbit.append(dot);
    }
  }

  if (akademieParticles) {
    const particleColors = ['#45c979', '#c8ed72', '#d6a63b', '#7854cb', '#218fc2'];
    for (let index = 0; index < 29; index += 1) {
      const dot = document.createElement('i');
      dot.style.setProperty('--angle', `${index * (360 / 29)}deg`);
      dot.style.setProperty('--particle-delay', `${(index % 8) * .018}s`);
      dot.style.setProperty('--particle-color', particleColors[index % particleColors.length]);
      akademieParticles.append(dot);
    }
  }

  if (ecosystemMembers) {
    const memberColors = ['#45c979', '#c8ed72', '#e0ad45', '#7854cb', '#218fc2'];
    for (let index = 0; index < 29; index += 1) {
      const dot = document.createElement('i');
      dot.style.setProperty('--member-angle', `${index * (360 / 29)}deg`);
      dot.style.setProperty('--member-radius', `clamp(52px, ${12 + (index % 5) * 2.4}cqw, 150px)`);
      dot.style.setProperty('--member-delay', `${(index % 10) * .035}s`);
      dot.style.setProperty('--member-color', memberColors[index % memberColors.length]);
      ecosystemMembers.append(dot);
    }
  }

  async function enableAnthem() {
    muted = false;
    setSoundUi(true);
    return playStory();
  }

  let storedVolume = program.soundtrack.defaultVolume;
  try { storedVolume = Number(localStorage.getItem('stfirm-story-volume') || program.soundtrack.defaultVolume); } catch {}
  if (!Number.isFinite(storedVolume)) storedVolume = program.soundtrack.defaultVolume;
  volumeInput.value = String(Math.max(0, Math.min(1, storedVolume)));
  soundtrack.setVolume(volumeInput.value);

  watch.addEventListener('click', () => { seek(0); enableAnthem(); });
  toggle.addEventListener('click', toggleStory);
  replay.addEventListener('click', async () => {
    seek(0);
    if (muted && !player.classList.contains('is-started')) await enableAnthem();
    else await playStory();
  });
  function requestScrub(value) {
    // Coalesce rapid scrubber 'input' events into at most one seek per frame so
    // a fast drag can't thrash the media element into a stall.
    scrubTarget = value;
    if (scrubFrame) return;
    scrubFrame = requestAnimationFrame(() => {
      scrubFrame = 0;
      if (scrubTarget !== null) seek(scrubTarget);
      scrubTarget = null;
    });
  }
  progress.addEventListener('input', () => requestScrub(Number(progress.value) / 10));
  progress.addEventListener('change', () => seek(Number(progress.value) / 10));
  chapterButtons.forEach(button => button.addEventListener('click', async () => {
    seek(button.dataset.storySeek);
    if (muted && !player.classList.contains('is-started')) await enableAnthem();
    else await playStory();
  }));

  sound.addEventListener('click', async () => {
    if (muted) {
      muted = false;
      setSoundUi(true);
      if (playing) {
        try { await soundtrack.start(elapsed); }
        catch {
          muted = true;
          setSoundUi(false);
          caption.textContent = 'The anthem could not start. Tap the sound control to retry.';
        }
      } else await playStory();
    }
    else {
      muted = true;
      setSoundUi(false);
      soundtrack.pause();
    }
  });

  volumeInput.addEventListener('input', () => {
    soundtrack.setVolume(volumeInput.value);
    try { localStorage.setItem('stfirm-story-volume', volumeInput.value); } catch {}
  });

  languageButton.addEventListener('click', () => {
    language = language === 'en' ? 'sw' : 'en';
    languageButton.innerHTML = `<span aria-hidden="true">${language.toUpperCase()}</span>`;
    languageButton.setAttribute('aria-label', language === 'en' ? 'Switch captions to Kiswahili' : 'Switch captions to English');
    caption.textContent = currentCaptionText();
  });

  fullscreen.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await player.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      caption.textContent = 'Full-screen viewing is not available in this browser.';
    }
  });

  screen.addEventListener('keydown', event => {
    if (event.code === 'Space') { event.preventDefault(); toggleStory(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); seek(elapsed + 5); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); seek(elapsed - 5); }
  });

  let liked = false;
  try { liked = localStorage.getItem('stfirm-akademie-appreciated') === 'yes'; } catch {}
  appreciate.setAttribute('aria-pressed', String(liked));
  if (liked) appreciate.innerHTML = '<span aria-hidden="true">♥</span> Appreciated';
  appreciate.addEventListener('click', () => {
    liked = !liked;
    appreciate.setAttribute('aria-pressed', String(liked));
    appreciate.innerHTML = liked ? '<span aria-hidden="true">♥</span> Appreciated' : '<span aria-hidden="true">♡</span> Appreciate';
    try { localStorage.setItem('stfirm-akademie-appreciated', liked ? 'yes' : 'no'); } catch {}
  });

  const storyUrl = `${location.href.split('#')[0]}#akademie-story`;
  const shareText = 'Discover how ST‑Firm Akädemie connects Kenya 🇰🇪 and Deutschland 🇩🇪 to build beyond borders.';
  const encodedUrl = encodeURIComponent(storyUrl);
  const encodedText = encodeURIComponent(shareText);
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent('Knowledge Without Borders — ST‑Firm')}&body=${encodedText}%0A%0A${encodedUrl}`
  };
  shareDialog?.querySelector('[data-share-whatsapp]')?.setAttribute('href', shareLinks.whatsapp);
  shareDialog?.querySelector('[data-share-linkedin]')?.setAttribute('href', shareLinks.linkedin);
  shareDialog?.querySelector('[data-share-x]')?.setAttribute('href', shareLinks.x);
  shareDialog?.querySelector('[data-share-email]')?.setAttribute('href', shareLinks.email);

  share.addEventListener('click', () => {
    if (typeof shareDialog?.showModal === 'function') shareDialog.showModal();
    else if (navigator.share) navigator.share({ title:'Knowledge Without Borders', text:shareText, url:storyUrl }).catch(() => {});
  });
  shareDialog?.addEventListener('click', event => {
    if (event.target === shareDialog) shareDialog.close();
  });
  shareDialog?.querySelector('[data-share-copy]')?.addEventListener('click', async () => {
    const status = shareDialog.querySelector('[data-share-status]');
    try {
      await navigator.clipboard.writeText(storyUrl);
      status.textContent = 'Story link copied.';
    } catch {
      status.textContent = 'Copy this link: ' + storyUrl;
    }
  });

  soundtrack.onended = finishStory;
  setSoundUi(false);
  setStartButton('ready');
  soundtrack.discover();
  stageHOD.prepare();
  render();
})();
