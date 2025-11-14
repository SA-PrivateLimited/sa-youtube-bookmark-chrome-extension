# YouTube Timestamp Bookmarker

A Chrome extension that allows you to bookmark specific timestamps in YouTube videos and quickly jump back to them.

**Copyright (c) 2024 Sandeep Gupta. All rights reserved.**

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use is strictly prohibited. See [LICENSE](LICENSE) for full terms.

## Features

- 📑 **Bookmark Timestamps**: Click the bookmark button on any YouTube video to save the current timestamp
- 📝 **Add Notes**: Optionally add notes to your bookmarks for better organization
- ⏱️ **Quick Navigation**: Click any bookmark in the popup to jump directly to that timestamp
- 🗑️ **Manage Bookmarks**: Delete bookmarks you no longer need
- 💾 **Persistent Storage**: Bookmarks are saved per video and persist across browser sessions

## Installation

### Step 1: Prepare Icons

Before installing, you need to add icon files to the `icons` directory:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can create these icons using any image editor, or use online tools like [Favicon Generator](https://favicon.io/). The icons should represent a bookmark or timestamp concept.

### Step 2: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the folder containing this extension (`chrome extension`)
5. The extension should now appear in your extensions list

### Step 3: Pin the Extension (Optional)

1. Click the puzzle piece icon in Chrome's toolbar
2. Find "YouTube Timestamp Bookmarker"
3. Click the pin icon to keep it visible in your toolbar

## How to Use

1. **Navigate to a YouTube video** (e.g., `https://www.youtube.com/watch?v=...`)

2. **Bookmark a timestamp**:
   - Play the video to the point you want to bookmark
   - Click the **"📑 Bookmark"** button that appears near the video controls
   - Optionally add a note when prompted
   - The bookmark is saved automatically

3. **View your bookmarks**:
   - Click the extension icon in your Chrome toolbar
   - The popup will show all bookmarks for the current video
   - Bookmarks are sorted by timestamp

4. **Jump to a timestamp**:
   - Click any bookmark in the popup
   - The video will automatically jump to that timestamp and start playing

5. **Delete a bookmark**:
   - Click the **"Delete"** button next to any bookmark in the popup

## File Structure

```
chrome extension/
├── manifest.json       # Extension configuration
├── content.js          # Script that interacts with YouTube pages
├── content.css         # Styles for the bookmark button
├── popup.html          # Extension popup UI
├── popup.css           # Styles for the popup
├── popup.js            # Popup functionality
├── icons/              # Extension icons (you need to add these)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Storage**: Uses Chrome's `chrome.storage.local` API for persistent bookmark storage
- **Permissions**: 
  - `storage`: To save and retrieve bookmarks
  - `activeTab`: To interact with YouTube pages
  - `host_permissions`: Access to YouTube domain

## Troubleshooting

- **Bookmark button not appearing**: Make sure you're on a YouTube video page (`youtube.com/watch`). The button may take a moment to appear after the page loads.

- **Extension not working**: 
  - Check that the extension is enabled in `chrome://extensions/`
  - Try reloading the YouTube page
  - Check the browser console for errors (F12)

- **Bookmarks not saving**: 
  - Ensure you have sufficient storage permissions
  - Check Chrome's storage quota in `chrome://extensions/`

## Future Enhancements

Potential features for future versions:
- Export/import bookmarks
- Sync bookmarks across devices
- Bookmark categories/tags
- Share bookmarks with others
- Keyboard shortcuts

## License & Copyright

**Copyright (c) 2024 Sandeep Gupta. All rights reserved.**

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without the express written permission of the copyright holder.

### Commercial Use

For commercial licensing, distribution, or monetization inquiries, please contact the copyright holder.

### Terms

- This software is provided for personal, non-commercial use only
- You may NOT copy, modify, distribute, or create derivative works
- You may NOT claim ownership or authorship of this software
- All intellectual property rights remain with Sandeep Gupta

See [LICENSE](LICENSE) file for complete terms and conditions.

---

**For licensing inquiries:** [your-email@example.com]

# sa-youtube-bookmark-chrome-extension
# sa-youtube-bookmark-chrome-extension
