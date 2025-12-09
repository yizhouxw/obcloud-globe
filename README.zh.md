# OB Cloud Globe

语言： [English](README.md) | [简体中文](README.zh.md) | [日本語](README.ja.md)

交互式球体、地图和表格视图，展示多云地域分布。数据来自 YAML 文件，使用 Three.js（地球）与高德地图（地图）渲染，表格便于筛选与快速查看。

线上访问： https://yizhouxw.github.io/obcloud-globe

## 功能
- 地球视图：按云厂商上色的标记与图例
- 地图视图：基于高德地图的 2D 展示，支持聚合附近标记
- 表格视图：支持站点 / 云厂商 / 渠道 / 地域搜索过滤，行高亮

## 数据
- 每个云厂商一个 YAML 文件，位于 `data/`（如 `alibaba.yaml`, `aws.yaml` 等）
- 字段：`cloud_provider`, `region`, `region_code`, `launch_date`, `availability_zones`, `channels`, `obcloud_site`, `latitude`, `longitude`
- `region_code` 用于裁剪可用区前缀，需与 AZ 命名保持一致
- 经纬度仅用于定位标记，不在地域信息面板展示

## 本地运行
需要一个静态文件服务器（Python 3 或 Node.js）。

```bash
# 仓库根目录
./start.sh             # 默认端口 8000
# 或指定端口
./start.sh 8080
```

然后在浏览器打开 `http://localhost:<port>`。

如果想手动运行：
```bash
python3 -m http.server 8000
# 或
npx http-server -p 8000
```

## 地图 API Key
`config.js` 中包含 `AMAP_API_KEY`，如需请替换为你的密钥。

## 项目结构
- `index.html` – 页面框架与视图容器
- `app.js` – 逻辑（数据加载、视图、过滤、交互）
- `globe-impl.js` – 地球渲染
- `styles.css` – 样式
- `data/` – 地域数据（YAML）
- `start.sh` – 本地启动脚本

## License
见 `LICENSE`。

