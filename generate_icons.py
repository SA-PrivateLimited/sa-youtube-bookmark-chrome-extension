#!/usr/bin/env python3
"""
Simple script to generate placeholder icons for the Chrome extension.
Requires Pillow: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("Pillow is required. Install it with: pip install Pillow")
    exit(1)

def create_icon(size, output_path):
    """Create a simple bookmark icon"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a bookmark shape (simplified)
    # Main rectangle
    margin = size // 8
    rect_coords = [
        (margin, margin),
        (size - margin, size - margin * 2),
        (size - margin, size - margin),
        (size // 2, size - margin // 2),
        (margin, size - margin)
    ]
    
    # Draw bookmark shape with gradient-like effect
    draw.polygon(rect_coords, fill=(102, 126, 234, 255))  # Purple-blue color
    
    # Add a small circle at the top for the bookmark ribbon
    circle_radius = size // 6
    circle_center = (size // 2, margin + circle_radius)
    draw.ellipse(
        [circle_center[0] - circle_radius, circle_center[1] - circle_radius,
         circle_center[0] + circle_radius, circle_center[1] + circle_radius],
        fill=(118, 75, 162, 255)  # Darker purple
    )
    
    # Save the image
    img.save(output_path, 'PNG')
    print(f"Created {output_path} ({size}x{size})")

def main():
    # Create icons directory if it doesn't exist
    icons_dir = 'icons'
    os.makedirs(icons_dir, exist_ok=True)
    
    # Generate icons in different sizes
    sizes = [16, 48, 128]
    for size in sizes:
        output_path = os.path.join(icons_dir, f'icon{size}.png')
        create_icon(size, output_path)
    
    print("\nIcons generated successfully!")
    print("You can now load the extension in Chrome.")

if __name__ == '__main__':
    main()

