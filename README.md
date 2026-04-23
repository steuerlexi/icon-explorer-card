# Icon Explorer Card

A Home Assistant Lovelace custom card to search and browse **all your installed icon packs** with live search, pagination, and one-click copy to clipboard.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

## Features

- **Live Search** - Instantly filter 18,000+ icons as you type
- **Pagination** - Loads 200 icons at a time, no browser freeze
- **One-Click Copy** - Click any icon to copy its name to clipboard
- **All Icon Packs** - Automatically discovers and indexes:
  - Material Design Icons (`mdi:`) - ~7,000
  - Hass Hue Icons (`hue:`) - 512
  - Custom Brand Icons (`phu:`) - 1,577
  - Simple Icons (`si:`) - ~3,000
  - Fluent UI System Icons (`fluent:`) - ~1,600
  - IconPark (`icon-park:`) - 2,658
  - SVG Logos (`logos:`) - 1,863
  - Weather Icons (`wi:`) - 219
- **Smart Caching** - Icons are cached in localStorage for 24 hours
- **Custom Packs** - Add your own extra icons via config
- **Fully Configurable** - Columns, icon size, show/hide names

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to **Frontend** → **Custom repositories**
3. Add repository URL: `https://github.com/YOUR_USERNAME/icon-explorer-card`
4. Select category: **Lovelace**
5. Install the card
6. Refresh your browser (Ctrl+F5 / Cmd+Shift+R)

### Manual

1. Copy `dist/icon-explorer-card.js` to `/config/www/`
2. Add to your Lovelace resources:
   ```yaml
   url: /local/icon-explorer-card.js
   type: module
   ```
3. Refresh your browser

## Configuration

Add the card to your dashboard:

```yaml
type: custom:icon-explorer-card
title: "Icon Explorer"
columns: 6
icon_size: 32
show_names: true
page_size: 200
# Optional: limit which packs to load
packs:
  - mdi
  - hue
  - phu
  - si
  - fluent
  - icon-park
  - logos
  - wi
# Optional: add extra icons
extra_icons:
  - custom:my-icon
```

### Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| title | string | "Icon Explorer" | Card title |
| columns | number | 6 | Number of columns in the grid |
| icon_size | number | 32 | Icon size in pixels |
| show_names | boolean | true | Show icon names below icons |
| page_size | number | 200 | Icons per page |
| packs | list | all | Which icon packs to load |
| extra_icons | list | [] | Additional custom icons |

## How It Works

The card dynamically loads icon metadata from GitHub repositories on first use:
- MDI: `cdn.jsdelivr.net/npm/@mdi/svg@latest/meta.json`
- Hue: `raw.githubusercontent.com/arallsopp/hass-hue-icons/...`
- PHU: `raw.githubusercontent.com/elax46/custom-brand-icons/...`
- Simple Icons: `raw.githubusercontent.com/simple-icons/simple-icons/...`
- Fluent UI: `api.github.com/repos/microsoft/fluentui-system-icons/...`
- IconPark: `api.github.com/repos/bytedance/IconPark/...`
- Logos: `api.github.com/repos/gilbarbara/logos/...`
- Weather Icons: `api.github.com/repos/erikflowers/weather-icons/...`

All data is cached in your browser's localStorage for 24 hours.

## Troubleshooting

**Icons don't load?**
- Check browser console for network errors
- The card needs internet access to fetch icon metadata on first load
- Clear localStorage (`localStorage.removeItem('icon_explorer_v4')`) to force refresh

**Browser freezes?**
- Reduce `page_size` to 100 or 50
- Remove some packs from the `packs` list

**Custom icons not showing?**
- Make sure the icon pack is properly installed in Home Assistant
- The card only shows icons that HA's icon resolver can render

## License

MIT
