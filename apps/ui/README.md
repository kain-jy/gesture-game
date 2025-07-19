# AWS IVS Stage Viewer

AWS Interactive Video Service (IVS) Stage のストリームを視聴するためのWebアプリケーションです。

## 機能

- IVS Stage 対応
- 環境変数によるデフォルト設定
- チャットルーム ARN の表示
- リアルタイムストリーミング視聴

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`env.example` ファイルをコピーして `.env.local` を作成し、実際の値を設定してください：

```bash
cp env.example .env.local
```

#### 必要な環境変数

- `NEXT_PUBLIC_IVS_STAGE_ARN`: IVS Stage ARN（インタラクティブストリーミング用）
- `NEXT_PUBLIC_IVS_PARTICIPANT_TOKEN`: Stage参加者トークン（必須）
- `NEXT_PUBLIC_IVS_CHAT_ROOM_ARN`: チャットルーム ARN（チャット機能用）

### 3. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

## 使用方法

1. 環境変数で設定した Stage ARN が自動的に入力フィールドに表示されます
2. 必要に応じて ARN を変更できます
3. "Watch" ボタンをクリックしてストリームを開始します
4. チャットルーム ARN が設定されている場合、画面上に表示されます

## 技術スタック

- Next.js 14
- TypeScript
- Tailwind CSS
- AWS IVS Player SDK

## 注意事項

- IVS Stage を使用する場合は、必ず `NEXT_PUBLIC_IVS_PARTICIPANT_TOKEN` を設定してください
- 環境変数は `NEXT_PUBLIC_` プレフィックスが必要です（クライアントサイドで使用するため）
