# UI アプリケーション

Amazon IVS統合機能を持つNext.jsアプリケーションです。

## セットアップ

1. 依存関係をインストール:
```bash
npm install
```

2. 開発サーバーを起動:
```bash
npm run dev
```

## ビルドプロセス

ビルドプロセスでは、npmパッケージから必要なAmazon IVS WASMファイルが自動的にコピーされます:

- `amazon-ivs-wasmworker.min.wasm` (1.2MB)
- `amazon-ivs-wasmworker.min.js` (110KB)

これらのファイルは、ビルドプロセス中に`node_modules/amazon-ivs-player/dist/assets/`からコピーされ、`public/`ディレクトリに配置されます。

### 手動コピー

IVSファイルを手動でコピーする必要がある場合:

```bash
npm run copy-ivs
```

### ビルド

```bash
npm run build
```

`prebuild`スクリプトがビルド前に自動的に実行され、WASMファイルが利用可能であることを保証します。

## ファイル管理

- WASMファイルはGitにコミットされません（`.gitignore`で除外）
- ファイルはビルド時に自動的に配置されます
- バージョンは`amazon-ivs-player`パッケージのバージョンと同期されます

## 開発

- [http://localhost:3000](http://localhost:3000)を開いてアプリケーションを表示
- 開発サーバーは、IVSファイルが存在しない場合に自動的に配置します
