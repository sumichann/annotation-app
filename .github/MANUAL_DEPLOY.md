# 手動でACRにプッシュしてデプロイする方法

GitHub Actionsを使わずに、手動でDockerイメージをビルドしてACRにプッシュし、Container Appにデプロイする方法です。

## 前提条件

- Azure CLIがインストールされていること
- Dockerがインストールされていること
- Utokyo Azureのアカウントでログインしていること

## ステップ1: Azure CLIでログイン

```bash
# Utokyo Azureのテナントにログイン
az login

# 正しいサブスクリプションに切り替え（必要に応じて）
az account list --output table
az account set --subscription <サブスクリプションID>

# 確認
az account show
```

## ステップ2: ACRにログイン

```bash
# ACR名を設定（実際のACR名に置き換えてください）
ACR_NAME="<ACR名>"

# ACRにログイン
az acr login --name $ACR_NAME
```

## ステップ3: Dockerイメージをビルド

**重要**: Dockerイメージのビルド時には、`.env`ファイルの環境変数は含まれません。環境変数は実行時（Container App起動時）に設定します。これは正常な動作です。

### 方法1: docker-composeを使用

このプロジェクトは`docker-compose.yml`を使用していますが、ACRにプッシュする場合は`docker build`を使用する方がシンプルです。

```bash
# appディレクトリに移動
cd app

# イメージ名を設定
IMAGE_NAME="annotation-app-api"
IMAGE_TAG="latest"  # または日付など: $(date +%Y%m%d-%H%M%S)
FULL_IMAGE_NAME="${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${IMAGE_TAG}"

# docker-composeでビルド（サービス名はdocker-compose.ymlの`api`）
docker-compose build api

# ビルドされたイメージにACR用のタグを付ける
docker tag annotation_app_ver2-api:latest $FULL_IMAGE_NAME
```

**注意**: `docker-compose.yml`の`env_file`は実行時（`docker-compose up`）に読み込まれます。ビルド時には使用されません。

### 方法2: docker buildを直接使用（推奨）

**重要（Apple Silicon Macを使用している場合）**: Container Appは`linux/amd64`アーキテクチャを要求します。Apple Silicon Mac（M1/M2/M3）でビルドする場合は、`--platform linux/amd64`を指定してください。

```bash
# appディレクトリに移動
cd app

# イメージ名を設定
IMAGE_NAME="annotation-app-api"
IMAGE_TAG="latest"  # または日付など: $(date +%Y%m%d-%H%M%S)
FULL_IMAGE_NAME="${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${IMAGE_TAG}"

# Dockerイメージをビルド（--platform linux/amd64を指定）
docker build --platform linux/amd64 -t $FULL_IMAGE_NAME .

# ビルドが成功したことを確認
docker images | grep $IMAGE_NAME
```

**アーキテクチャの確認**:
```bash
# ビルドしたイメージのアーキテクチャを確認
docker inspect $FULL_IMAGE_NAME | grep Architecture
# または
docker buildx imagetools inspect $FULL_IMAGE_NAME
```

**環境変数について**:
- `.env`ファイルの内容はイメージに含まれません（これは正常です）
- 環境変数はContainer Appの実行時に`--env-vars`オプションで設定します（ステップ5参照）
- セキュリティ上、環境変数（特にパスワードなど）をイメージに含めるべきではありません

## ステップ4: ACRにプッシュ

**重要**: ACRにプッシュするには、イメージ名にACRの完全なパス（`<ACR名>.azurecr.io/<イメージ名>:<タグ>`）を含める必要があります。

```bash
# ACRにイメージをプッシュ
docker push $FULL_IMAGE_NAME

# プッシュが成功したことを確認
az acr repository list --name $ACR_NAME --output table
az acr repository show-tags --name $ACR_NAME --repository $IMAGE_NAME --output table
```

### エラー: "denied: requested access to the resource is denied" または "UNAUTHORIZED" が出る場合

このエラーは、ACRにログインしていないことが原因です。

**解決方法**:

1. **ACRにログイン**（最も一般的な解決方法）:
   ```bash
   # ACR名を設定
   ACR_NAME="AnnotationBackend"  # または実際のACR名
   
   # ACRにログイン
   az acr login --name $ACR_NAME
   
   # その後、再度プッシュ
   docker push ${ACR_NAME}.azurecr.io/web-backend:latest
   ```

