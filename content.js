/**
 * YouTube Timestamp Bookmarker - Content Script
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

// Content script to interact with YouTube player
(function() {
  'use strict';

  // Check if Chrome API is available (but don't exit - we'll check again when needed)
  const chromeAPI = typeof chrome !== 'undefined' ? chrome : 
                    (typeof browser !== 'undefined' ? browser : null);
  
  if (!chromeAPI) {
    console.error('❌ Chrome/Browser API not available at script load');
  } else if (!chromeAPI.storage) {
    console.error('❌ Chrome storage API not available at script load');
  } else {
    // Make sure chrome is available globally for compatibility
    if (typeof chrome === 'undefined' && typeof browser !== 'undefined') {
      window.chrome = browser;
    }
  }

  // Debug: Log that script is running
  console.log('🔵 YouTube Bookmark Extension: Content script loaded on', window.location.href);
  console.log('✅ Chrome API available:', typeof chrome !== 'undefined');
  console.log('✅ Browser API available:', typeof browser !== 'undefined');
  console.log('✅ Storage API available:', !!(chromeAPI && chromeAPI.storage));

  // Helper function to safely access chrome.storage
  function getStorage() {
    // Check multiple ways chrome API might be available
    let chromeAPI = null;
    
    try {
      if (typeof chrome !== 'undefined' && chrome && chrome.storage) {
        chromeAPI = chrome;
      } else if (typeof browser !== 'undefined' && browser && browser.storage) {
        chromeAPI = browser;
        // Make chrome available for compatibility
        if (typeof chrome === 'undefined') {
          window.chrome = browser;
        }
      }
    } catch (e) {
      console.error('❌ Error checking for chrome/browser API:', e);
    }
    
    if (!chromeAPI) {
      console.error('❌ Neither chrome nor browser API available');
      console.error('❌ chrome type:', typeof chrome);
      console.error('❌ browser type:', typeof browser);
      throw new Error('Chrome storage API not available - chrome object is undefined');
    }
    
    if (!chromeAPI.storage) {
      console.error('❌ chrome.storage is undefined');
      console.error('❌ chromeAPI:', chromeAPI);
      throw new Error('Chrome storage API not available - storage is undefined');
    }
    
    // Use optional chaining to safely check for .local
    if (!chromeAPI.storage || !chromeAPI.storage.local) {
      console.error('❌ chrome.storage.local is undefined');
      console.error('❌ chromeAPI.storage:', chromeAPI.storage);
      throw new Error('Chrome storage API not available - storage.local is undefined');
    }
    
    return chromeAPI.storage.local;
  }

  // Get current video ID and timestamp
  function getVideoInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    const video = document.querySelector('video');
    
    if (!video) return null;
    
    return {
      videoId: videoId,
      currentTime: Math.floor(video.currentTime),
      duration: Math.floor(video.duration),
      url: window.location.href
    };
  }

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

  // Create bookmark button overlay
  function createBookmarkButton() {
    const button = document.createElement('button');
    button.id = 'yt-bookmark-btn';
    button.innerHTML = '📑 Bookmark';
    button.title = 'Bookmark current timestamp';
    button.className = 'yt-bookmark-button';
    
    button.addEventListener('click', async () => {
      try {
        const videoInfo = getVideoInfo();
        if (!videoInfo) {
          alert('Video not found. Please wait for the video to load.');
          return;
        }

        // Get existing bookmarks with error handling
        let bookmarks = {};
        let videoBookmarks = [];
        
        try {
          const storage = getStorage();
          const result = await storage.get(['bookmarks']);
          bookmarks = result.bookmarks || {};
          videoBookmarks = bookmarks[videoInfo.videoId] || [];
        } catch (storageError) {
          console.error('❌ Error accessing storage:', storageError);
          if (storageError.message && storageError.message.includes('not available')) {
            alert('Storage API not available. Please:\n1. Reload the extension at chrome://extensions/\n2. Refresh this YouTube page');
          } else {
            alert('Error accessing bookmarks storage. Please check extension permissions.');
          }
          return;
        }

        // Check if bookmark already exists at this timestamp
        const existingBookmark = videoBookmarks.find(b => 
          Math.abs(b.timestamp - videoInfo.currentTime) < 2
        );

        if (existingBookmark) {
          if (confirm('Bookmark already exists at this timestamp. Create anyway?')) {
            // Continue to create new bookmark
          } else {
            return;
          }
        }

        // Get video title
        const videoTitle = document.querySelector('h1.ytd-watch-metadata, #title h1, ytd-watch-metadata h1')?.textContent?.trim() || 
                          document.title.replace(' - YouTube', '') || 
                          'Untitled Video';

        // Prompt for note
        const note = prompt('Add a note (optional):', '') || '';

        // Create new bookmark with video title as header
        const bookmark = {
          timestamp: videoInfo.currentTime,
          videoTitle: videoTitle,  // Header: Video name
          note: note,              // Subheader: Optional note
          timeString: formatTime(videoInfo.currentTime),
          createdAt: new Date().toISOString()
        };

        videoBookmarks.push(bookmark);
        videoBookmarks.sort((a, b) => a.timestamp - b.timestamp);

        bookmarks[videoInfo.videoId] = videoBookmarks;

        // Save to storage with error handling
        try {
          const storage = getStorage();
          await storage.set({ bookmarks });
          console.log('✅ Bookmark saved successfully');
        } catch (saveError) {
          console.error('❌ Error saving bookmark:', saveError);
          if (saveError.message && saveError.message.includes('not available')) {
            alert('Storage API not available. Please:\n1. Reload the extension at chrome://extensions/\n2. Refresh this YouTube page');
          } else {
            alert('Error saving bookmark. Please try again.');
          }
          return;
        }

        // Show confirmation
        button.textContent = '✓ Bookmarked!';
        setTimeout(() => {
          button.textContent = '📑 Bookmark';
        }, 2000);

        // Notify popup to refresh
        try {
          chrome.runtime.sendMessage({ action: 'bookmarkAdded' });
        } catch (messageError) {
          console.warn('⚠️ Could not notify popup:', messageError);
          // Non-critical, continue anyway
        }
      } catch (error) {
        console.error('❌ Unexpected error in bookmark button:', error);
        alert('An error occurred while bookmarking. Please try again.');
      }
    });

    return button;
  }

  // Inject bookmark button into YouTube UI
  function injectBookmarkButton() {
    // Only inject on video pages
    if (!window.location.href.includes('/watch')) {
      console.log('⏭️ Not a watch page, skipping injection');
      return;
    }

    // Check if button already exists - if so, skip injection
    const existingBtn = document.getElementById('yt-bookmark-btn');
    const existingFloatingBtn = document.getElementById('yt-bookmark-btn-floating');
    
    if (existingBtn || existingFloatingBtn) {
      console.log('✅ Bookmark button already exists, skipping injection');
      return;
    }

    console.log('🔍 Attempting to inject bookmark button...');

    // Inject button on the right side of video player (similar to info button on left)
    // Find the video player container
    const videoPlayerSelectors = [
      '#movie_player',
      '.html5-video-player',
      'ytd-player',
      '#player-container',
      '#player'
    ];

    let videoContainer = null;
    for (const selector of videoPlayerSelectors) {
      videoContainer = document.querySelector(selector);
      if (videoContainer) {
        break;
      }
    }

    if (videoContainer) {
      try {
        // Check if button already exists in this container
        const existingBtnInContainer = videoContainer.querySelector('#yt-bookmark-btn-floating');
        if (existingBtnInContainer) {
          console.log('✅ Button already exists in video container');
          return;
        }

        const bookmarkButton = createBookmarkButton();
        bookmarkButton.id = 'yt-bookmark-btn-floating';
        
        // Position on right side of video player (similar to info button on left)
        bookmarkButton.style.cssText = `
          position: absolute !important;
          top: 12px !important;
          right: 12px !important;
          z-index: 35 !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          padding: 8px 14px !important;
          border-radius: 18px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          min-width: 100px !important;
          height: 36px !important;
          border: none !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
          transition: all 0.2s ease !important;
          white-space: nowrap !important;
        `;

        // Add hover effect
        bookmarkButton.addEventListener('mouseenter', () => {
          bookmarkButton.style.transform = 'translateY(-1px)';
          bookmarkButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        });
        bookmarkButton.addEventListener('mouseleave', () => {
          bookmarkButton.style.transform = 'translateY(0)';
          bookmarkButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        });

        // Ensure container has relative positioning
        const containerStyle = window.getComputedStyle(videoContainer);
        if (containerStyle.position === 'static') {
          videoContainer.style.position = 'relative';
        }

        videoContainer.appendChild(bookmarkButton);
        console.log('✅ Bookmark button injected on right side of video player');
      } catch (e) {
        console.error('❌ Failed to inject button into video container:', e);
        // Fallback to body if video container injection fails
        injectFallbackButton();
      }
    } else {
      console.log('⚠️ Video container not found, using fallback');
      injectFallbackButton();
    }

    // Fallback function for when video container is not found
    function injectFallbackButton() {
      try {
        const floatingButton = createBookmarkButton();
        floatingButton.style.cssText = `
          position: fixed !important;
          top: 80px !important;
          right: 20px !important;
          z-index: 999999 !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          padding: 10px 18px !important;
          border-radius: 20px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          min-width: 120px !important;
          border: none !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
        `;
        floatingButton.id = 'yt-bookmark-btn-floating';
        
        if (document.body) {
          document.body.appendChild(floatingButton);
          console.log('✅ Bookmark button injected as fallback floating button');
        } else {
          setTimeout(() => {
            if (document.body && !document.getElementById('yt-bookmark-btn-floating')) {
              document.body.appendChild(floatingButton);
              console.log('✅ Bookmark button injected as fallback (delayed)');
            }
          }, 500);
        }
      } catch (e) {
        console.error('❌ Failed to inject fallback button:', e);
      }
    }
  }

  // Jump to timestamp
  function jumpToTimestamp(timestamp) {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = timestamp;
      video.play();
    }
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      if (request.action === 'getVideoInfo') {
        const videoInfo = getVideoInfo();
        sendResponse(videoInfo);
        return true; // Indicates we will send a response
      } else if (request.action === 'jumpToTimestamp') {
        jumpToTimestamp(request.timestamp);
        sendResponse({ success: true });
        return true; // Indicates we will send a response
      }
    } catch (error) {
      console.error('❌ Error handling message:', error);
      sendResponse({ error: error.message });
      return true;
    }
    return false; // No response needed
  });

  // Aggressive retry mechanism
  let retryCount = 0;
  const maxRetries = 30;
  
  function tryInjectButton() {
    // Check for both button types first - if either exists, don't retry
    const existingBtn = document.getElementById('yt-bookmark-btn');
    const existingFloatingBtn = document.getElementById('yt-bookmark-btn-floating');
    
    if (existingBtn || existingFloatingBtn) {
      console.log('✅ Button already exists, skipping injection');
      retryCount = 0; // Reset since button exists
      return;
    }

    if (retryCount >= maxRetries) {
      console.error('❌ Failed to inject bookmark button after', maxRetries, 'attempts');
      // Even after max retries, try one last time with fixed position
      // But only if button doesn't exist
      if (!document.getElementById('yt-bookmark-btn') && !document.getElementById('yt-bookmark-btn-floating')) {
        try {
          const newButton = createBookmarkButton();
          newButton.style.position = 'fixed';
          newButton.style.top = '80px';
          newButton.style.right = '20px';
          newButton.style.zIndex = '999999';
          newButton.style.backgroundColor = '#667eea';
          newButton.id = 'yt-bookmark-btn-floating';
          document.body.appendChild(newButton);
          console.log('🆘 Emergency injection: Button added to body');
        } catch (e) {
          console.error('❌ Emergency injection also failed:', e);
        }
      }
      return;
    }

    retryCount++;
    
    if (window.location.href.includes('/watch')) {
      console.log(`🔄 Injection attempt ${retryCount}/${maxRetries}`);
      injectBookmarkButton();
      
      // Check if either button was injected
      const btnAfter = document.getElementById('yt-bookmark-btn');
      const floatingBtnAfter = document.getElementById('yt-bookmark-btn-floating');
      
      if (!btnAfter && !floatingBtnAfter) {
        // Neither button exists, retry
        setTimeout(tryInjectButton, 300);
      } else {
        console.log('✅ Button successfully injected!', {
          regular: !!btnAfter,
          floating: !!floatingBtnAfter
        });
        retryCount = 0; // Reset on success
      }
    }
  }

  // Initial injection attempts
  function initializeButton() {
    console.log('🚀 Initializing bookmark button injection...');
    retryCount = 0;
    
    // Try immediately
    tryInjectButton();
    
    // Try after delays (YouTube loads elements at different times)
    setTimeout(() => { console.log('⏰ Retry at 500ms'); tryInjectButton(); }, 500);
    setTimeout(() => { console.log('⏰ Retry at 1s'); tryInjectButton(); }, 1000);
    setTimeout(() => { console.log('⏰ Retry at 2s'); tryInjectButton(); }, 2000);
    setTimeout(() => { console.log('⏰ Retry at 3s'); tryInjectButton(); }, 3000);
    setTimeout(() => { console.log('⏰ Retry at 5s'); tryInjectButton(); }, 5000);
    setTimeout(() => { console.log('⏰ Retry at 8s'); tryInjectButton(); }, 8000);
  }

  // Start when DOM is ready - always initialize button injection
  // (Button injection doesn't need chrome API until clicked)
  function startInjection() {
    if (document.body) {
      initializeButton();
    } else {
      // Wait for body to be ready
      const bodyObserver = new MutationObserver((mutations, observer) => {
        if (document.body) {
          observer.disconnect();
          initializeButton();
        }
      });
      bodyObserver.observe(document.documentElement, { childList: true });
      
      // Fallback timeout
      setTimeout(() => {
        if (document.body) {
          initializeButton();
        }
      }, 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInjection);
  } else {
    startInjection();
  }
  
  // Also try immediately
  setTimeout(startInjection, 100);

  // Re-inject on navigation (YouTube is a SPA)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl && url.includes('/watch')) {
      lastUrl = url;
      retryCount = 0;
      // Remove both button types
      const existingBtn = document.getElementById('yt-bookmark-btn');
      const existingFloatingBtn = document.getElementById('yt-bookmark-btn-floating');
      if (existingBtn) {
        existingBtn.remove();
      }
      if (existingFloatingBtn) {
        existingFloatingBtn.remove();
      }
      setTimeout(initializeButton, 500);
    }
  });

  urlObserver.observe(document, { subtree: true, childList: true });

  // Watch for player and controls to appear
  const playerObserver = new MutationObserver(() => {
    if (window.location.href.includes('/watch')) {
      const existingBtn = document.getElementById('yt-bookmark-btn');
      const existingFloatingBtn = document.getElementById('yt-bookmark-btn-floating');
      if (!existingBtn && !existingFloatingBtn) {
        // Check if player elements exist
        const hasPlayer = document.querySelector('#movie_player, video, .ytp-right-controls');
        if (hasPlayer) {
          tryInjectButton();
        }
      }
    }
  });

  // Observe the document for changes
  if (document.body) {
    playerObserver.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }

  // Also listen for YouTube's navigation events
  window.addEventListener('yt-navigate-start', () => {
    const existingBtn = document.getElementById('yt-bookmark-btn');
    const existingFloatingBtn = document.getElementById('yt-bookmark-btn-floating');
    if (existingBtn) {
      existingBtn.remove();
    }
    if (existingFloatingBtn) {
      existingFloatingBtn.remove();
    }
  });

  window.addEventListener('yt-navigate-finish', () => {
    if (window.location.href.includes('/watch')) {
      retryCount = 0;
      setTimeout(initializeButton, 1000);
    }
  });

  // Ensure floating button is always present - watch for removal and re-inject
  const buttonPersistenceObserver = new MutationObserver(() => {
    if (window.location.href.includes('/watch')) {
      const floatingBtn = document.getElementById('yt-bookmark-btn-floating');
      if (!floatingBtn && document.body) {
        console.log('🔄 Floating button missing, re-injecting...');
        injectBookmarkButton();
      }
    }
  });

  // Observe document body for changes (button removal)
  if (document.body) {
    buttonPersistenceObserver.observe(document.body, {
      childList: true,
      subtree: false // Only watch direct children of body for performance
    });
  }

  // Periodic check to ensure button is always present (backup safety)
  setInterval(() => {
    if (window.location.href.includes('/watch')) {
      const floatingBtn = document.getElementById('yt-bookmark-btn-floating');
      if (!floatingBtn && document.body) {
        console.log('🔄 Periodic check: Floating button missing, re-injecting...');
        injectBookmarkButton();
      }
    }
  }, 2000); // Check every 2 seconds

})();

