#!/usr/bin/env python3
import ftplib
import os
from pathlib import Path

# FTP credentials
FTP_HOST = "31.170.161.141"
FTP_USER = "u637913108.kr8tiv.ai"
FTP_PASS = "T|EOBYm@^QCfv#c8"
FTP_PORT = 21
REMOTE_DIR = "/public_html"
LOCAL_DIR = "dist"


def clear_remote_dir(ftp, remote_path, keep_dirs=None):
    """Remove all files in remote directory (keeps subdirectories structure)"""
    if keep_dirs is None:
        keep_dirs = {'.builds'}  # Never touch hosting system dirs

    try:
        items = ftp.nlst(remote_path)
    except ftplib.error_perm:
        return

    for item in items:
        name = item.split('/')[-1]
        if name in ('.', '..') or name in keep_dirs:
            continue

        full_path = f"{remote_path}/{name}" if not item.startswith('/') else item

        # Try to delete as file first
        try:
            ftp.delete(full_path)
            print(f"  Deleted: {full_path}")
        except ftplib.error_perm:
            # It's a directory — recurse into it and clean
            try:
                clear_remote_dir(ftp, full_path, keep_dirs)
            except Exception:
                pass


def upload_directory(ftp, local_path, remote_path):
    """Recursively upload directory contents"""
    local_path = Path(local_path)

    for item in local_path.iterdir():
        remote_item = f"{remote_path}/{item.name}"

        if item.is_file():
            # Delete existing file first to avoid stale content
            try:
                ftp.delete(remote_item)
            except ftplib.error_perm:
                pass

            print(f"Uploading: {item} -> {remote_item}")
            with open(item, 'rb') as f:
                ftp.storbinary(f'STOR {remote_item}', f)
        elif item.is_dir():
            print(f"Creating directory: {remote_item}")
            try:
                ftp.mkd(remote_item)
            except ftplib.error_perm:
                # Directory might already exist
                pass
            upload_directory(ftp, item, remote_item)


def main():
    print(f"Connecting to {FTP_HOST}...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, FTP_PORT)
    ftp.login(FTP_USER, FTP_PASS)

    print(f"Connected. Changing to {REMOTE_DIR}")
    ftp.cwd(REMOTE_DIR)

    # Clean old assets first
    print("Cleaning old assets...")
    clear_remote_dir(ftp, f"{REMOTE_DIR}/assets")
    print("Old assets cleared.")

    print(f"Uploading {LOCAL_DIR}/ to {REMOTE_DIR}/...")
    upload_directory(ftp, LOCAL_DIR, REMOTE_DIR)

    # Verify index.html was uploaded correctly
    import io, re
    buf = io.BytesIO()
    ftp.retrbinary(f'RETR {REMOTE_DIR}/index.html', buf.write)
    html = buf.getvalue().decode('utf-8')
    scripts = re.findall(r'src="([^"]+\.js)"', html)
    print(f"\nVerification - index.html references: {scripts}")

    ftp.quit()
    print("Upload complete!")


if __name__ == "__main__":
    main()
