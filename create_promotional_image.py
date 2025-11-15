#!/usr/bin/env python3
"""
Create promotional images for Chrome Web Store listing
- Small promo tile: 440x280
- Marquee promo tile: 1400x560
Format: 24-bit PNG (no alpha)
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_promo_tile(width, height, output_name):
    # Load the extension icon
    icon_path = 'icons/icon128.png'
    try:
        icon = Image.open(icon_path)
        # Convert RGBA to RGB if needed (remove alpha channel)
        if icon.mode == 'RGBA':
            # Create dark background that matches the promotional image
            icon_rgb = Image.new('RGB', icon.size, (26, 26, 26))  # Dark background
            icon_rgb.paste(icon, mask=icon.split()[3])  # Use alpha channel as mask
            icon = icon_rgb
        elif icon.mode != 'RGB':
            icon = icon.convert('RGB')
    except Exception as e:
        print(f"Warning: Could not load icon: {e}")
        icon = None
    
    # Create image
    image = Image.new('RGB', (width, height), color='#1a1a1a')
    draw = ImageDraw.Draw(image)
    
    # Background gradient effect
    for y in range(height):
        r = int(26 + (y / height) * 20)  # Dark to slightly lighter
        g = int(26 + (y / height) * 20)
        b = int(26 + (y / height) * 20)
        draw.rectangle([(0, y), (width, y+1)], fill=(r, g, b))
    
    # Scale font sizes based on image dimensions
    scale_factor = width / 1280.0  # Base scale on width
    title_font_size = int(72 * scale_factor)
    subtitle_font_size = int(36 * scale_factor)
    
    # Try to use system fonts
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", title_font_size)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", subtitle_font_size)
    except:
        # Fallback to default font
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    # Add YouTube-style red accent at top (scaled)
    red_bar_height = int(60 * scale_factor)
    draw.rectangle([(0, 0), (width, red_bar_height)], fill='#FF0000')
    
    # Add icon in top-left corner
    if icon:
        icon_size = int(80 * scale_factor)
        icon_resized = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
        padding = int(20 * scale_factor)
        image.paste(icon_resized, (padding, padding))
    
    # Title text
    title = "YouTube Timestamp Bookmarker"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    
    # Add larger icon next to title if available
    if icon:
        icon_large_size = int(100 * scale_factor)
        icon_large = icon.resize((icon_large_size, icon_large_size), Image.Resampling.LANCZOS)
        spacing = int(20 * scale_factor)
        total_width = icon_large_size + spacing + title_width
        start_x = (width - total_width) // 2
        icon_y = int(80 * scale_factor)
        text_y = int(100 * scale_factor)
        
        # Paste icon
        image.paste(icon_large, (start_x, icon_y))
        # Draw title next to icon
        draw.text((start_x + icon_large_size + spacing, text_y), title, fill='#FFFFFF', font=title_font)
    else:
        # Center title without icon
        title_x = (width - title_width) // 2
        draw.text((title_x, int(100 * scale_factor)), title, fill='#FFFFFF', font=title_font)
    
    # Subtitle (only if there's enough space)
    if height > 300:
        subtitle = "Bookmark and jump to specific moments in YouTube videos"
        subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
        subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
        subtitle_x = (width - subtitle_width) // 2
        subtitle_y = int(200 * scale_factor)
        draw.text((subtitle_x, subtitle_y), subtitle, fill='#CCCCCC', font=subtitle_font)
    
    # Save as PNG (24-bit, no alpha)
    image.save(output_name, 'PNG')
    print(f"✅ Created: {output_name}")
    print(f"   Size: {width}x{height} pixels")
    print(f"   Format: 24-bit PNG (no alpha)")

if __name__ == '__main__':
    # Create Small promo tile: 440x280
    create_promo_tile(440, 280, 'small_promo_tile.png')
    
    # Create Marquee promo tile: 1400x560
    create_promo_tile(1400, 560, 'marquee_promo_tile.png')

