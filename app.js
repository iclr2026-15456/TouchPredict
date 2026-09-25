'use strict';
const config = window.PROJECT;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#authors').textContent = config.authors;
$('#project-subtitle').textContent = config.subtitle;
document.title = config.title;
for (const [key, label] of [['paperUrl', 'Read paper'], ['codeUrl', 'Source code']]) {
  if (config[key]) {
    const link = document.createElement('a'); link.href = config[key]; link.className = 'button outline';
    link.textContent = label + ' ↗'; link.target = '_blank'; link.rel = 'noopener'; $('#publication-links').append(link);
  }
}
function createVideo(id, stream, label, tag = '') {
  const tile = document.createElement('div'); tile.className = 'video-tile';
  const title = document.createElement('p'); title.className = 'tile-label';
  const text = document.createElement('span'); text.textContent = label;
  title.append(text);
  if (tag) { const t = document.createElement('span'); t.className = 'tile-tag'; t.textContent = tag; title.append(t); }
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'metadata';
  video.poster = `assets/tactile-posters/${id}_${stream}.jpg`;
  video.src = `assets/tactile-videos/${id}_${stream}.mp4`;
  video.setAttribute('aria-label', label); video.setAttribute('disablepictureinpicture', '');
  video.addEventListener('error', () => {
    if (tile.querySelector('.media-error')) return;
    const error = document.createElement('p'); error.className = 'media-error';
    error.textContent = 'Video unavailable. Try another sequence.'; tile.append(error);
  });
  tile.append(title, video); return tile;
}
class SyncedPlayer {
  constructor(videos, onChange = () => {}) {
    this.videos = videos; this.master = videos[0]; this.onChange = onChange; this.playing = false; this.disposed = false;
    this.master.addEventListener('ended', () => { if (this.disposed) return; this.seek(0); if(this.playing) this.play(); });
    this.master.addEventListener('timeupdate', () => this.update());
    this.master.addEventListener('loadedmetadata', () => this.update());
  }
  get duration() { return Number.isFinite(this.master.duration) ? this.master.duration : 0; }
  update() {
    if(this.disposed) return;
    if(this.playing) for(const v of this.videos.slice(1)) {
      if (v.readyState >= 2 && Math.abs(v.currentTime - this.master.currentTime) > .10) v.currentTime = this.master.currentTime;
    }
    this.onChange(this);
  }
  async play() {
    if(this.disposed) return;
    this.playing = true; this.update();
    const result = await Promise.allSettled(this.videos.map(v => v.play()));
    if(this.disposed) return;
    if(result.some(r => r.status === 'rejected')) this.pause();
  }
  pause() { this.playing = false; this.videos.forEach(v => v.pause()); this.update(); }
  seek(time) { this.videos.forEach(v => { if(v.readyState >= 1) v.currentTime = Math.min(time, Math.max(0,v.duration-.001)); }); this.update(); }
  dispose() { this.pause(); this.disposed = true; this.videos.forEach(v => {v.removeAttribute('src'); v.load();}); }
}
let sample = config.defaultSample, comparison;
function renderComparison() {
  const wasPlaying = comparison?.playing || false;
  if(comparison) comparison.dispose();
  $('#comparison-grid').replaceChildren(
    createVideo(sample,'gt_video','Egocentric RGB','INPUT'),
    createVideo(sample,'gen_tactile','Our generation','Tactile'),
    createVideo(sample,'gt_tactile','Ground truth','Tactile')
  );
  comparison = new SyncedPlayer($$('#comparison-grid video'));
  $$('#comparison-grid video').forEach(v => {
    v.setAttribute('tabindex','0'); v.setAttribute('role','button');
    v.setAttribute('aria-label',`${v.getAttribute('aria-label')} — click to play or pause all three`);
    v.addEventListener('click',() => comparison.playing ? comparison.pause() : comparison.play());
    v.addEventListener('keydown',e => {if(e.key==='Enter'||e.key===' '){e.preventDefault();comparison.playing ? comparison.pause() : comparison.play();}});
  });
  $$('[data-sample]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sample === sample)));
  if(wasPlaying || (!reducedMotion && galleryVisible)) comparison.play();
}
$('#sequence-count').textContent = `${config.samples.length} sequences`;
config.samples.forEach(id => {
  const b = document.createElement('button'); b.className = 'thumbnail'; b.dataset.sample = id;
  b.setAttribute('aria-label', `Select sequence ${id}`); b.setAttribute('aria-pressed', String(id===sample));
  const img = document.createElement('img'); img.src = `assets/tactile-posters/${id}_gt_video.jpg`; img.alt = ''; img.loading = 'lazy';
  b.append(img);
  b.addEventListener('click', () => {sample=id;renderComparison();}); $('#thumbnails').append(b);
});
let galleryVisible = false;
new IntersectionObserver(entries => {
  galleryVisible = entries[0].isIntersecting;
  if (!comparison) return;
  if (galleryVisible && !reducedMotion) comparison.play();
  else comparison.pause();
},{threshold:.2}).observe($('#comparison-grid'));
renderComparison();
document.addEventListener('visibilitychange', () => {if(document.hidden && comparison) comparison.pause();});
