(() => {
  const root = document.querySelector('[data-st-firm-story]');
  if (!root) return;

  const player = root.querySelector('.story-player');
  const screen = root.querySelector('[data-story-screen]');
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
  const appreciate = root.querySelector('[data-story-appreciate]');
  const share = root.querySelector('[data-story-share]');
  const shareDialog = document.querySelector('[data-story-share-dialog]');
  const duration = 70;
  const sceneStarts = [0, 4, 8, 12, 22, 33, 45, 58];
  const captions = {
    en: [
      'ST‑Firm presents.',
      'Jenga… jenga… Powered by SSOS.',
      'Learn. Build. Share. Empower.',
      'Ravine to the World! Twende pamoja! 29 active online members.',
      'The World to Ravine! Tunajenga! Kenya to Deutschland—beyond the border!',
      'Nilibeba ndoto, notebook na laptop. Mombasa runway—safari ikaanza.',
      'Akademie opens doors. SSOS turns intelligence into action. SCOF connects the farm to the world.',
      'Taking Ravine to the World and bringing the World to Eldama Ravine. Engineer Saigut Julius Kipkorir, AKA KingKunta.'
    ],
    sw: [
      'ST‑Firm inawasilisha.',
      'Jenga… jenga… Inaendeshwa na SSOS.',
      'Jifunze. Jenga. Shiriki. Wezesha.',
      'Ravine hadi Duniani! Twende pamoja! Wanachama 29 wanaoshiriki mtandaoni.',
      'Dunia hadi Ravine! Tunajenga! Kenya hadi Deutschland—kuvuka mipaka!',
      'Nilibeba ndoto, notebook na laptop. Mombasa runway—safari ikaanza.',
      'Akademie inafungua milango. SSOS inaweka akili kwa vitendo. SCOF inaunganisha shamba na dunia.',
      'Taking Ravine to the World and bringing the World to Eldama Ravine. Engineer Saigut Julius Kipkorir, AKA KingKunta.'
    ]
  };

  let elapsed = 0;
  let lastFrame = 0;
  let frame = 0;
  let playing = false;
  let muted = true;
  let language = 'en';
  let activeScene = -1;

  class StorySoundtrack {
    constructor() {
      this.track = null;
      this.production = false;
      this.checked = false;
      this.level = .8;
      const audioUrl = new URL('assets/stories/audio/st-firm-tunajenga-website.mp3', document.baseURI);
      if (location.protocol !== 'file:') audioUrl.searchParams.set('v', '20260722-continuous70s');
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
        this.track.setAttribute('playsinline', '');
        this.track.addEventListener('ended', () => this.onended?.());
        this.track.src = this.url;
        this.track.load();
        this.production = true;
      } catch {
        this.production = false;
      }
      return this.production;
    }
    async start(at = 0) {
      if (!(await this.discover()) || !this.track) throw new Error('The ST-Firm anthem could not be loaded.');
      if (Math.abs(this.track.currentTime - at) > .35) this.track.currentTime = at;
      await this.track.play();
    }
    pause() {
      this.track?.pause();
    }
    seek(value) {
      if (this.track && Number.isFinite(value)) {
        try { this.track.currentTime = value; } catch {}
      }
    }
    currentTime() {
      return this.production && this.track ? this.track.currentTime : null;
    }
    setVolume(value) {
      this.level = Math.max(0, Math.min(1, Number(value)));
      if (this.track) this.track.volume = this.level;
    }
  }
  const soundtrack = new StorySoundtrack();

  function formatTime(value) {
    const seconds = Math.max(0, Math.floor(value));
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function sceneForTime(value) {
    for (let index = sceneStarts.length - 1; index >= 0; index -= 1) {
      if (value >= sceneStarts[index]) return index;
    }
    return 0;
  }

  function render() {
    const nextScene = sceneForTime(elapsed);
    if (nextScene !== activeScene) {
      activeScene = nextScene;
      scenes.forEach((scene, index) => {
        const selected = index === activeScene;
        scene.classList.toggle('is-active', selected);
        scene.setAttribute('aria-hidden', String(!selected));
      });
      chapterButtons.forEach((button, index) => {
        const nextStart = Number(chapterButtons[index + 1]?.dataset.storySeek ?? duration + 1);
        button.classList.toggle('is-active', elapsed >= Number(button.dataset.storySeek) && elapsed < nextStart);
      });
      caption.textContent = captions[language][activeScene];
    }
    progress.value = String(Math.round(elapsed * 10));
    timeLabel.textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
  }

  function animate(timestamp) {
    if (!playing) return;
    if (!lastFrame) lastFrame = timestamp;
    const soundtrackTime = muted ? null : soundtrack.currentTime();
    if (soundtrackTime === null) elapsed += Math.min((timestamp - lastFrame) / 1000, .1);
    else elapsed = Math.min(duration, soundtrackTime);
    lastFrame = timestamp;
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
    player.classList.remove('is-playing');
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
    player.classList.remove('is-playing');
    toggle.innerHTML = '<span aria-hidden="true">▶</span>';
    toggle.setAttribute('aria-label', 'Play story');
    cancelAnimationFrame(frame);
    soundtrack.pause();
  }

  function seek(value) {
    elapsed = Math.max(0, Math.min(duration, Number(value)));
    soundtrack.seek(elapsed);
    activeScene = -1;
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

  async function enableAnthem() {
    muted = false;
    setSoundUi(true);
    return playStory();
  }

  let storedVolume = .8;
  try { storedVolume = Number(localStorage.getItem('stfirm-story-volume') || .8); } catch {}
  if (!Number.isFinite(storedVolume)) storedVolume = .8;
  volumeInput.value = String(Math.max(0, Math.min(1, storedVolume)));
  soundtrack.setVolume(volumeInput.value);

  watch.addEventListener('click', () => { seek(0); enableAnthem(); });
  toggle.addEventListener('click', toggleStory);
  replay.addEventListener('click', async () => {
    seek(0);
    if (muted && !player.classList.contains('is-started')) await enableAnthem();
    else await playStory();
  });
  progress.addEventListener('input', () => seek(Number(progress.value) / 10));
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
    caption.textContent = captions[language][activeScene < 0 ? 0 : activeScene];
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
  const shareText = 'Discover how ST‑Firm Akademie connects Kenya 🇰🇪 and Deutschland 🇩🇪 to build beyond borders.';
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
  render();
})();
