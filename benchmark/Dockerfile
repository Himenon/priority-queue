FROM python:3.11-slim

# 必要な依存パッケージのインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libfreetype6-dev \
    libpng-dev \
    libglib2.0-0 \
    && pip install --no-cache-dir pandas matplotlib seaborn \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ（/app に benchmark/ がマウントされる）
WORKDIR /app

# デフォルト実行（plot_stats.py はマウントされることを前提）
CMD ["python", "plot_stats.py"]
