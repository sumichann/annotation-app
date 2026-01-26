# Azure Static Web Appsでフロントエンドをデプロイ

Azure Static Web Appsを使用してフロントエンドをデプロイする方法です。

## 前提条件

- Azure CLIがインストールされていること
- Utokyo Azureのアカウントでログインしていること
- バックエンドAPIが既にデプロイされていること
- GitHubリポジトリにコードがプッシュされていること（GitHub連携の場合）

## リポジトリについて

**重要**: frontend単体でリポジトリを持つ必要はありません。現在のリポジトリ（`annotation_app_ver2`）に`frontend`ディレクトリが含まれているので、そのリポジトリを指定して、ビルド設定で`frontend`ディレクトリを指定すればOKです。

## ステップ1: バックエンドAPIのURLを取得

```bash
# リソースグループ名とContainer App名を設定
RESOURCE_GROUP="<リソースグループ名>"
API_APP_NAME="app-backend"

# バックエンドAPIのURLを取得
BACKEND_URL=$(az containerapp show \
  --name $API_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)

echo "Backend URL: https://$BACKEND_URL"
```

## ステップ2: フロントエンドをビルド

```bash
# frontendディレクトリに移動
cd frontend

# 依存関係をインストール（初回のみ）
pnpm install

# 環境変数を設定してビルド
VITE_API_URL="https://$BACKEND_URL" pnpm build

# distディレクトリが作成されることを確認
ls -la dist
```

## ステップ3: Azure Static Web Appsを作成（GitHub連携）

### 方法1: Azure Portal（GUI）から作成（推奨）

