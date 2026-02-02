# データベースマイグレーション実行方法

Azure PostgreSQLに接続してマイグレーションを実行する方法は以下の通りです。

## 方法1: Azure Portalのクエリエディタを使用（最も簡単）⭐推奨

1. Azure Portalにログイン
2. PostgreSQLサーバーに移動
3. 左メニューから「クエリエディタ」を選択
4. 認証情報を入力して接続
5. `add_lock_columns_to_products.sql`の内容をコピー＆ペースト
6. 「実行」ボタンをクリック

**メリット**: 
- ファイアウォール設定不要
- ブラウザから直接実行可能
- 最も簡単

---

## 方法2: ローカルからpsqlで接続

### 前提条件
- PostgreSQLクライアント（psql）がインストールされていること
- Azure PostgreSQLのファイアウォールでローカルIPが許可されていること

### 手順

1. **ファイアウォール設定**
   ```bash
   # Azure CLIで現在のIPを許可
   az postgres flexible-server firewall-rule create \
     --resource-group <RESOURCE_GROUP> \
     --name <SERVER_NAME> \
     --rule-name AllowMyIP \
     --start-ip-address <YOUR_IP> \
     --end-ip-address <YOUR_IP>
   ```

2. **接続情報を取得**
   - `.env`ファイルまたはAzure Portalから以下を確認:
     - `DB_HOST`: サーバー名（例: `myserver.postgres.database.azure.com`）
     - `DB_NAME`: データベース名
     - `DB_USER`: ユーザー名
     - `DB_PASSWORD`: パスワード

3. **psqlで接続**
   ```bash
   psql "host=<DB_HOST> port=5432 dbname=<DB_NAME> user=<DB_USER> password=<DB_PASSWORD> sslmode=require"
   ```

4. **SQLファイルを実行**
   ```bash
   psql "host=<DB_HOST> port=5432 dbname=<DB_NAME> user=<DB_USER> password=<DB_PASSWORD> sslmode=require" -f migrations/add_lock_columns_to_products.sql
   ```

---

## 方法3: Azure Cloud Shell経由

1. Azure PortalでCloud Shellを開く
2. SQLファイルをアップロードまたは作成
3. psqlで接続して実行

```bash
# Cloud Shellでpsqlを使用
psql "host=<DB_HOST> port=5432 dbname=<DB_NAME> user=<DB_USER> password=<DB_PASSWORD> sslmode=require" -f add_lock_columns_to_products.sql
```

---

## 方法4: Pythonスクリプトで実行（プログラムから実行）

SQLAlchemyを使ってPythonから実行する方法です。

```python
# migrations/run_migration.py
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASSWORD")

encoded_password = urllib.parse.quote_plus(DB_PASS)
SQLALCHEMY_DATABASE_URL = (
    f"postgresql+psycopg2://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"sslmode": "require"})

with open("migrations/add_lock_columns_to_products.sql", "r") as f:
    sql = f.read()

with engine.connect() as conn:
    conn.execute(text(sql))
    conn.commit()

print("Migration completed successfully!")
```

実行:
```bash
cd app
python migrations/run_migration.py
```

---

## 推奨方法

**方法1（Azure Portalのクエリエディタ）** が最も簡単で安全です。
- ファイアウォール設定不要
- ブラウザから直接実行
- エラーメッセージも確認しやすい

---

## 注意事項

- **実行前に必ずバックアップを取る**ことを推奨します
- 本番環境で実行する場合は、メンテナンス時間を設けることを推奨します
- `IF NOT EXISTS`を使用しているため、既にカラムが存在する場合はエラーになりません
