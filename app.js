/*
 * EPIC BASS BOOSTED — GitHub Pages frontend
 *
 * Paste your separate Public API deployment URL here.
 * Example:
 * const PUBLIC_API_URL = 'https://script.google.com/macros/s/XXXXXXXXXXXX/exec';
 *
 * Do NOT paste the private Admin deployment URL here.
 */

const PUBLIC_API_URL = 'https://script.google.com/macros/s/AKfycbzh6_idhvoUSVJbvtXaYB-J6TQOb-Z1l3ZSTgiYGo3LBv1388gRiV1ctkvla0z0KA_m/exec';
console.log('EBB app.js loaded - version 3');
console.log('Public API URL:', PUBLIC_API_URL);

const PLATFORM_LABELS = {
  youtube_url: 'YT',
  spotify_url: 'SP',
  tiktok_url: 'TT',
  instagram_url: 'IG',
  youtube_music_url: 'YM',
  soundcloud_url: 'SC'
};

const OFFICIAL_LINKS = [
  ['youtube_url', 'YouTube'],
  ['spotify_url', 'Spotify'],
  ['tiktok_url', 'TikTok'],
  ['instagram_url', 'Instagram'],
  ['youtube_music_url', 'YouTube Music'],
  ['soundcloud_url', 'SoundCloud'],
  ['telegram_url', 'Telegram'],
  ['support_url', 'Support']
];

async function init() {
  if (!PUBLIC_API_URL || PUBLIC_API_URL.includes('PASTE_YOUR')) {
    renderFallback();
    return;
  }

  try {
    const data = await loadPublicDataJsonp();
    renderSite(data);
  } catch (error) {
    console.error(error);
    renderFallback('Could not load public data. Check the separate Public API deployment URL.');
  }
}

function loadPublicDataJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName = 'ebbPublicData_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    const separator = PUBLIC_API_URL.includes('?') ? '&' : '?';
    const url = `${PUBLIC_API_URL}${separator}action=publicData&callback=${callbackName}&v=${Date.now()}`;
    const script = document.createElement('script');
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Public API timeout'));
    }, 15000);

    window[callbackName] = data => {
      cleanup();
      if (!data || data.ok === false) reject(new Error(data?.error || 'Invalid public API response'));
      else resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Public API script failed to load'));
    };

    function cleanup() {
      clearTimeout(timer);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    script.src = url;
    document.head.appendChild(script);
  });
}

function renderSite(data) {
  const config = data.config || {};
  const tracks = data.tracks || [];
  const products = data.products || [];

  document.title = config.channel_name || 'Epic Bass Boosted';
  setText('channelName', config.channel_name || 'Epic Bass Boosted');
  setText('channelTagline', config.channel_tagline || 'Extreme bass, dark drops and subwoofer pressure.');
  setText('heroText', config.channel_tagline || 'Dark bass, extreme drops, super slowed edits and remixes built for car audio, night drives and heavy subwoofer energy.');

  document.documentElement.style.setProperty('--red', config.main_color || '#ff003c');
  document.documentElement.style.setProperty('--purple', config.secondary_color || '#7c3cff');

  const logo = config.channel_logo_url;
  if (logo) {
    const img = document.getElementById('channelLogo');
    img.src = logo;
    img.classList.remove('hidden');
    document.getElementById('fallbackLogo').classList.add('hidden');
  }

  renderTracks(tracks);
  renderProducts(products);
  renderOfficialLinks(config);
}

function renderTracks(tracks) {
  const el = document.getElementById('tracksGrid');

  if (!tracks.length) {
    el.innerHTML = `<div class="empty">No published tracks yet. New bass drops are coming soon.</div>`;
    return;
  }

  el.innerHTML = tracks.map(track => {
    const image = track.cover_url || '';
    const video = track.scene_video_url || '';
    const bg = image ? `style="background-image:url('${escapeAttr(image)}')"` : '';
    const media = video ? `<video src="${escapeAttr(video)}" muted loop playsinline autoplay></video>` : '';

    return `
      <article class="card">
        <div class="media" ${bg}>${media}</div>
        <div class="card-body">
          <span class="badge">${escapeHtml(track.release_type || 'Bass Boosted')}</span>
          <h3>${escapeHtml(track.title || 'Untitled Track')}</h3>
          <p>${escapeHtml(track.mood || track.music_style || 'Dark bass energy and subwoofer pressure.')}</p>
          <div class="platforms">
            ${renderPlatforms(track)}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderPlatforms(track) {
  return Object.keys(PLATFORM_LABELS).map(key => {
    const url = track[key];
    const label = PLATFORM_LABELS[key];

    if (!url) {
      return `<span class="platform disabled" title="Coming soon">${label}</span>`;
    }

    return `<a class="platform active" href="${escapeAttr(url)}" target="_blank" rel="noopener" title="Open ${label}">${label}</a>`;
  }).join('');
}

function renderProducts(products) {
  const el = document.getElementById('productsGrid');

  if (!products.length) {
    el.innerHTML = `<div class="empty">No products published in Bass Arsenal yet.</div>`;
    return;
  }

  el.innerHTML = products.map(product => {
    const image = product.cinematic_image_url || '';
    const bg = image ? `style="background-image:url('${escapeAttr(image)}')"` : '';

    return `
      <article class="card">
        <div class="media" ${bg}></div>
        <div class="card-body">
          <span class="badge">${escapeHtml(product.category || 'Bass Arsenal')}</span>
          <h3>${escapeHtml(product.product_name || 'Recommended Product')}</h3>
          <p>${escapeHtml(product.short_description || 'Selected for the Epic Bass Boosted community.')}</p>
          <div class="product-actions">
            ${product.product_link ? `<a class="link-btn" href="${escapeAttr(product.product_link)}" target="_blank" rel="noopener">View Product</a>` : `<span class="link-btn disabled">Coming Soon</span>`}
            ${product.related_video_url ? `<a class="link-btn" href="${escapeAttr(product.related_video_url)}" target="_blank" rel="noopener">Watch Video</a>` : ''}
            ${product.product_link ? `<button class="link-btn" onclick="copyText('${escapeAttr(product.product_link)}')">Copy Link</button>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderOfficialLinks(config) {
  const el = document.getElementById('officialLinks');
  el.innerHTML = OFFICIAL_LINKS.map(([key, label]) => {
    const url = config[key];

    if (!url) {
      return `<span class="official-link disabled">${label}<br><small>Coming soon</small></span>`;
    }

    return `<a class="official-link" href="${escapeAttr(url)}" target="_blank" rel="noopener">${label}</a>`;
  }).join('');
}

function renderFallback(message) {
  setText('channelName', 'Epic Bass Boosted');
  setText('channelTagline', 'Extreme bass, dark drops and subwoofer pressure.');
  document.getElementById('tracksGrid').innerHTML = `
    <div class="empty">
      ${escapeHtml(message || 'Connect your separate Public API URL inside app.js to load tracks from Google Sheets.')}
    </div>
  `;
  document.getElementById('productsGrid').innerHTML = `<div class="empty">Bass Arsenal will appear here after the API is connected.</div>`;
  document.getElementById('officialLinks').innerHTML = '';
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => alert('Link copied'));
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[m]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

init();
