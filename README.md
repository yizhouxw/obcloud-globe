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

If you prefer manual commands, run one of these from the project root:
```bash
python3 -m http.server --directory public 8000
# or
npx http-server public -p 8000
```

## Map API key
For local development, create a file named `public/config.js` with the content `const AMAP_API_KEY = 'YOUR_AMAP_KEY_HERE';`. The deployment workflow injects this key automatically from GitHub secrets.

## Project layout
- `public/` - The web root containing all static files.
- `public/index.html` – The main HTML page and view containers.
- `public/styles.css` – All application styles.
- `public/src/` – JavaScript source code (`app.js`, `globe-impl.js`, etc.).
- `public/data/` – Region datasets in YAML format.
- `start.sh` – Helper script to run a local development server.
- `.github/` – GitHub Actions deployment workflow.

## License
See `LICENSE`.

