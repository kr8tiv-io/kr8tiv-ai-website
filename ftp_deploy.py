#!/usr/bin/env python3
import ftplib
import os
import re
from pathlib import Path
from typing import Iterable

FTP_HOST = os.getenv('FTP_HOST', '')
FTP_USER = os.getenv('FTP_USER', '')
FTP_PASS = os.getenv('FTP_PASS', '')
FTP_PORT = int(os.getenv('FTP_PORT', '21'))
REMOTE_DIR = os.getenv('REMOTE_DIR', '/public_html')
LOCAL_DIR = Path(os.getenv('LOCAL_DIR', 'dist'))


def require_runtime_config() -> None:
  missing = [
    name
    for name, value in (
      ('FTP_HOST', FTP_HOST),
      ('FTP_USER', FTP_USER),
      ('FTP_PASS', FTP_PASS),
    )
    if not value
  ]
  if missing:
    joined = ', '.join(missing)
    raise RuntimeError(f'Missing required environment variables: {joined}')

  if not LOCAL_DIR.exists():
    raise RuntimeError(f'Local build directory does not exist: {LOCAL_DIR}')


def remote_join(*parts: str) -> str:
  cleaned = [part.strip('/') for part in parts if part]
  return '/' + '/'.join(cleaned)


def ensure_remote_dir(ftp: ftplib.FTP, remote_dir: str) -> None:
  path = ''
  for chunk in remote_dir.strip('/').split('/'):
    path = f'{path}/{chunk}' if path else f'/{chunk}'
    try:
      ftp.mkd(path)
    except ftplib.error_perm:
      # Directory already exists.
      pass


def upload_file(ftp: ftplib.FTP, local_file: Path, remote_file: str) -> None:
  ensure_remote_dir(ftp, str(Path(remote_file).parent).replace('\\', '/'))
  print(f'Uploading: {local_file} -> {remote_file}')
  with local_file.open('rb') as handle:
    ftp.storbinary(f'STOR {remote_file}', handle)


def upload_directory(ftp: ftplib.FTP, local_dir: Path, remote_dir: str) -> None:
  ensure_remote_dir(ftp, remote_dir)
  for item in sorted(local_dir.iterdir(), key=lambda p: p.name):
    remote_item = remote_join(remote_dir, item.name)
    if item.is_dir():
      upload_directory(ftp, item, remote_item)
    else:
      upload_file(ftp, item, remote_item)


def parse_local_asset_references(index_html: Path) -> set[str]:
  html = index_html.read_text(encoding='utf-8')
  refs = set(re.findall(r'(?:src|href)="([^"]+)"', html))
  return {
    ref
    for ref in refs
    if ref.startswith('/') and not ref.startswith('//') and not ref.startswith('/http')
  }


def remote_file_exists(ftp: ftplib.FTP, remote_path: str) -> bool:
  parent = str(Path(remote_path).parent).replace('\\', '/')
  name = Path(remote_path).name

  try:
    entries = ftp.nlst(parent)
  except ftplib.error_perm:
    return False

  normalized = {entry.split('/')[-1] for entry in entries}
  return name in normalized


def verify_referenced_assets(ftp: ftplib.FTP, references: Iterable[str]) -> None:
  missing: list[str] = []

  for reference in sorted(references):
    remote_path = remote_join(REMOTE_DIR, reference)
    if not remote_file_exists(ftp, remote_path):
      missing.append(reference)

  if missing:
    raise RuntimeError(f'Missing uploaded assets referenced by index.html: {missing}')


def deploy() -> None:
  require_runtime_config()

  index_html = LOCAL_DIR / 'index.html'
  if not index_html.exists():
    raise RuntimeError(f'Expected build artifact missing: {index_html}')

  references = parse_local_asset_references(index_html)

  ftp = ftplib.FTP()
  print(f'Connecting to {FTP_HOST}:{FTP_PORT}')
  ftp.connect(FTP_HOST, FTP_PORT)
  ftp.login(FTP_USER, FTP_PASS)
  ftp.set_pasv(True)

  try:
    ftp.cwd(REMOTE_DIR)

    assets_dir = LOCAL_DIR / 'assets'
    if assets_dir.exists():
      print('Uploading assets directory first...')
      upload_directory(ftp, assets_dir, remote_join(REMOTE_DIR, 'assets'))

    print('Uploading non-index static files...')
    for item in sorted(LOCAL_DIR.iterdir(), key=lambda p: p.name):
      if item.name in {'index.html', 'assets'}:
        continue

      remote_item = remote_join(REMOTE_DIR, item.name)
      if item.is_dir():
        upload_directory(ftp, item, remote_item)
      else:
        upload_file(ftp, item, remote_item)

    print('Uploading index.html last...')
    upload_file(ftp, index_html, remote_join(REMOTE_DIR, 'index.html'))

    print('Verifying index.html references exist remotely...')
    verify_referenced_assets(ftp, references)

    print('Deployment complete and verified.')
  finally:
    ftp.quit()


if __name__ == '__main__':
  deploy()
