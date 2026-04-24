class IconExplorerCard extends HTMLElement {
  constructor() {
    super();
    this._icons = [];
    this._filtered = [];
    this._loaded = false;
    this._searchQuery = '';
    this._pageSize = 50;
    this._currentPage = 1;
  }

  setConfig(config) {
    this.config = {
      title: 'Icon Explorer',
      columns: 6,
      icon_size: 32,
      show_names: true,
      page_size: 50,
      packs: ['mdi','hue','phu','si','fluent','icon-park','logos','wi'],
      ...config
    };
    this._pageSize = this.config.page_size;
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded) {
      this._loaded = true;
      this._loadAllIcons();
    }
  }

  async _loadAllIcons() {
    const CACHE_KEY = 'icon_explorer_v4';
    const CACHE_TIME_KEY = CACHE_KEY + '_time';
    const ONE_DAY = 24 * 60 * 60 * 1000;

    let allIcons = [];
    const cached = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cached && cacheTime && (Date.now() - parseInt(cacheTime) < ONE_DAY)) {
      try { allIcons = JSON.parse(cached); } catch (e) { allIcons = []; }
    }

    if (allIcons.length === 0) {
      const packs = this.config.packs || ['mdi','hue','phu','si','fluent','icon-park','logos','wi'];
      const promises = packs.map(p => this._loadPack(p));
      const results = await Promise.allSettled(promises);

      allIcons = [];
      for (const result of results) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          allIcons.push(...result.value);
        }
      }

      if (allIcons.length === 0) {
        allIcons = this._getFallbackIcons();
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(allIcons));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    }

    const extra = Array.isArray(this.config.extra_icons) ? this.config.extra_icons : [];
    this._icons = [...allIcons, ...extra];
    this._filtered = [...this._icons];
    this._currentPage = 1;
    this._render();
  }

  async _loadPack(pack) {
    switch (pack) {
      case 'mdi': return this._loadMdiIcons();
      case 'hue': return this._loadHueIcons();
      case 'phu': return this._loadPhuIcons();
      case 'si': return this._loadSimpleIcons();
      case 'fluent': return this._loadFluentIcons();
      case 'icon-park': return this._loadIconParkIcons();
      case 'logos': return this._loadLogosIcons();
      case 'wi': return this._loadWeatherIcons();
      default: return [];
    }
  }

  async _loadMdiIcons() {
    try {
      const res = await fetch('https://cdn.jsdelivr.net/npm/@mdi/svg@latest/meta.json');
      const meta = await res.json();
      return meta.map(i => `mdi:${i.name}`);
    } catch (e) { console.warn('IconExplorer: MDI failed', e); return []; }
  }

  async _loadHueIcons() {
    try {
      const res = await fetch('https://raw.githubusercontent.com/arallsopp/hass-hue-icons/main/dist/hass-hue-icons.js');
      const text = await res.text();
      const icons = [];
      for (const line of text.split('\n')) {
        const t = line.trim();
        if (t.startsWith('"') && t.includes('":{')) {
          const name = t.split('"')[1];
          if (name && name !== 'path' && name !== 'keywords') icons.push(`hue:${name}`);
        }
      }
      return icons;
    } catch (e) { console.warn('IconExplorer: Hue failed', e); return []; }
  }

  async _loadPhuIcons() {
    try {
      const res = await fetch('https://raw.githubusercontent.com/elax46/custom-brand-icons/main/dist/custom-brand-icons.js');
      const text = await res.text();
      const icons = [];
      for (const line of text.split('\n')) {
        const t = line.trim();
        if (t.startsWith('"') && t.includes('":[')) {
          const name = t.split('"')[1];
          if (name && name.length > 1) icons.push(`phu:${name}`);
        }
      }
      return icons;
    } catch (e) { console.warn('IconExplorer: PHU failed', e); return []; }
  }

  async _loadSimpleIcons() {
    try {
      const res = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/develop/slugs.md');
      const text = await res.text();
      const icons = [];
      for (const line of text.split('\n')) {
        const t = line.trim();
        if (t.startsWith('| `') && t.includes('` |')) {
          const m = t.match(/\|`([^`]+)`\s*\|/);
          if (m && m[1]) icons.push(`si:${m[1]}`);
        }
      }
      return icons;
    } catch (e) { console.warn('IconExplorer: SI failed', e); return []; }
  }

  async _loadFluentIcons() {
    try {
      const res = await fetch('https://api.github.com/repos/microsoft/fluentui-system-icons/git/trees/main?recursive=1');
      const data = await res.json();
      if (!data.tree) return [];
      const icons = new Set();
      for (const item of data.tree) {
        const path = item.path;
        if (path.startsWith('assets/') && path.endsWith('.svg')) {
          const filename = path.split('/').pop();
          if (filename.startsWith('ic_fluent_')) {
            const name = filename.replace('ic_fluent_', '').replace('.svg', '');
            const parts = name.split('_');
            let iconName;
            if (parts.length >= 2 && (parts[parts.length-1] === 'regular' || parts[parts.length-1] === 'filled' || parts[parts.length-1] === 'color')) {
              if (parts[parts.length-2].match(/^\d+$/)) {
                iconName = parts.slice(0, -2).join('_');
              } else {
                iconName = parts.slice(0, -1).join('_');
              }
            } else if (parts.length >= 1 && parts[parts.length-1].match(/^\d+$/)) {
              iconName = parts.slice(0, -1).join('_');
            } else {
              iconName = name;
            }
            if (iconName) icons.add(`fluent:${iconName}`);
          }
        }
      }
      return Array.from(icons);
    } catch (e) { console.warn('IconExplorer: Fluent failed', e); return []; }
  }

  async _loadIconParkIcons() {
    try {
      const res = await fetch('https://api.github.com/repos/bytedance/IconPark/git/trees/master?recursive=1');
      const data = await res.json();
      if (!data.tree) return [];
      const icons = [];
      for (const item of data.tree) {
        const path = item.path;
        if (path.startsWith('source/') && path.endsWith('.svg')) {
          const name = path.split('/').pop().replace('.svg', '');
          if (name) icons.push(`icon-park:${name}`);
        }
      }
      return icons;
    } catch (e) { console.warn('IconExplorer: IconPark failed', e); return []; }
  }

  async _loadLogosIcons() {
    try {
      const res = await fetch('https://api.github.com/repos/gilbarbara/logos/git/trees/main?recursive=1');
      const data = await res.json();
      if (!data.tree) return [];
      const icons = [];
      for (const item of data.tree) {
        const path = item.path;
        if (path.endsWith('.svg')) {
          const name = path.split('/').pop().replace('.svg', '');
          if (name && !name.startsWith('.')) icons.push(`logos:${name}`);
        }
      }
      return icons;
    } catch (e) { console.warn('IconExplorer: Logos failed', e); return []; }
  }

  async _loadWeatherIcons() {
    try {
      const res = await fetch('https://api.github.com/repos/erikflowers/weather-icons/git/trees/master?recursive=1');
      const data = await res.json();
      if (!data.tree) return [];
      const icons = [];
      for (const item of data.tree) {
        const path = item.path;
        if (path.includes('svg/') && path.endsWith('.svg')) {
          const name = path.split('/').pop().replace('.svg', '');
          if (name && !name.startsWith('.')) icons.push(`wi:${name}`);
        }
      }
      return icons;
    } catch (e) { console.warn('IconExplorer: WI failed', e); return []; }
  }

  _getFallbackIcons() {
    return [
      'mdi:home','mdi:lightbulb','mdi:flash','mdi:thermometer','mdi:water','mdi:fire',
      'mdi:account','mdi:bed','mdi:sofa','mdi:fridge','mdi:washing-machine','mdi:car',
      'mdi:garage','mdi:door','mdi:window','mdi:bell','mdi:camera','mdi:lock'
    ];
  }

  _filter(query) {
    this._searchQuery = query.toLowerCase().trim();
    this._currentPage = 1;
    if (!this._searchQuery) {
      this._filtered = [...this._icons];
    } else {
      this._filtered = this._icons.filter(name =>
        name.toLowerCase().includes(this._searchQuery)
      );
    }
    this._renderGrid();
  }

  _copy(name) {
    const cb = navigator.clipboard;
    if (cb && cb.writeText) {
      cb.writeText(name).then(() => this._showToast(`Copied: ${name}`));
    } else {
      const ta = document.createElement('textarea');
      ta.value = name; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      this._showToast(`Copied: ${name}`);
    }
  }

  _showToast(msg) {
    const t = this.querySelector('.toast');
    if (t) { t.textContent = msg; t.style.opacity = '1'; setTimeout(() => t.style.opacity = '0', 1500); }
  }

  _render() {
    this.innerHTML = '';
    const card = document.createElement('ha-card');
    card.style.padding = '16px'; card.style.display = 'block';

    const title = document.createElement('div');
    title.style.fontSize = '18px'; title.style.fontWeight = '500'; title.style.marginBottom = '12px';
    title.textContent = this.config.title;
    card.appendChild(title);

    const searchRow = document.createElement('div');
    searchRow.style.display = 'flex'; searchRow.style.gap = '8px'; searchRow.style.marginBottom = '8px';

    const input = document.createElement('input');
    input.type = 'text'; input.placeholder = 'Search icons...';
    input.style.flex = '1'; input.style.padding = '8px 12px'; input.style.borderRadius = '8px';
    input.style.border = '1px solid var(--divider-color, #e0e0e0)';
    input.style.background = 'var(--card-background-color, #fff)';
    input.style.color = 'var(--primary-text-color, #000)';
    input.style.fontSize = '14px';
    input.value = this._searchQuery;
    input.addEventListener('input', (e) => this._filter(e.target.value));
    searchRow.appendChild(input);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.padding = '8px 12px'; clearBtn.style.borderRadius = '8px';
    clearBtn.style.border = 'none'; clearBtn.style.background = 'var(--primary-color, #03a9f4)';
    clearBtn.style.color = '#fff'; clearBtn.style.cursor = 'pointer'; clearBtn.style.fontSize = '14px';
    clearBtn.addEventListener('click', () => { input.value = ''; this._filter(''); });
    searchRow.appendChild(clearBtn);
    card.appendChild(searchRow);

    const countLabel = document.createElement('div');
    countLabel.className = 'count-label';
    countLabel.style.fontSize = '12px';
    countLabel.style.color = 'var(--secondary-text-color, #888)';
    countLabel.style.marginBottom = '8px';
    card.appendChild(countLabel);

    const grid = document.createElement('div');
    grid.className = 'icon-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${this.config.columns}, 1fr)`;
    grid.style.gap = '8px';
    grid.style.maxHeight = '500px';
    grid.style.overflowY = 'auto';
    card.appendChild(grid);

    const loadMoreRow = document.createElement('div');
    loadMoreRow.className = 'load-more-row';
    loadMoreRow.style.textAlign = 'center';
    loadMoreRow.style.marginTop = '12px';
    card.appendChild(loadMoreRow);

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.position = 'fixed'; toast.style.bottom = '24px'; toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)'; toast.style.background = 'var(--primary-text-color, #000)';
    toast.style.color = 'var(--card-background-color, #fff)'; toast.style.padding = '10px 18px';
    toast.style.borderRadius = '8px'; toast.style.fontSize = '14px';
    toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s';
    toast.style.pointerEvents = 'none'; toast.style.zIndex = '9999';
    card.appendChild(toast);

    this.appendChild(card);
    this._grid = grid;
    this._countLabel = countLabel;
    this._loadMoreRow = loadMoreRow;
    this._renderGrid();
  }

  _renderGrid() {
    if (!this._grid) return;
    this._grid.innerHTML = '';

    const total = this._filtered.length;
    const visible = Math.min(this._currentPage * this._pageSize, total);
    const pageItems = this._filtered.slice(0, visible);

    if (this._countLabel) {
      this._countLabel.textContent = total > 0
        ? `Showing ${visible} of ${total} icons`
        : 'No icons found.';
    }

    if (total === 0) {
      const empty = document.createElement('div');
      empty.style.gridColumn = '1 / -1';
      empty.style.textAlign = 'center';
      empty.style.padding = '24px';
      empty.style.color = 'var(--secondary-text-color, #888)';
      empty.textContent = 'No icons found.';
      this._grid.appendChild(empty);
      this._loadMoreRow.innerHTML = '';
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const name of pageItems) {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'center';
      item.style.padding = '6px 4px';
      item.style.borderRadius = '8px';
      item.style.cursor = 'pointer';
      item.style.transition = 'background 0.2s';
      item.addEventListener('mouseenter', () => { item.style.background = 'var(--secondary-background-color, #f5f5f5)'; });
      item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
      item.addEventListener('click', () => this._copy(name));

      const icon = document.createElement('ha-icon');
      icon.setAttribute('icon', name);
      icon.style.width = `${this.config.icon_size}px`;
      icon.style.height = `${this.config.icon_size}px`;
      icon.style.color = 'var(--primary-text-color, #000)';
      item.appendChild(icon);

      if (this.config.show_names) {
        const label = document.createElement('div');
        label.style.fontSize = '10px'; label.style.marginTop = '3px';
        label.style.textAlign = 'center'; label.style.wordBreak = 'break-all';
        label.style.color = 'var(--secondary-text-color, #666)';
        label.style.lineHeight = '1.2'; label.style.maxWidth = '100%';
        label.textContent = name.replace(/^[^:]+:/, '');
        item.appendChild(label);
      }
      fragment.appendChild(item);
    }
    this._grid.appendChild(fragment);

    this._loadMoreRow.innerHTML = '';
    if (visible < total) {
      const btn = document.createElement('button');
      btn.textContent = `Load more (+${Math.min(this._pageSize, total - visible)})`;
      btn.style.padding = '8px 16px'; btn.style.borderRadius = '8px';
      btn.style.border = '1px solid var(--primary-color, #03a9f4)';
      btn.style.background = 'transparent';
      btn.style.color = 'var(--primary-color, #03a9f4)';
      btn.style.cursor = 'pointer'; btn.style.fontSize = '14px';
      btn.addEventListener('click', () => {
        this._currentPage++;
        this._renderGrid();
      });
      this._loadMoreRow.appendChild(btn);
    } else if (total > this._pageSize) {
      const allLoaded = document.createElement('span');
      allLoaded.textContent = `${total} icons loaded`;
      allLoaded.style.fontSize = '12px';
      allLoaded.style.color = 'var(--secondary-text-color, #888)';
      this._loadMoreRow.appendChild(allLoaded);
    }
  }

  getCardSize() { return 6; }
}

customElements.define('icon-explorer-card', IconExplorerCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'icon-explorer-card',
  name: 'Icon Explorer',
  description: 'Search and browse all installed icon packs (MDI, Hue, PHU, SI, Fluent, IconPark, Logos, Weather)',
  preview: false
});
