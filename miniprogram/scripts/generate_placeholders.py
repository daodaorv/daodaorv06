import os
from PIL import Image, ImageDraw, ImageFont

# Base directory
BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static')

# Configuration
images = [
    # Core
    {'path': 'logo.png', 'size': (160, 160), 'color': '#1AAD19', 'text': 'LOGO', 'format': 'PNG'},
    {'path': 'default-avatar.png', 'size': (120, 120), 'color': '#CCCCCC', 'text': 'Avatar', 'format': 'PNG'},
    {'path': '场景推荐2.jpg', 'size': (750, 480), 'color': '#FF9800', 'text': '场景推荐', 'format': 'JPEG'},
    {'path': '优惠政策.jpg', 'size': (750, 480), 'color': '#2196F3', 'text': '优惠政策', 'format': 'JPEG'},
    
    # Icons
    {'path': 'icons/wechat.png', 'size': (88, 88), 'color': '#07C160', 'text': 'WeChat', 'format': 'PNG'},
    {'path': 'icons/alipay.png', 'size': (88, 88), 'color': '#1677FF', 'text': 'Alipay', 'format': 'PNG'},
    {'path': 'icons/douyin.png', 'size': (88, 88), 'color': '#000000', 'text': 'Douyin', 'format': 'PNG'},
    {'path': 'icons/phone-bind.png', 'size': (160, 160), 'color': '#FF5722', 'text': 'Phone', 'format': 'PNG'},
    {'path': 'icons/crown.png', 'size': (32, 32), 'color': '#FFD700', 'text': 'K', 'format': 'PNG'},
    
    # Images (Business)
    {'path': 'images/member-plus-bg.png', 'size': (750, 400), 'color': '#333333', 'text': 'PLUS Member', 'format': 'PNG'},
    {'path': 'images/empty-vehicle.png', 'size': (200, 200), 'color': '#EEEEEE', 'text': 'No Vehicle', 'format': 'PNG'},
    {'path': 'images/empty-order.png', 'size': (200, 200), 'color': '#EEEEEE', 'text': 'No Order', 'format': 'PNG'},
    {'path': 'images/empty-favorite.png', 'size': (200, 200), 'color': '#EEEEEE', 'text': 'No Fav', 'format': 'PNG'},
    {'path': 'images/empty-community.png', 'size': (200, 200), 'color': '#EEEEEE', 'text': 'No Content', 'format': 'PNG'},

    # Vehicles (Examples)
    {'path': 'vehicles/vehicle-01.jpg', 'size': (750, 500), 'color': '#9C27B0', 'text': 'Vehicle 01', 'format': 'JPEG'},
    {'path': 'vehicles/vehicle-02.jpg', 'size': (750, 500), 'color': '#673AB7', 'text': 'Vehicle 02', 'format': 'JPEG'},
]

def generate_image(config):
    full_path = os.path.join(BASE_DIR, config['path'])
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    # Create image
    img = Image.new('RGB', config['size'], color=config['color'])
    draw = ImageDraw.Draw(img)
    
    # Add text (simple centering)
    try:
        # Try to use a default font, usually larger if possible, but default is fine for placeholders
        # On Windows, arial.ttf might be available
        font = ImageFont.truetype("arial.ttf", 20)
    except IOError:
        font = ImageFont.load_default()

    text = config['text']
    
    # Calculate text position (basic centering)
    # textbbox is available in newer Pillow, otherwise use textsize
    try:
        left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
        text_width = right - left
        text_height = bottom - top
    except AttributeError:
        # Fallback for older Pillow
        text_width, text_height = draw.textsize(text, font=font)

    x = (config['size'][0] - text_width) / 2
    y = (config['size'][1] - text_height) / 2
    
    draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # Save
    img.save(full_path, format=config['format'])
    print(f"Generated: {full_path}")

def main():
    print(f"Generating images in {BASE_DIR}...")
    for config in images:
        generate_image(config)
    print("Done.")

if __name__ == "__main__":
    main()
