# OB Cloud Globe

Language: [English](README.md) | [简体中文](README.zh.md) | [日本語](README.ja.md)

Interactive globe, map, and table for viewing multi-cloud regions. Data is loaded from YAML files and rendered in Three.js (globe) and AMap (map), with a table view for quick scanning and filtering.

Live site: https://yizhouxw.github.io/obcloud-globe

## Features
- Globe view with provider-colored markers and legend
- AMap-based 2D map with clustering for nearby markers
- Table view with filters (site/provider/channel/region search) and row highlight

## Data
- YAML files per provider in `data/` (e.g., `alibaba.yaml`, `aws.yaml`, …).
- Region fields: `cloud_provider`, `region`, `region_code`, `launch_date`, `availability_zones`, `channels`, `obcloud_site`, `latitude`, `longitude`.
- `region_code` is used to trim AZ prefixes; keep it aligned with the AZ naming scheme.
- Coordinates are only for positioning markers; they are not shown in the info panel.

## Running locally
Requires a simple static file server (Python 3 or Node.js).

```bash
# From repo root
./start.sh             # default port 8000
# or specify port
./start.sh 8080
```

Then open `http://localhost:<port>` in a modern browser.

If you prefer manual commands:
```bash
python3 -m http.server 8000
# or
npx http-server -p 8000
```

## Map API key
`config.js` contains `AMAP_API_KEY`. Replace it with your own key if needed.

## Project layout
- `index.html` – main page and view containers
- `app.js` – app logic (data load, views, filters, interactions)
- `globe-impl.js` – globe rendering
- `styles.css` – styling
- `data/` – region datasets (YAML)
- `start.sh` – helper to launch a local static server

## License
See `LICENSE`.

