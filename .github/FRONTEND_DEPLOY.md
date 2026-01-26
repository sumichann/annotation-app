# フロントエンドのデプロイ方法

バックエンドAPIだけでは、ブラウザでアクセスしてもUIが表示されません。フロントエンドもデプロイする必要があります。

## 方法1: Azure Static Web Apps（推奨）

Azure Static Web Appsは、React/Vueなどの静的サイトをホスティングするのに最適です。

### ステップ1: フロントエンドをビルド

```bash
# frontendディレクトリに移動
cd frontend

# 環境変数を設定（バックエンドAPIのURL）
export VITE_API_URL="https://<バックエンドAPIのURL>"

# ビルド
pnpm install
pnpm build

# distディレクトリが作成される
ls -la dist
```

### ステップ2: Azure Static Web Appsを作成

```bash
# リソースグループ名を設定
RESOURCE_GROUP="<リソースグループ名>"
APP_NAME="annotation-app-frontend"

# Azure Static Web Appsを作成
az staticwebapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location japaneast \
  --sku Free
```

### ステップ3: ビルド済みファイルをデプロイ

```bash
# Static Web Appsにデプロイ
az staticwebapp deploy \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --app-location "dist" \
  --output-location "dist"
```

## 方法2: Container Appとしてデプロイ（nginx使用）

nginxで静的ファイルを配信するContainer Appを作成します。

### ステップ1: nginx用のDockerfileを作成

`frontend/Dockerfile`を作成：

```dockerfile
# マルチステージビルド
# ステージ1: ビルド
FROM node:20-alpine AS builder

WORKDIR /app

# パッケージファイルをコピー
COPY package.json pnpm-lock.yaml ./

# pnpmをインストール
RUN npm install -g pnpm

# 依存関係をインストール
RUN pnpm install --frozen-lockfile

# ソースコードをコピー
COPY . .

# 環境変数を設定（ビルド時）
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# ビルド
RUN pnpm build

# ステージ2: nginxで配信
FROM nginx:alpine

# ビルド済みファイルをコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx設定ファイルをコピー（オプション）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### ステップ2: nginx設定ファイルを作成

`frontend/nginx.conf`を作成：

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA用の設定（すべてのリクエストをindex.htmlにリダイレクト）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静的ファイルのキャッシュ設定
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### ステップ3: ビルドとプッシュ

```bash
# ACR名を設定
ACR_NAME="AnnotationBackend"

# frontendディレクトリに移動
cd frontend

# バックエンドAPIのURLを設定
BACKEND_URL="https://<バックエンドAPIのURL>"

# ビルド（--platform linux/amd64を指定）
docker build \
  --platform linux/amd64 \
  --build-arg VITE_API_URL=$BACKEND_URL \
  -t ${ACR_NAME}.azurecr.io/frontend:latest .

# ACRにログイン
az acr login --name $ACR_NAME

# プッシュ
docker push ${ACR_NAME}.azurecr.io/frontend:latest
```

### ステップ4: Container Appを作成

```bash
# 設定
ACR_NAME="AnnotationBackend"
RESOURCE_GROUP="<リソースグループ名>"
APP_NAME="app-frontend"
ENV_NAME="<Environment名>"

# Container Appを作成
az containerapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image ${ACR_NAME}.azurecr.io/frontend:latest \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 1
```

## 方法3: バックエンドAPIに静的ファイルを配信（シンプル）

FastAPIで静的ファイルを配信する方法です。

### ステップ1: FastAPIに静的ファイル配信を追加

`app/main.py`に以下を追加：

```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# 静的ファイルを配信（フロントエンドのビルド済みファイル）
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")
```

### ステップ2: フロントエンドをビルドしてコピー

```bash
# フロントエンドをビルド
cd frontend
pnpm install
VITE_API_URL="https://<バックエンドAPIのURL>" pnpm build

# ビルド済みファイルをapp/staticにコピー
mkdir -p ../app/static
cp -r dist/* ../app/static/
```

### ステップ3: バックエンドを再ビルド・デプロイ

```bash
# appディレクトリに移動
cd ../app

# ビルド
docker build --platform linux/amd64 -t ${ACR_NAME}.azurecr.io/web-backend:latest .

# プッシュ
az acr login --name $ACR_NAME
docker push ${ACR_NAME}.azurecr.io/web-backend:latest

# Container Appを更新
az containerapp update \
  --name app-backend \
  --resource-group <リソースグループ名> \
  --image ${ACR_NAME}.azurecr.io/web-backend:latest
```

## 推奨方法

- **方法1（Azure Static Web Apps）**: 最も簡単で、CDNも自動で付きます
- **方法2（Container App + nginx）**: より細かい制御が可能
- **方法3（バックエンドに統合）**: シンプルだが、スケーリングが難しい

## 環境変数の設定

フロントエンドは`VITE_API_URL`環境変数でバックエンドAPIのURLを指定します。

```bash
# バックエンドAPIのURLを取得
BACKEND_URL=$(az containerapp show \
  --name app-backend \
  --resource-group <リソースグループ名> \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)

# フロントエンドビルド時に設定
export VITE_API_URL="https://$BACKEND_URL"
pnpm build
```