2. **Azure CLIでログインしていない場合**:
   ```bash
   # まずAzure CLIでログイン
   az login
   
   # その後、ACRにログイン
   az acr login --name AnnotationBackend
   ```

3. **ACRの管理者アカウントを使用する場合**（上記で解決しない場合）:
   ```bash
   # ACRの管理者アカウントが有効か確認
   az acr show --name AnnotationBackend --query adminEnabled
   
   # 管理者アカウントを有効化（必要に応じて）
   az acr update --name AnnotationBackend --admin-enabled true
   
   # パスワードを取得してログイン
   ACR_PASSWORD=$(az acr credential show --name AnnotationBackend --query "passwords[0].value" -o tsv)
   docker login AnnotationBackend.azurecr.io -u AnnotationBackend -p $ACR_PASSWORD
   ```

2. **イメージ名がACRのパスを含んでいない**:
   ```bash
   # 間違い: docker push web-backend
   # 正しい: docker push <ACR名>.azurecr.io/web-backend:latest
   
   # 既存のイメージにACR用のタグを付ける
   docker tag web-backend:latest ${ACR_NAME}.azurecr.io/web-backend:latest
   docker push ${ACR_NAME}.azurecr.io/web-backend:latest
   ```

3. **ACRの認証情報が正しくない**:
   ```bash
   # ACRの管理者アカウントを確認
   az acr show --name $ACR_NAME --query adminEnabled
   
   # 管理者アカウントを有効化（必要に応じて）
   az acr update --name $ACR_NAME --admin-enabled true
   
   # パスワードでログイン
   ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
   docker login ${ACR_NAME}.azurecr.io -u $ACR_NAME -p $ACR_PASSWORD
   ```

## ステップ5: Container Appを更新（既存の場合）

**重要**: ここで`.env`ファイルの環境変数を設定します。Container Appの実行時に環境変数が読み込まれます。

```bash
# リソースグループ名とContainer App名を設定
RESOURCE_GROUP="<リソースグループ名>"
APP_NAME="<Container App名>"

# .envファイルから環境変数を読み込む（オプション）
# または、直接値を指定
DB_HOST="${DB_HOST:-<DB_HOST>}"
DB_NAME="${DB_NAME:-<DB_NAME>}"
DB_USER="${DB_USER:-<DB_USER>}"
DB_PASSWORD="${DB_PASSWORD:-<DB_PASSWORD>}"

# Container Appのイメージを更新（環境変数も同時に設定）
az containerapp update \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $FULL_IMAGE_NAME \
  --set-env-vars \
    "DB_HOST=$DB_HOST" \
    "DB_NAME=$DB_NAME" \
    "DB_USER=$DB_USER" \
    "DB_PASSWORD=$DB_PASSWORD"
```

**環境変数の設定方法**:
1. **直接指定**: 上記のように`--set-env-vars`で直接値を指定
2. **.envファイルから読み込む**: シェルスクリプトで`.env`を読み込んでから使用
3. **Azure Key Vault**: 機密情報はAzure Key Vaultに保存して参照（推奨）

## ステップ6: Container Appを新規作成（初回の場合）

```bash
# リソースグループ名、Container App名、Environment名を設定
RESOURCE_GROUP="<リソースグループ名>"
APP_NAME="<Container App名>"
ENV_NAME="<Environment名>"

# Container Appを作成
az containerapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image $FULL_IMAGE_NAME \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 1 \
  --env-vars \
    "DB_HOST=<DB_HOST>" \
    "DB_NAME=<DB_NAME>" \
    "DB_USER=<DB_USER>" \
    "DB_PASSWORD=<DB_PASSWORD>"
```

## ステップ7: Container AppのURLを確認

```bash
# Container AppのURLを取得
az containerapp show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv
```

## 便利なスクリプト例

以下のようなスクリプトを作成すると便利です：

