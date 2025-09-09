# Logo Replacement Instructions

## File Location
- **Logo File Path**: `assets/images/logo.png`
- **Current Status**: Placeholder file (needs replacement)

## Supported Image Formats
✅ **PNG** (Recommended) - Supports transparency, best for logos
✅ **JPG/JPEG** - Good for photos, no transparency
✅ **SVG** - Vector format, scalable but limited React Native support
⚠️ **GIF** - Animated support limited
❌ **WebP** - Limited React Native support

## Recommended Logo Specifications
- **Format**: PNG with transparent background
- **Size**: 300x120 pixels (for splash screen)
- **Alternative Size**: 200x80 pixels (for login screen)
- **Aspect Ratio**: 2.5:1 (width:height)
- **Background**: Transparent (PNG format)
- **Color**: Any color (will maintain original colors)

## How to Replace Logo

### Step 1: Prepare Your Logo
1. Save your logo as `logo.png`
2. Ensure dimensions are 300x120px or similar aspect ratio
3. Use PNG format for best results (supports transparency)

### Step 2: Replace the File
1. Navigate to: `assets/images/`
2. Delete the existing `logo.png` file
3. Add your new `logo.png` file
4. **Important**: Keep the same filename `logo.png`

### Step 3: Test
1. Restart the development server: `npm run dev`
2. Check splash screen and login page
3. Logo should appear in both locations

## Logo Usage Locations
The logo will automatically appear in:
- ✅ **Splash Screen** (300x120px size)
- ✅ **Login Page** (200x80px size)
- 🔄 **Easy to add to other screens** (just import the same file)

## Advanced Options

### Different Sizes for Different Screens
If you want different logo sizes for different screens:
1. Create multiple files: `logo-small.png`, `logo-large.png`
2. Update the import statements in the code files
3. Modify the style dimensions accordingly

### Vector Logo (SVG)
For SVG logos:
1. Install react-native-svg: `expo install react-native-svg`
2. Use SvgUri component instead of Image
3. Update import statements

## File Structure
```
assets/
├── images/
│   ├── logo.png          ← Replace this file
│   ├── icon.png          ← App icon (different from logo)
│   └── favicon.png       ← Web favicon
```

## Code References
The logo is referenced in:
- `app/index.tsx` (Splash screen)
- `app/(auth)/login.tsx` (Login page)

## Troubleshooting
- **Logo not showing**: Check file name is exactly `logo.png`
- **Logo too big/small**: Adjust width/height in styles
- **Logo blurry**: Use higher resolution PNG (300x120 minimum)
- **Build errors**: Ensure PNG format and restart development server

## Need Help?
If you encounter issues:
1. Ensure file is named exactly `logo.png`
2. Check file format is PNG
3. Restart development server
4. Clear cache if needed: `expo start --clear`