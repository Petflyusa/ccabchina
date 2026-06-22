#!/usr/bin/env python3
"""
Static website cloner for ccabchina.com
Downloads HTML, CSS, JS, images to local folder for offline browsing.
"""
import os
import re
import sys
import requests
from urllib.parse import urljoin, urlparse, urldefrag
from bs4 import BeautifulSoup
from collections import deque
import time

BASE_URL = "https://www.ccabchina.com/"
OUTPUT_DIR = os.path.expanduser("~/.hermes/workspace/ccabchina-clone/www.ccabchina.com")
MAX_PAGES = 200
MAX_ASSETS = 500

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

visited_urls = set()
visited_assets = set()
assets_queue = deque()
page_queue = deque([BASE_URL])

session = requests.Session()
session.headers.update(headers)

def clean_url(url):
    """Remove fragment and normalize"""
    url, _ = urldefrag(url)
    return url

def get_local_path(url, base_dir):
    """Convert URL to local file path"""
    parsed = urlparse(url)
    path = parsed.path
    if path == '/' or path == '':
        path = '/index.html'
    elif not os.path.splitext(path)[1]:
        path = path.rstrip('/') + '/index.html'
    elif not path.startswith('/'):
        path = '/' + path
    # Remove leading slash for relative path within output dir
    full_path = os.path.join(base_dir, path.lstrip('/'))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    return full_path

def url_to_local(url, base_url=BASE_URL):
    """Get relative path for a URL"""
    parsed = urlparse(url)
    base_parsed = urlparse(base_url)
    if parsed.netloc != base_parsed.netloc:
        return None
    path = get_local_path(url, OUTPUT_DIR)
    return path

def is_same_domain(url):
    parsed = urlparse(url)
    base = urlparse(BASE_URL)
    return parsed.netloc == base.netloc

def is_static_asset(url):
    parsed = urlparse(url)
    path = parsed.path.lower()
    static_exts = ('.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
                  '.woff', '.woff2', '.ttf', '.eot', '.otf', '.webp', '.bmp',
                  '.pdf', '.zip', '.rar', '.mp4', '.webm', '.avi')
    return any(path.endswith(ext) for ext in static_exts)

def download_file(url, dest_path, timeout=15):
    """Download a file to local path"""
    url = clean_url(url)
    if url in visited_assets:
        return False
    visited_assets.add(url)
    try:
        r = session.get(url, timeout=timeout, stream=True, allow_redirects=True)
        if r.status_code != 200:
            print(f"  [!] {r.status_code} {url}")
            return False
        content_type = r.headers.get('Content-Type', '')
        # Skip HTML for assets (we only fetch raw files)
        with open(dest_path, 'wb') as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        size = os.path.getsize(dest_path)
        print(f"  [OK] {dest_path} ({size} bytes)")
        return True
    except Exception as e:
        print(f"  [ERR] {url}: {e}")
        return False

def process_page(url):
    """Fetch and parse a page, extract links and assets"""
    url = clean_url(url)
    if url in visited_urls:
        return
    visited_urls.add(url)

    local_path = url_to_local(url)
    if not local_path:
        return

    print(f"\n[PAGE] {url} -> {local_path}")

    try:
        r = session.get(url, timeout=20, allow_redirects=True)
        if r.status_code != 200:
            print(f"  [!] HTTP {r.status_code}")
            return
        # Try to detect encoding
        r.encoding = r.apparent_encoding or 'utf-8'
        html = r.text
    except Exception as e:
        print(f"  [ERR] {e}")
        return

    # Save HTML
    with open(local_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"  [OK] saved HTML ({len(html)} chars)")

    # Parse HTML
    soup = BeautifulSoup(html, 'html.parser')

    # Fix relative URLs in HTML
    for tag, attr in [
        ('a', 'href'),
        ('link', 'href'),
        ('script', 'src'),
        ('img', 'src'),
        ('img', 'data-src'),
        ('source', 'src'),
        ('video', 'src'),
        ('audio', 'src'),
        ('iframe', 'src'),
        ('embed', 'src'),
        ('object', 'data'),
        ('area', 'href'),
    ]:
        for el in soup.find_all(tag):
            val = el.get(attr)
            if not val:
                continue
            full_url = urljoin(url, val)
            full_url, _ = urldefrag(full_url)
            if not is_same_domain(full_url):
                continue
            local = url_to_local(full_url)
            if local:
                rel = os.path.relpath(local, os.path.dirname(local_path))
                rel = rel.replace('\\', '/')
                el[attr] = rel
                # Queue asset for download if static
                if is_static_asset(full_url) and full_url not in visited_assets:
                    assets_queue.append(full_url)

    # Also handle inline styles with url()
    for el in soup.find_all(style=True):
        urls = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', el['style'])
        for u in urls:
            full_url = urljoin(url, u)
            full_url, _ = urldefrag(full_url)
            if is_same_domain(full_url) and is_static_asset(full_url):
                if full_url not in visited_assets:
                    assets_queue.append(full_url)

    # Rewrite HTML with fixed links
    with open(local_path, 'w', encoding='utf-8') as f:
        f.write(str(soup))

    # Extract links to other pages
    for el in soup.find_all('a', href=True):
        href = el['href']
        full = urljoin(url, href)
        full, _ = urldefrag(full)
        if is_same_domain(full) and full not in visited_urls:
            # Only follow HTML pages
            if '.html' in href or '/' in href or '?' in href or '#' in href.split('/')[-1]:
                page_queue.append(full)

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    page_count = 0
    asset_count = 0

    while page_queue and page_count < MAX_PAGES:
        url = page_queue.popleft()
        if url in visited_urls:
            continue
        process_page(url)
        page_count += 1
        if page_count % 10 == 0:
            print(f"\n--- Progress: {page_count} pages processed, {len(assets_queue)} assets queued ---")

    print(f"\n\n=== Pages done: {page_count} ===\n")
    print("Downloading queued assets...")
    while assets_queue and asset_count < MAX_ASSETS:
        url = assets_queue.popleft()
        local = url_to_local(url)
        if local and download_file(url, local):
            asset_count += 1

    print(f"\n=== Done! Pages: {page_count}, Assets: {asset_count} ===")
    print(f"Output: {OUTPUT_DIR}")

    # Show directory structure
    for root, dirs, files in os.walk(OUTPUT_DIR):
        level = root.replace(OUTPUT_DIR, '').count(os.sep)
        if level < 3:
            indent = '  ' * level
            print(f"{indent}{os.path.basename(root)}/")
            subindent = '  ' * (level + 1)
            for f in files[:10]:
                print(f"{subindent}{f}")
            if len(files) > 10:
                print(f"{subindent}... ({len(files)} files total)")

if __name__ == '__main__':
    main()
