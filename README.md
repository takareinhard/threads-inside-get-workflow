# Threads Insight Workflow for n8n

Threads の投稿インサイトを自動で収集し、Google Sheets にランキング付きで蓄積する `n8n` ワークフローです。

単に数値を貯めるだけではなく、`views`・`likes`・`replies` を使って投稿ごとの反応を比較しやすい形に整えています。運用の振り返り、伸びた投稿の発見、改善ネタ探しに向いた構成です。

## できること

- Threads API から投稿一覧を取得
- 各投稿ごとの `views` / `likes` / `replies` / `reposts` / `quotes` を収集
- 総合エンゲージメント率を計算してランキング化
- Google Sheets に追記・更新して一覧管理
- 定期実行で最新のインサイトを継続収集

## 向いている使い方

- Threads 運用を感覚ではなく数値で見直したい
- どの投稿が強かったかをすぐ比較したい
- 投稿ネタの改善サイクルを作りたい
- `n8n` と Threads API を組み合わせた構成例を見たい

## 公開ファイル

```text
workflows/
  threads-insights-sanitized.json
scripts/
  sanitize-n8n-workflow.mjs
```

対象 workflow:
[`workflows/threads-insights-sanitized.json`](workflows/threads-insights-sanitized.json)

## ワークフローの流れ

1. スケジュールで起動
2. Threads の投稿一覧を取得
3. 各投稿の insights を順番に取得
4. `likes` と `replies` をもとにエンゲージメント率を算出
5. Google Sheets にランキング付きで書き戻し

## この workflow の見どころ

### 1. Threads 運用を見える化できる
投稿単位の数値を一覧化しているので、どの投稿が伸びたのかを振り返りやすくなります。

### 2. ただの保存ではなく、比較しやすい
閲覧数だけでなく、総合エンゲージメント率で並べることで「反応の濃さ」が見えやすくなっています。

### 3. n8n だけで完結しやすい
取得、整形、ループ、更新までを `n8n` の標準ノード中心で構成しているので、流れを追いやすく、改造もしやすいです。

## セットアップのポイント

公開版では次の値を伏せています。

- Threads のアクセストークン
- Threads のユーザー ID
- Google Sheets のドキュメント ID / シート参照
- credential 情報
- インスタンス固有のメタデータ

利用時は自分の環境に合わせて差し替えてください。

## サニタイズについて

このリポジトリには公開用にサニタイズした JSON のみを含めています。元の export に含まれる認証情報や識別子は公開していません。

スクリプトを使うと、手元の非公開 workflow から公開用 JSON を再生成できます。

```bash
node scripts/sanitize-n8n-workflow.mjs <private-workflow.json> <public-output.json>
```

## 技術スタック

- `n8n`
- `JavaScript`
- `Threads API`
- `Google Sheets`

## 想定読者

- Threads の運用改善に興味がある人
- `n8n` で API 連携フローを組みたい人
- 自分の自動化 workflow をポートフォリオとして公開したい人

## License

Portfolio and educational use.
