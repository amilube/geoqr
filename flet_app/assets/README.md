# Assets Directory

This directory contains static assets for the Flet Android application.

## Structure

```
assets/
├── icons/        # App icons and in-app icons
├── images/       # Images used in the app
├── fonts/        # Custom fonts (if any)
└── data/         # Static data files
```

## Usage

Assets can be loaded in the Flet app using:

```python
import flet as ft

# Load an image
image = ft.Image(src="/assets/images/logo.png")

# Load an icon
icon = ft.Icon(name="/assets/icons/custom_icon.png")
```

## Guidelines

1. **Optimize assets** before adding:
   - Compress images (use WebP format when possible)
   - Minimize SVG files
   - Use appropriate dimensions for target screens

2. **Naming conventions**:
   - Use lowercase with underscores: `app_logo.png`
   - Include size suffix when multiple sizes: `icon_24.png`, `icon_48.png`
   - Use descriptive names: `background_login.png` not `bg1.png`

3. **Organization**:
   - Group related assets in subdirectories
   - Keep a README in each subdirectory explaining contents
   - Remove unused assets regularly

4. **Licensing**:
   - Ensure you have rights to use all assets
   - Document asset sources and licenses
   - Keep attribution information when required

## App Icons

For Android app icons, place in appropriate directories:
- `icons/launcher/` - Launcher icons (adaptive icons)
- `icons/notification/` - Notification icons

Recommended sizes:
- mdpi: 48×48 px
- hdpi: 72×72 px
- xhdpi: 96×96 px
- xxhdpi: 144×144 px
- xxxhdpi: 192×192 px