```bash
#!/bin/bash
# deploy.sh

# 設定
ACR_NAME="<ACR名>"
RESOURCE_GROUP="<リソースグループ名>"
APP_NAME="<Container App名>"
ENV_NAME="<Environment名>"
IMAGE_NAME="annotation-app-api"
IMAGE_TAG=$(date +%Y%m%d-%H%M%S)
FULL_IMAGE_NAME="${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${IMAGE_TAG}"

# データベース接続情報（環境変数から取得、または直接指定）
DB_HOST="${DB_HOST:-<DB_HOST>}"
DB_NAME="${DB_NAME:-<DB_NAME>}"
DB_USER="${DB_USER:-<DB_USER>}"
DB_PASSWORD="${DB_PASSWORD:-<DB_PASSWORD>}"

echo "=== ACRにログイン ==="
az acr login --name $ACR_NAME

echo "=== Dockerイメージをビルド ==="
cd app

# 方法1: docker-composeを使用
# docker-compose build api
# docker tag annotation_app_ver2-api:latest $FULL_IMAGE_NAME

# 方法2: docker buildを直接使用（推奨）
docker build -t $FULL_IMAGE_NAME .

echo "=== ACRにプッシュ ==="
docker push $FULL_IMAGE_NAME

echo "=== Container Appを更新 ==="
az containerapp update \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $FULL_IMAGE_NAME \
  --set-env-vars \
    "DB_HOST=$DB_HOST" \
    "DB_NAME=$DB_NAME" \
    "DB_USER=$DB_USER" \
    "DB_PASSWORD=$DB_PASSWORD"

echo "=== デプロイ完了 ==="
URL=$(az containerapp show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)
echo "URL: https://$URL"
```

### docker-composeを使用する場合の注意点

- `docker-compose build`でビルドしたイメージは、デフォルトで`<プロジェクト名>-<サービス名>:latest`という名前になります
- 例: `annotation_app_ver2-api:latest`
- ACRにプッシュする前に、適切なタグを付ける必要があります
- **Apple Silicon Macを使用している場合**: `docker-compose build`でも`--platform linux/amd64`を指定する必要があります
  ```bash
  # docker-compose.ymlにplatformを追加するか、環境変数で指定
  DOCKER_DEFAULT_PLATFORM=linux/amd64 docker-compose build api
  ```
- または、直接`docker build --platform linux/amd64`を使用する方がシンプルです

### エラー: "image OS/Arc must be linux/amd64 but found linux/arm64" が出る場合

このエラーは、Apple Silicon Mac（M1/M2/M3）でビルドしたイメージをContainer Appにデプロイしようとした場合に発生します。

**解決方法**: `--platform linux/amd64`を指定して再ビルドしてください。

```bash
# ACR名を設定
ACR_NAME="AnnotationBackend"

# appディレクトリに移動
cd app

# linux/amd64プラットフォームでビルド
docker build --platform linux/amd64 -t ${ACR_NAME}.azurecr.io/web-backend:latest .

# ACRにプッシュ
az acr login --name $ACR_NAME
docker push ${ACR_NAME}.azurecr.io/web-backend:latest

# Container Appを更新
az containerapp update \
  --name <APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --image ${ACR_NAME}.azurecr.io/web-backend:latest
```

## トラブルシューティング

### ACRにログインできない場合

```bash
# ACRの管理者アカウントが有効になっているか確認
az acr show --name $ACR_NAME --query adminEnabled

# 管理者アカウントを有効化（必要に応じて）
az acr update --name $ACR_NAME --admin-enabled true

# 管理者パスワードを取得
az acr credential show --name $ACR_NAME

# パスワードでログイン
docker login ${ACR_NAME}.azurecr.io -u <ACR名> -p <パスワード>
```

### Container Appが見つからない場合

```bash
# すべてのContainer Appを一覧表示
az containerapp list --resource-group $RESOURCE_GROUP --output table

# Container Appの詳細を確認
az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP
```

### イメージのビルドに失敗する場合

```bash
# Dockerfileのパスを確認
cd app
ls -la Dockerfile

# ビルドログを詳しく見る
docker build -t $FULL_IMAGE_NAME . --progress=plain --no-cache
```

## 参考リンク

- [Azure Container Registry のドキュメント](https://learn.microsoft.com/ja-jp/azure/container-registry/)
- [Azure Container Apps のドキュメント](https://learn.microsoft.com/ja-jp/azure/container-apps/)

