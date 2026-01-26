# Azure Container Apps デプロイ設定ガイド

このドキュメントでは、GitHub Actionsを使用してAzure Container Appsにデプロイするための設定方法を詳しく説明します。

## 重要なポイント

- **Container Apps Environmentは必須です** - Container Appは必ずEnvironment内に作成されます
- **ACRへのプッシュが先** - Container Appを作成する前に、ACRにイメージをプッシュする必要があります
- **Container Appは自動作成** - 初回デプロイ時に自動的に作成されます

## ステップバイステップ設定ガイド

### ステップ1: Azure CLIでログイン

```bash
az login
```

### ステップ2: リソースグループの作成（まだない場合）

#### 方法1: Azure Portal（GUI）から作成（推奨）

1. [Azure Portal](https://portal.azure.com)にログイン
2. 上部の検索バーで「リソースグループ」を検索
3. **リソースグループ**を選択
4. **作成**ボタンをクリック
5. 以下の情報を入力：
   - **サブスクリプション**: 使用するサブスクリプションを選択
   - **リソースグループ名**: リソースグループ名を入力（例: `rg-annotation-app`）
   - **リージョン**: `Japan East`を選択
6. **確認および作成**をクリック
7. 検証が成功したら**作成**をクリック

**重要**: このリソースグループ名は後でGitHub Secretsの`AZURE_RESOURCE_GROUP`に設定します。

#### 方法2: Azure CLIから作成

```bash
az group create \
  --name <リソースグループ名> \
  --location japaneast
```

例：
```bash
az group create \
  --name rg-annotation-app \
  --location japaneast
```

### ステップ3: Azure Container Registry (ACR) の作成

#### 方法1: Azure Portal（GUI）から作成（推奨）

1. [Azure Portal](https://portal.azure.com)にログイン
2. 上部の検索バーで「Container registries」を検索
3. **Container registries**を選択
4. **作成**ボタンをクリック
5. 以下の情報を入力：
   - **サブスクリプション**: 使用するサブスクリプションを選択
   - **リソースグループ**: ステップ2で作成したリソースグループを選択
   - **レジストリ名**: ACR名を入力（例: `myregistry123`）
     - **重要**: ACR名はAzure全体で一意である必要があります（小文字と数字のみ）
   - **場所**: `Japan East`を選択
   - **SKU**: `Basic`を選択
6. **確認および作成**をクリック
7. 検証が成功したら**作成**をクリック
8. デプロイが完了するまで待機

**管理者アカウントの有効化**:
1. 作成されたACRを開く
2. 左側のメニューから**アクセスキー**を選択
3. **管理者ユーザー**を**有効**にする

**重要**: このACR名は後でGitHub Secretsの`REGISTRY_NAME`に設定します。

#### 方法2: Azure CLIから作成

```bash
az acr create \
  --resource-group <リソースグループ名> \
  --name <ACR名> \
  --sku Basic \
  --admin-enabled true
```

例：
```bash
az acr create \
  --resource-group rg-annotation-app \
  --name myregistry123 \
  --sku Basic \
  --admin-enabled true
```

**重要**: 
- ACR名はAzure全体で一意である必要があります（小文字と数字のみ）
- `--admin-enabled true` で管理者アカウントを有効化します

### ステップ4: Container Apps Environment の作成（必須）

Container Apps Environmentは**必須**です。Container Appは必ずEnvironment内に作成されます。

#### 方法1: Azure Portal（GUI）から作成（推奨）

1. [Azure Portal](https://portal.azure.com)にログイン
2. 上部の検索バーで「Container Apps Environments」を検索
3. **Container Apps Environments**を選択
4. **作成**ボタンをクリック
5. 以下の情報を入力：
   - **サブスクリプション**: 使用するサブスクリプションを選択
   - **リソースグループ**: ステップ2で作成したリソースグループを選択（または新規作成）
   - **環境名**: Environment名を入力（例: `env-annotation-app`）
   - **リージョン**: `Japan East`を選択
   - **ゾーン冗長性**: 必要に応じて設定（通常はオフでOK）
6. **確認および作成**をクリック
7. 検証が成功したら**作成**をクリック
8. デプロイが完了するまで待機（数分かかります）

**重要**: このEnvironment名は後でGitHub Secretsの`AZURE_CONTAINER_APP_ENVIRONMENT`に設定します。

#### 方法2: Azure CLIから作成

```bash
az containerapp env create \
  --name <Environment名> \
  --resource-group <リソースグループ名> \
  --location japaneast
```

例：
```bash
az containerapp env create \
  --name env-annotation-app \
  --resource-group rg-annotation-app \
  --location japaneast
```

**重要**: 
- Container Apps Environmentは**必須**です
- Container Appは必ずEnvironment内に作成されます
- このEnvironment名は後でGitHub Secretsに設定します

### ステップ5: Service Principalの作成

GitHub ActionsからAzureにアクセスするためのService Principalを作成します。

```bash
# サブスクリプションIDを取得
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Service Principalを作成
az ad sp create-for-rbac \
  --name "github-actions-annotation-app" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID \
  --sdk-auth
```

出力例：
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  ...
}
```

**重要**: 
- `clientSecret`は一度しか表示されないので、必ずコピーして保存してください
- この情報はGitHub Secretsに設定します

### ステップ6: Service PrincipalにACRへのアクセス権限を付与

```bash
# ACRのリソースIDを取得
ACR_ID=$(az acr show \
  --name <ACR名> \
  --resource-group <リソースグループ名> \
  --query "id" -o tsv)

# Service PrincipalのClient IDを取得（ステップ5の出力から）
CLIENT_ID="<ステップ5で取得したclientId>"

# Service PrincipalにAcrPushロールを付与
az role assignment create \
  --assignee $CLIENT_ID \
  --role AcrPush \
  --scope $ACR_ID
```

例：
```bash
ACR_ID=$(az acr show \
  --name myregistry123 \
  --resource-group rg-annotation-app \
  --query "id" -o tsv)

az role assignment create \
  --assignee xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  --role AcrPush \
  --scope $ACR_ID
```

### ステップ7: GitHub Secretsの設定

GitHubリポジトリの **Settings** > **Secrets and variables** > **Actions** に移動し、以下のシークレットを追加します。

#### 7-1. GitHubリポジトリでSecretsを開く

1. GitHubリポジトリのページを開く
2. **Settings** タブをクリック
3. 左側のメニューから **Secrets and variables** > **Actions** を選択
4. **New repository secret** ボタンをクリック

#### 7-2. Azure認証情報を追加

ステップ5で取得したService Principalの情報を使用します。

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `AZURE_CLIENT_ID` | Service Principalの`clientId` | Azure認証用 |
| `AZURE_TENANT_ID` | Service Principalの`tenantId` | Azure認証用 |
| `AZURE_SUBSCRIPTION_ID` | Service Principalの`subscriptionId` | Azure認証用 |

**設定手順**:
1. **New repository secret** をクリック
2. **Name** に `AZURE_CLIENT_ID` を入力
3. **Secret** にステップ5で取得した`clientId`を貼り付け
4. **Add secret** をクリック
5. 同様に `AZURE_TENANT_ID` と `AZURE_SUBSCRIPTION_ID` も追加

#### 7-3. Azureリソース情報を追加

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `AZURE_RESOURCE_GROUP` | リソースグループ名（例: `rg-annotation-app`） | ステップ2で作成したリソースグループ名 |
| `AZURE_CONTAINER_APP_NAME` | Container App名（例: `annotation-app-api`） | 初回デプロイ時に作成される名前 |
| `AZURE_CONTAINER_APP_ENVIRONMENT` | Environment名（例: `env-annotation-app`） | **必須** - ステップ4で作成したEnvironment名 |
| `REGISTRY_NAME` | ACR名（例: `myregistry123`） | ステップ3で作成したACR名 |

**重要**: `AZURE_CONTAINER_APP_ENVIRONMENT`は**必須**です。Container Appは必ずEnvironment内に作成されます。

#### 7-4. データベース接続情報を追加

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `DB_HOST` | データベースホスト名 | PostgreSQLのホスト名（例: `mydb.postgres.database.azure.com`） |
| `DB_NAME` | データベース名 | データベース名（例: `postgres`） |
| `DB_USER` | データベースユーザー名 | データベースユーザー名 |
| `DB_PASSWORD` | データベースパスワード | データベースパスワード |

### ステップ8: 初回デプロイの実行

#### 方法1: 自動デプロイ（推奨）

1. `main`ブランチに`app/`ディレクトリ内のファイルを変更してプッシュ
2. GitHub Actionsが自動的に実行されます
3. **Actions**タブでデプロイの進行状況を確認

```bash
git add app/
git commit -m "Initial deployment"
git push origin main
```

#### 方法2: 手動デプロイ

1. GitHubリポジトリの **Actions** タブを開く
2. 左側のメニューから **Deploy to Azure Container Apps** を選択
3. 右側の **Run workflow** ボタンをクリック
4. ブランチを選択（通常は`main`）
5. **Run workflow** をクリック

### ステップ9: デプロイの確認

#### GitHub Actionsでの確認

1. **Actions** タブでワークフローの実行状況を確認
2. 各ステップが成功（緑色のチェックマーク）になっているか確認
3. エラーがある場合は、該当ステップをクリックしてログを確認

**確認ポイント**:
- ✅ Checkout code
- ✅ Azure Login
- ✅ Login to Azure Container Registry
- ✅ Build and push Docker image
- ✅ Check if Container App exists
- ✅ Create Container App (if not exists) または Update Container App (if exists)
- ✅ Get Container App URL

#### Azure Portalでの確認

1. [Azure Portal](https://portal.azure.com)にログイン
2. リソースグループを開く
3. Container Appが作成されているか確認
4. Container Appを開いて、**Application Url**を確認

#### コマンドラインでの確認

```bash
# Container AppのURLを取得
az containerapp show \
  --name <Container App名> \
  --resource-group <リソースグループ名> \
  --query "properties.configuration.ingress.fqdn" \
  -o tsv
```

例：
```bash
az containerapp show \
  --name annotation-app-api \
  --resource-group rg-annotation-app \
  --query "properties.configuration.ingress.fqdn" \
  -o tsv
```

### ステップ10: アプリケーションへのアクセス

デプロイが成功すると、Container AppのURLが表示されます。このURLにアクセスしてアプリケーションが動作しているか確認してください。

例：`https://annotation-app-api.xxxxx.azurecontainerapps.io`

## デプロイの流れ

1. **Dockerイメージをビルド** - `app/Dockerfile`を使用
2. **ACRにプッシュ** - Azure Container Registryにイメージをプッシュ
3. **Container Appの存在チェック** - 既存のContainer Appがあるか確認
4. **作成または更新**:
   - 存在しない場合: 新規作成（初回デプロイ）
   - 存在する場合: イメージを更新（2回目以降のデプロイ）

## トラブルシューティング

### デプロイが失敗する場合

1. **GitHub Secretsが正しく設定されているか確認**
   - Settings > Secrets and variables > Actions で確認
   - 特に `AZURE_CONTAINER_APP_ENVIRONMENT` が設定されているか確認

2. **Service Principalに適切な権限があるか確認**
   - Contributorロールが付与されているか
   - ACRへのAcrPushロールが付与されているか

3. **Azure Container Registryが存在し、アクセス可能か確認**
   ```bash
   az acr show --name <ACR名> --resource-group <リソースグループ名>
   ```

4. **Container Apps Environmentが存在するか確認**
   ```bash
   az containerapp env show \
     --name <Environment名> \
     --resource-group <リソースグループ名>
   ```

5. **ログの確認**
   - GitHub Actionsのログを確認
   - Azure PortalでContainer Appのログを確認

### よくあるエラー

#### エラー: "Container App not found"
- Container Appが存在しない場合、初回デプロイ時に自動的に作成されます
- `AZURE_CONTAINER_APP_ENVIRONMENT`が正しく設定されているか確認

#### エラー: "Environment not found"
- Container Apps Environmentが作成されていない可能性があります
- ステップ4を実行してEnvironmentを作成してください

#### エラー: "ACR access denied"
- Service PrincipalにACRへのアクセス権限が付与されていない可能性があります
- ステップ6を実行して権限を付与してください

## 参考リンク

- [Azure Container Apps ドキュメント](https://learn.microsoft.com/ja-jp/azure/container-apps/)
- [GitHub Actions ドキュメント](https://docs.github.com/ja/actions)
