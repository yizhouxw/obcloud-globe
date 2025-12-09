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

手動で起動する場合:
```bash
python3 -m http.server 8000
# または
npx http-server -p 8000
```

## 地図 API キー
`config.js` に `AMAP_API_KEY` が定義されています。必要に応じて自身のキーに置き換えてください。

## プロジェクト構成
- `index.html` – ページとビューコンテナ
- `app.js` – ロジック（データロード、ビュー、フィルタ、インタラクション）
- `globe-impl.js` – 地球描画
- `styles.css` – スタイル
- `data/` – 地域データ (YAML)
- `start.sh` – ローカル起動スクリプト

## License
`LICENSE` を参照してください。

