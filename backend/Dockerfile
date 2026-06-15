FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements-local.txt ./
# If a local requirements file is provided (requirements-local.txt), prefer it for faster local builds.
RUN if [ -s requirements-local.txt ]; then \
	pip install --no-cache-dir -r requirements-local.txt; \
	else pip install --no-cache-dir -r requirements.txt; fi

COPY . .

RUN adduser --disabled-password --gecos "" appuser
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]