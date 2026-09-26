#!/usr/bin/env bash
# Build static ATS CV Resume dan salin ke repo job.web.id.
# Pemakaian: bash scripts/copy-to-job-repo.sh <path-repo-job> [folder-tujuan]
# Contoh:    bash scripts/copy-to-job-repo.sh ../job public/atscvresume
set -euo pipefail

JOB_REPO="${1:?Isi path repo job, contoh: ../job}"
TARGET_DIR="${2:-public/atscvresume}"
BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/atscvresume}"

if [ ! -f "$JOB_REPO/wrangler.toml" ]; then
  echo "wrangler.toml tidak ditemukan di $JOB_REPO. Pastikan path repo job benar." >&2
  exit 1
fi

NEXT_PUBLIC_BASE_PATH="$BASE_PATH" pnpm run build:cloudflare

DEST="$JOB_REPO/$TARGET_DIR"
rm -rf "$DEST"
mkdir -p "$DEST"
cp -R out/. "$DEST/"
rm -f "$DEST"/placeholder*

echo "Selesai: hasil build disalin ke $DEST"
echo "Base path: $BASE_PATH"
