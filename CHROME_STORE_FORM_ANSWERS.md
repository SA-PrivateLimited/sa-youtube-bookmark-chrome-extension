# Chrome Web Store Privacy & Permissions Form - Answers

Use these answers to fill out your Chrome Web Store submission form:

---

## Single Purpose Description

**Answer (under 1000 characters):**

```
YouTube Timestamp Bookmarker allows users to bookmark specific timestamps in YouTube videos and quickly navigate back to those moments. The extension adds a bookmark button to YouTube video pages, enabling users to save timestamps with optional notes. All bookmarks are stored locally on the user's device and can be managed through the extension popup. The extension's single purpose is to provide a simple, local-only bookmarking system for YouTube video timestamps.
```

---

## Permission Justifications

### Storage Justification

**Answer (under 1000 characters):**

```
The storage permission is required to save user bookmarks locally on their device. When users bookmark a timestamp in a YouTube video, the extension stores the video ID, timestamp, optional note, and video title in Chrome's local storage. This data is essential for the extension's core functionality - allowing users to save and later access their bookmarked timestamps. All data remains on the user's device and is never transmitted to external servers.
```

### activeTab Justification

**Answer (under 1000 characters):**

```
The activeTab permission is required to access the current YouTube video page when users interact with the extension popup. This allows the extension to read the current video information (video ID, title, current timestamp) and enable features like jumping to bookmarked timestamps directly from the popup. The permission is only used when the user actively clicks the extension icon, ensuring minimal access to tab data.
```

### scripting Justification

**Answer (under 1000 characters):**

```
The scripting permission is required as a fallback mechanism to ensure the extension functions reliably. If the content script fails to load or respond, the extension uses scripting.executeScript to directly execute the jump-to-timestamp functionality in the YouTube page. This ensures users can always navigate to bookmarked timestamps even if the content script encounters issues, providing a better user experience and reliability.
```

### Host Permission Justification (youtube.com)

**Answer (under 1000 characters):**

```
The host permission for youtube.com is essential for the extension's core functionality. The extension needs to inject a bookmark button into YouTube video pages and interact with the YouTube video player. This includes: (1) Adding a bookmark button to the video player interface, (2) Reading video information (video ID, title, current timestamp), (3) Controlling video playback to jump to bookmarked timestamps, and (4) Detecting when users are on YouTube watch pages. Without this permission, the extension cannot function as it requires direct interaction with YouTube's video player and page structure.
```

---

## Remote Code

**Answer:** Select: **"No, I am not using Remote code"**

**Justification (if asked):**

```
This extension does not use remote code. All JavaScript code is included directly in the extension package. There are no external script references, no dynamic code loading, and no use of eval() or similar functions. All functionality is self-contained within the extension files.
```

---

## Data Usage / What user data do you plan to collect?

**Answer:** Select **NONE** of the checkboxes. The extension does not collect any user data.

**Explanation:**
- The extension stores bookmarks locally on the user's device
- No data is transmitted to external servers
- No personal information is collected
- All data remains on the user's device

---

## Certifications

Check all three boxes:

✅ **I do not sell or transfer user data to third parties, outside of the approved use cases**

✅ **I do not use or transfer user data for purposes that are unrelated to my item's single purpose**

✅ **I do not use or transfer user data to determine creditworthiness or for lending purposes**

---

## Privacy Policy URL

**You need to host the privacy policy online.** Options:

1. **GitHub Pages** (if you have a GitHub repo):
   - Create a `docs` folder in your repo
   - Add `PRIVACY_POLICY.md` there
   - Enable GitHub Pages
   - URL will be: `https://yourusername.github.io/repo-name/PRIVACY_POLICY.html`

2. **Simple web hosting**:
   - Upload the privacy policy to any web hosting service
   - Convert the markdown to HTML or host as-is

3. **GitHub Gist** (quick option):
   - Create a new Gist with the privacy policy
   - Use the raw URL: `https://gist.githubusercontent.com/username/gist-id/raw/PRIVACY_POLICY.md`

**Example Privacy Policy URL format:**
```
https://yourdomain.com/privacy-policy
```
or
```
https://raw.githubusercontent.com/yourusername/repo/main/PRIVACY_POLICY.md
```

---

## Summary

- **Single Purpose**: Bookmark YouTube video timestamps locally
- **Storage**: Stores bookmarks locally on device
- **activeTab**: Access current tab when popup is opened
- **scripting**: Fallback for reliable timestamp navigation
- **Host Permission**: Required to interact with YouTube video player
- **Remote Code**: No
- **Data Collection**: None
- **Privacy Policy**: Required (host online)

---

**Note**: Make sure to host the privacy policy online before submitting. The Chrome Web Store requires a publicly accessible URL.

