import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import urllib.parse

from dotenv import load_dotenv

load_dotenv()

# 環境変数から設定を取得 (Docker実行時に注入します)
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASSWORD")

# パスワードの記号をURLエンコード
encoded_password = urllib.parse.quote_plus(DB_PASS)

# 接続文字列の作成
# Azure PostgresはSSL接続が必須なので sslmode=require を付与
SQLALCHEMY_DATABASE_URL = (
    f"postgresql+psycopg2://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}"
)

# エンジン作成 (connect_argsでSSLを強制)
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"sslmode": "require"})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# DBセッションを取得する依存関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
