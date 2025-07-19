# IVS Chat Token Generation Lambda

AWS IVS Chat用のトークンを生成するLambda関数です。

## 構成

- **Lambda関数**: IVS Chat APIを使用してチャットトークンを生成
- **API Gateway**: HTTPエンドポイントを提供
- **IAMロール**: 必要な権限を付与

## セットアップ

### 前提条件

- AWS CLI がインストールされ、設定されていること
- AWS SAM CLI がインストールされていること
- Node.js 18.x 以上

### デプロイ手順

1. 依存関係のインストール:
```bash
npm install
```

2. TypeScriptをビルド:
```bash
npm run build
```

3. SAMでデプロイ:
```bash
sam build
sam deploy --guided
```

初回デプロイ時は以下の情報を入力:
- Stack Name: `ivs-chat-token-lambda`
- AWS Region: `us-west-2` (またはIVS Chatが利用可能なリージョン)
- Parameter CorsOrigin: フロントエンドのURL（開発時は `http://localhost:3000`）

## 使用方法

### エンドポイント

```
POST /token
```

### リクエストボディ

```json
{
  "chatRoomArn": "arn:aws:ivschat:us-west-2:123456789012:room/xxxxx",
  "userId": "user123",
  "username": "John Doe",
  "capabilities": ["SEND_MESSAGE", "DELETE_MESSAGE"],
  "sessionDurationInMinutes": 180,
  "attributes": {
    "avatarUrl": "https://example.com/avatar.png"
  }
}
```

### パラメータ

- `chatRoomArn` (必須): IVS ChatルームのARN
- `userId` (必須): ユーザーの一意識別子
- `username` (オプション): 表示名（デフォルト: userId）
- `capabilities` (オプション): ユーザーの権限リスト
  - `SEND_MESSAGE`: メッセージ送信
  - `DELETE_MESSAGE`: メッセージ削除
  - `DISCONNECT_USER`: ユーザー切断
- `sessionDurationInMinutes` (オプション): セッション有効期間（デフォルト: 180分）
- `attributes` (オプション): カスタム属性

### レスポンス

```json
{
  "token": "AQICAHj...",
  "sessionExpirationTime": "2024-01-01T12:00:00.000Z",
  "tokenExpirationTime": "2024-01-01T15:00:00.000Z"
}
```

## ローカル開発

SAM CLIを使用してローカルでテスト:

```bash
sam local start-api
```

## 環境変数

- `CORS_ORIGIN`: CORS許可オリジン（デフォルト: `*`）
- `AWS_REGION`: AWSリージョン（Lambda実行環境で自動設定）

## セキュリティ考慮事項

本番環境では以下を考慮してください：

1. CORS設定を適切なドメインに制限
2. API GatewayにAPI Key認証やAWS IAM認証を追加
3. ユーザー認証・認可の仕組みを実装
4. レート制限の設定
5. CloudWatch Logsでのモニタリング