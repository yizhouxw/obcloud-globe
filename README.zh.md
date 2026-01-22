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

如果想手动运行，请在项目根目录执行以下命令之一：
```bash
python3 -m http.server --directory public 8000
# 或
npx http-server public -p 8000
```

## 地图 API Key
本地开发时，请在 `public/` 目录下创建一个 `config.js` 文件，内容为 `const AMAP_API_KEY = 'YOUR_AMAP_KEY_HERE';`。部署工作流会自动从 GitHub secrets 注入此密钥。

## 项目结构
- `public/` - 包含所有静态文件的网站根目录。
- `public/index.html` – 主 HTML 页面与视图容器。
- `public/styles.css` – 全部应用样式。
- `public/src/` – JavaScript 源代码 (`app.js`, `globe-impl.js` 等)。
- `public/data/` – YAML 格式的地域数据集。
- `start.sh` – 用于运行本地开发服务器的辅助脚本。
- `.github/` – GitHub Actions 部署工作流。

## License
见 `LICENSE`。

