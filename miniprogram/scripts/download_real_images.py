import os
import urllib.request
import random
import time

# Base directory
BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static')

def get_loremflickr_url(width, height, keywords):
    return f"https://loremflickr.com/{width}/{height}/{keywords}?lock={random.randint(1, 1000)}"

def get_picsum_url(width, height):
     return f"https://picsum.photos/{width}/{height}?random={random.randint(1, 1000)}"

# Configuration for REAL images
targets = [
    # Avatars
    {'path': 'default-avatar.png', 'width': 120, 'height': 120, 'keywords': 'portrait,face'},
    
    # Banners
    {'path': '场景推荐2.jpg', 'width': 750, 'height': 480, 'keywords': 'nature,camping'},
    {'path': '优惠政策.jpg', 'width': 750, 'height': 480, 'keywords': 'roadtrip,highway'},
    
    # Vehicles
    {'path': 'vehicles/vehicle-01.jpg', 'width': 750, 'height': 500, 'keywords': 'campervan,rv,motorhome'},
    {'path': 'vehicles/vehicle-02.jpg', 'width': 750, 'height': 500, 'keywords': 'car,van,camping'},
    
    # Backgrounds
    {'path': 'images/member-plus-bg.png', 'width': 750, 'height': 400, 'keywords': 'abstract,dark,texture'},
]

def download_image(config):
    full_path = os.path.join(BASE_DIR, config['path'])
    width = config['width']
    height = config['height']
    keywords = config['keywords']
    
    url = get_loremflickr_url(width, height, keywords)
    
    print(f"Downloading {config['path']}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response, open(full_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Success: {full_path}")
    except Exception as e:
        print(f"Failed to download from LoremFlickr: {e}")
        # Fallback to picsum
        try:
            fallback_url = get_picsum_url(width, height)
            print(f"Retrying with Picsum: {fallback_url}")
            req = urllib.request.Request(fallback_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as response, open(full_path, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Success (Fallback): {full_path}")
        except Exception as e2:
             print(f"Failed fallback: {e2}")

def main():
    print(f"Downloading real images to {BASE_DIR}...")
    for config in targets:
        download_image(config)
        time.sleep(1.5) # Be nice to the server
    print("Done.")

if __name__ == "__main__":
    main()
