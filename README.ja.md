# OB Cloud Globe

Language: [English](README.md) | [简体中文](README.zh.md) | [日本語](README.ja.md)

複数クラウドの地域を地球・地図・テーブルで表示するインタラクティブビューア。データは YAML から読み込み、Three.js（地球）と AMap（地図）で描画し、テーブルでフィルタ・検索ができます。

ライブサイト: https://yizhouxw.github.io/obcloud-globe

## 特長
- 地球ビュー: プロバイダー色のマーカーと凡例
- 地図ビュー: AMap ベースの 2D 表示、近接マーカーの処理
- テーブルビュー: サイト / プロバイダー / チャネル / 地域検索フィルタと行ハイライト

## データ
- プロバイダーごとの YAML が `data/` に配置（例: `alibaba.yaml`, `aws.yaml` など）
- フィールド: `cloud_provider`, `region`, `region_code`, `launch_date`, `availability_zones`, `channels`, `obcloud_site`, `latitude`, `longitude`
- `region_code` は AZ プレフィックスのトリムに使用。AZ 命名と整合させてください
- 座標はマーカー位置決めのみで、情報パネルには表示しません

## ローカル実行
静的ファイルサーバー（Python 3 または Node.js）が必要です。

```bash
# リポジトリ直下で
./start.sh             # デフォルト 8000 番
# ポート指定
./start.sh 8080
```

ブラウザで `http://localhost:<port>` を開きます。

手動で起動する場合、プロジェクトルートから次のいずれかを実行します:
```bash
python3 -m http.server --directory public 8000
# または
npx http-server public -p 8000
```

## 地図 API キー
ローカル開発の場合、`public/` ディレクトリに `const AMAP_API_KEY = 'YOUR_AMAP_KEY_HERE';` という内容で `config.js` ファイルを作成してください。デプロイワークフローはこのキーを GitHub secrets から自動的に注入します。

## プロジェクト構成
- `public/` - すべての静的ファイルを含むウェブルート。
- `public/index.html` – メインのHTMLページとビューコンテナ。
- `public/styles.css` – アプリケーションの全スタイル。
- `public/src/` – JavaScriptソースコード (`app.js`, `globe-impl.js` など)。
- `public/data/` – YAML形式の地域データセット。
- `start.sh` – ローカル開発サーバーを起動するためのヘルパースクリプト。
- `.github/` – GitHub Actions のデプロイワークフロー。

## License
`LICENSE` を参照してください。