1. [Azure Portal](https://portal.azure.com)にログイン
2. 上部の検索バーで「Static Web Apps」を検索
3. **Static Web Apps**を選択
4. **作成**ボタンをクリック
5. **基本**タブで以下の情報を入力：
   - **サブスクリプション**: 使用するサブスクリプションを選択
   - **リソースグループ**: 既存のリソースグループを選択（例: `rg-annotation-app`）
   - **名前**: Static Web App名を入力（例: `annotation-app-frontend`）
   - **プランの種類**: `Free`を選択（または`Standard`）
   - **リージョン**: `Japan East`を選択
6. **デプロイの詳細**タブで：
   - **ソース**: `GitHub`を選択
   - **GitHubアカウント**: **GitHubにサインイン**をクリックして認証
   - **組織**: GitHubの組織名を選択（個人の場合は自分のユーザー名）
   - **リポジトリ**: `annotation-app`（または実際のリポジトリ名）を選択
   - **ブランチ**: `main`を選択
7. **ビルドの詳細**タブで：
   - **ビルド プリセット**: `Custom`を選択
   - **アプリの場所**: `frontend`を入力
   - **API の場所**: 空白のまま（バックエンドは別のContainer App）
   - **出力場所**: `dist`を入力
   - **環境変数**: 必要に応じて追加
     - `VITE_API_URL`: `https://app-backend.yellowmeadow-eb0b1d68.japaneast.azurecontainerapps.io`
8. **確認および作成**をクリック
9. 検証が成功したら**作成**をクリック
10. デプロイが完了するまで待機（初回はGitHub Actionsが自動で実行されます）

### 方法2: Azure CLIから作成

```bash
# リソースグループ名とStatic Web App名を設定
RESOURCE_GROUP="<リソースグループ名>"
APP_NAME="annotation-app-frontend"

# Azure Static Web Appsを作成
az staticwebapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location japaneast \
  --sku Free
```

## ステップ4: GitHub連携での自動デプロイ

GitHub連携を選択した場合、**自動的にGitHub Actionsワークフローが作成され、`main`ブランチにプッシュするたびに自動でビルド・デプロイされます**。

### 初回デプロイ

1. Static Web Appを作成すると、自動的にGitHub Actionsワークフローが作成されます
2. `.github/workflows/azure-static-web-apps-<リポジトリ名>.yml`が作成されます
3. `main`ブランチにプッシュすると、自動的にビルド・デプロイが実行されます

### 環境変数の設定

バックエンドAPIのURLを環境変数として設定する必要があります：

1. Azure PortalでStatic Web Appを開く
2. 左側のメニューから**構成**を選択
3. **アプリケーション設定**セクションで**+ 新規アプリケーション設定**をクリック
4. 以下を追加：
   - **名前**: `VITE_API_URL`
   - **値**: `https://app-backend.yellowmeadow-eb0b1d68.japaneast.azurecontainerapps.io`
5. **保存**をクリック

**注意**: 環境変数は**ビルド時**に使用されるため、GitHub Actionsワークフローにも設定する必要があります。

### GitHub Actionsワークフローの確認

作成されたワークフローファイルを確認：

```bash
# ワークフローファイルを確認
cat .github/workflows/azure-static-web-apps-*.yml
```

環境変数を追加する場合は、ワークフローファイルを編集：

```yaml
env:
  VITE_API_URL: ${{ secrets.VITE_API_URL }}
```

または、GitHub Secretsに設定：

1. GitHubリポジトリの**Settings** > **Secrets and variables** > **Actions**
2. **New repository secret**をクリック
3. **Name**: `VITE_API_URL`
4. **Secret**: `https://app-backend.yellowmeadow-eb0b1d68.japaneast.azurecontainerapps.io`
5. **Add secret**をクリック

## ステップ5: URLを確認

```bash
# Static Web AppのURLを取得
az staticwebapp show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "defaultHostname" \
  --output tsv
```

URLは `https://<APP_NAME>.azurestaticapps.net` の形式になります。

## 一括デプロイスクリプト

以下のスクリプトを作成すると便利です：

```bash
#!/bin/bash
# deploy-frontend.sh

# 設定
RESOURCE_GROUP="<リソースグループ名>"
API_APP_NAME="app-backend"
STATIC_APP_NAME="annotation-app-frontend"

echo "=== バックエンドAPIのURLを取得 ==="
BACKEND_URL=$(az containerapp show \
  --name $API_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)

echo "Backend URL: https://$BACKEND_URL"

echo "=== フロントエンドをビルド ==="
cd frontend
VITE_API_URL="https://$BACKEND_URL" pnpm build

echo "=== Static Web Appsにデプロイ ==="
az staticwebapp deploy \
  --name $STATIC_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --app-location "dist" \
  --output-location "dist"

echo "=== デプロイ完了 ==="
FRONTEND_URL=$(az staticwebapp show \
  --name $STATIC_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "defaultHostname" \
  --output tsv)
echo "Frontend URL: https://$FRONTEND_URL"
```

## 注意点

### 1. 環境変数の設定

`VITE_API_URL`は**ビルド時**に埋め込まれるため、実行時に変更できません。バックエンドAPIのURLが変更された場合は、再ビルドが必要です。

### 2. CORS設定

バックエンドAPIのCORS設定で、Static Web AppsのURLを許可する必要があります：

```python
# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://annotation-app-frontend.azurestaticapps.net",
        "http://localhost:5173",  # 開発環境用
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. ルーティング設定

React Routerを使用している場合、Static Web Appsの設定でリダイレクトルールが必要です。

`staticwebapp.config.json`を作成（ルートディレクトリまたは`public`ディレクトリ）：

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*", "*.{css,scss,js,png,gif,ico,jpg,svg}"]
  },
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ]
}
```

このファイルを`frontend/public/staticwebapp.config.json`に配置すると、ビルド時に`dist`にコピーされます。

## トラブルシューティング

### デプロイが失敗する場合

```bash
# Static Web Appのログを確認
az staticwebapp show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties" \
  --output json
```

### ビルドエラーが出る場合

```bash
# ローカルでビルドをテスト
cd frontend
VITE_API_URL="https://<バックエンドURL>" pnpm build
pnpm preview  # ビルド結果をローカルで確認
```

### API接続エラーが出る場合

1. バックエンドAPIのCORS設定を確認
2. `VITE_API_URL`が正しく設定されているか確認（ブラウザの開発者ツールで確認）

## 参考リンク

- [Azure Static Web Apps のドキュメント](https://learn.microsoft.com/ja-jp/azure/static-web-apps/)
- [Static Web Apps のルーティング設定](https://learn.microsoft.com/ja-jp/azure/static-web-apps/configuration)

