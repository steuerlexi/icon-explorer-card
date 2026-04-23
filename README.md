# 🔍 Icon Explorer Card

A **Home Assistant Lovelace custom card** to search and browse all your installed icon packs with live search, pagination, and one-click copy to clipboard.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![release](https://img.shields.io/github/v/release/steuerlexi/icon-explorer-card?style=for-the-badge)](https://github.com/steuerlexi/icon-explorer-card/releases)
[![license](https://img.shields.io/github/license/steuerlexi/icon-explorer-card?style=for-the-badge)](LICENSE)

---
<img width="562" height="260" alt="image" src="https://github.com/user-attachments/assets/5b3cc111-3c07-4d21-b157-069a5ab121f1" />


## ✨ Features

- 🔍 **Live Search** — Instantly filter icons as you type
- 📄 **Pagination** — Loads icons in chunks, no browser freeze
- 📋 **One-Click Copy** — Click any icon to copy its name (`mdi:home`, `si:github`, etc.) to your clipboard
- 🎨 **Multi-Pack Support** — Configure which icon packs to include
- ⚡ **Smart Caching** — 24h localStorage cache for instant reloads
- ⚙️ **Fully Configurable** — Columns, size, names, page size

---

## 🚀 Installation

### 📦 HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Go to **Frontend** → **Custom repositories**
3. Add: `https://github.com/steuerlexi/icon-explorer-card`
4. Select category: **Lovelace**
5. Install the card
6. Hard refresh your browser (`Ctrl+F5` / `Cmd+Shift+R`)

### 🛠️ Manual

1. Copy `dist/icon-explorer-card.js` to `/config/www/`
2. Add to your Lovelace resources:
   ```yaml
   url: /local/icon-explorer-card.js
   type: module
   ```
3. Refresh your browser

---

## 🎨 Supported Icon Packs

The card can load metadata from any icon pack hosted on GitHub. By default it loads all available packs.

| Prefix | Pack | Source |
|--------|------|--------|
| `mdi:` | Material Design Icons | [Templarian/MaterialDesign](https://github.com/Templarian/MaterialDesign) |
| `si:` | Simple Icons | [simple-icons/simple-icons](https://github.com/simple-icons/simple-icons) |
| `hue:` | Hass Hue Icons | [arallsopp/hass-hue-icons](https://github.com/arallsopp/hass-hue-icons) |
| `phu:` | Custom Brand Icons | [elax46/custom-brand-icons](https://github.com/elax46/custom-brand-icons) |
| `fluent:` | Fluent UI System Icons | [microsoft/fluentui-system-icons](https://github.com/microsoft/fluentui-system-icons) |
| `icon-park:` | IconPark | [bytedance/IconPark](https://github.com/bytedance/IconPark) |
| `logos:` | SVG Logos | [gilbarbara/logos](https://github.com/gilbarbara/logos) |
| `wi:` | Weather Icons | [erikflowers/weather-icons](https://github.com/erikflowers/weather-icons) |

---

## ⚙️ Configuration

Add the card to your dashboard:

```yaml
type: custom:icon-explorer-card
title: "Icon Explorer"
columns: 6
icon_size: 32
show_names: true
page_size: 200
```

### 📋 Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | `"Icon Explorer"` | Card title |
| `columns` | number | `6` | Grid columns |
| `icon_size` | number | `32` | Icon size in px |
| `show_names` | boolean | `true` | Show icon names |
| `page_size` | number | `200` | Icons per page |
| `packs` | list | all | Which packs to load (see below) |
| `extra_icons` | list | `[]` | Additional custom icons |

### 🎒 Limit Which Packs Load

If you only want specific packs:

```yaml
type: custom:icon-explorer-card
title: "My Icons"
packs:
  - mdi
  - si
```

Available pack keys: `mdi`, `si`, `hue`, `phu`, `fluent`, `icon-park`, `logos`, `wi`

### ➕ Add Extra Icons

```yaml
type: custom:icon-explorer-card
extra_icons:
  - custom:my-icon
  - fas:fa-star
```

---

## 🧠 How It Works

The card fetches icon metadata directly from each pack's GitHub repository on first load, then caches it in your browser's `localStorage` for 24 hours.

**Using the card:** Type in the search box to filter icons, then **click any icon** to copy its full name (e.g. `mdi:home`, `si:github`) directly to your clipboard. A small toast notification confirms the copy.

No data is stored on any server — everything happens client-side.

---

## 🛟 Troubleshooting

| Problem | Solution |
|---------|----------|
| Icons don't load | Check browser console for network errors. The card needs internet on first load. |
| Browser freezes | Reduce `page_size` to `100` or `50`. |
| Stale icons | Run `localStorage.removeItem('icon_explorer_v4')` in browser console, then refresh. |
| Custom icons not rendering | Make sure the icon pack is installed and loaded in Home Assistant. |

---

## 📄 License

MIT
