# ベースイメージ: 軽量なPython 3.11
FROM python:3.11-slim

# 作業ディレクトリの設定
WORKDIR /code

# 依存関係ファイルのコピーとインストール
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# アプリケーションコードのコピー（appディレクトリ内から見て、現在のディレクトリをコピー）
COPY . /code/app

# コンテナ起動時のコマンド
# host=0.0.0.0 は外部からのアクセスを受け付けるために必須
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]