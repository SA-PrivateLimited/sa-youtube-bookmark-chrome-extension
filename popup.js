/**
 * YouTube Timestamp Bookmarker - Popup Script
 * 
 * Copyright (c) 2024 Sandeep Gupta
 * All rights reserved.
 * 
 * This software is proprietary and confidential. Unauthorized copying,
 * modification, distribution, or use of this software, via any medium,
 * is strictly prohibited without the express written permission of the owner.
 * 
 * For licensing inquiries, please contact: sandepkgupta1996@gmail.com
 */

// Popup script for managing bookmarks
(function() {
  'use strict';

  const NOT_YOUTUBE = document.getElementById('not-youtube');
  const MAIN_CONTENT = document.getElementById('main-content');
  const BOOKMARKS_LIST = document.getElementById('bookmarks-list');
  const VIDEO_TITLE = document.getElementById('video-title');
  const VIDEO_URL = document.getElementById('video-url');
  const REFRESH_BTN = document.getElementById('refresh-btn');

  // Format time as MM:SS or HH:MM:SS
  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Get video ID from URL
  function getVideoId(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v');
    } catch (e) {
      return null;
    }
  }

  // Load and display bookmarks
  async function loadBookmarks() {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || !tab.url.includes('youtube.com/watch')) {
      NOT_YOUTUBE.classList.remove('hidden');
      MAIN_CONTENT.classList.add('hidden');
      return;
    }

    NOT_YOUTUBE.classList.add('hidden');
    MAIN_CONTENT.classList.remove('hidden');

    const videoId = getVideoId(tab.url);
    if (!videoId) {
      BOOKMARKS_LIST.innerHTML = '<p class="empty-state">Invalid YouTube URL</p>';
      return;
    }

    // Get video title from page
    try {
      const results = await chrome.tabs.sendMessage(tab.id, { action: 'getVideoInfo' });
      if (results && results.videoId) {
        // Video info available
      }
    } catch (e) {
      // Content script might not be ready
    }

    // Set video URL
    VIDEO_URL.textContent = tab.url;
    VIDEO_TITLE.textContent = tab.title.replace(' - YouTube', '') || 'YouTube Video';

    // Load bookmarks from storage with error handling
    let bookmarks = {};
    let videoBookmarks = [];
    try {
      const result = await chrome.storage.local.get(['bookmarks']);
      bookmarks = result.bookmarks || {};
      videoBookmarks = bookmarks[videoId] || [];
    } catch (storageError) {
      console.error('❌ Error loading bookmarks:', storageError);
      BOOKMARKS_LIST.innerHTML = '<p class="empty-state" style="color: #ff4757;">Error loading bookmarks. Please check extension permissions.</p>';
      return;
    }

    if (videoBookmarks.length === 0) {
      BOOKMARKS_LIST.innerHTML = '<p class="empty-state">No bookmarks yet. Click the bookmark button on the video page to add one!</p>';
      return;
    }

    // Display bookmarks
    BOOKMARKS_LIST.innerHTML = videoBookmarks.map((bookmark, index) => {
      // Header: Video title (or fallback to timestamp if no title)
      const header = bookmark.videoTitle || `Bookmark at ${bookmark.timeString || formatTime(bookmark.timestamp)}`;
      
      // Subheader: Optional note
      const subheaderHtml = bookmark.note 
        ? `<div class="bookmark-note">${escapeHtml(bookmark.note)}</div>`
        : '';
      
      return `
        <div class="bookmark-item" data-index="${index}">
          <div class="bookmark-header">
            <div class="bookmark-title-section">
              <div class="bookmark-title">${escapeHtml(header)}</div>
              <span class="bookmark-time">⏱️ ${bookmark.timeString || formatTime(bookmark.timestamp)}</span>
            </div>
            <button class="delete-btn" data-index="${index}">Delete</button>
          </div>
          ${subheaderHtml}
        </div>
      `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.bookmark-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
          e.stopPropagation();
          return;
        }
        
        const index = parseInt(item.dataset.index);
        const bookmark = videoBookmarks[index];
        jumpToTimestamp(bookmark.timestamp);
      });
    });

    // Add delete handlers
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        await deleteBookmark(videoId, index);
      });
    });
  }

  // Jump to timestamp in video
  async function jumpToTimestamp(timestamp) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      alert('Error: Could not access the current tab.');
      return;
    }

    // Check if we're on a YouTube video page
    if (!tab.url || !tab.url.includes('youtube.com/watch')) {
      alert('Error: Please navigate to a YouTube video page first.');
      return;
    }

    try {
      // Try to send message to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'jumpToTimestamp',
        timestamp: timestamp
      });
      window.close(); // Close popup after jumping
    } catch (e) {
      console.error('Error jumping to timestamp:', e);
      
      // Fallback: Try to execute script directly if content script isn't loaded
      if (e.message && e.message.includes('Could not establish connection')) {
        try {
          // Direct execution as fallback
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (ts) => {
              const video = document.querySelector('video');
              if (video) {
                video.currentTime = ts;
                video.play();
              }
            },
            args: [timestamp]
          });
          window.close(); // Close popup after jumping
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          alert('Error: Could not jump to timestamp. Please refresh the YouTube page and try again.');
        }
      } else {
        alert('Error: Could not jump to timestamp. Please make sure the video is loaded and try again.');
      }
    }
  }

  // Delete bookmark
  async function deleteBookmark(videoId, index) {
    try {
      let bookmarks = {};
      let videoBookmarks = [];
      
      try {
        const result = await chrome.storage.local.get(['bookmarks']);
        bookmarks = result.bookmarks || {};
        videoBookmarks = bookmarks[videoId] || [];
      } catch (storageError) {
        console.error('❌ Error accessing storage for delete:', storageError);
        alert('Error accessing bookmarks. Please check extension permissions.');
        return;
      }

      if (index >= 0 && index < videoBookmarks.length) {
        videoBookmarks.splice(index, 1);
        bookmarks[videoId] = videoBookmarks;
        
        try {
          await chrome.storage.local.set({ bookmarks });
          await loadBookmarks(); // Reload
        } catch (saveError) {
          console.error('❌ Error saving after delete:', saveError);
          alert('Error saving changes. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Unexpected error deleting bookmark:', error);
      alert('An error occurred while deleting bookmark. Please try again.');
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Refresh button
  REFRESH_BTN.addEventListener('click', loadBookmarks);

  // Listen for bookmark updates
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'bookmarkAdded') {
      loadBookmarks();
    }
  });

  // Load bookmarks on popup open
  loadBookmarks();

})();

