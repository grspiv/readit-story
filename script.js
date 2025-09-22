document.addEventListener('DOMContentLoaded', () => {
    try {
        // --- DOM Elements ---
        const fetchButton = document.getElementById('fetch-button');
        const subredditInput = document.getElementById('subreddit-input');
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const storyContainer = document.getElementById('story-container');
        const loadingIndicator = document.getElementById('loading-indicator');
        const popupOverlay = document.getElementById('popup-overlay');
        const popupTitle = document.getElementById('popup-title');
        const popupBody = document.getElementById('popup-body');
        const closePopupButton = document.getElementById('close-popup');
        const themeSelect = document.getElementById('theme-select');
        const backToTopButton = document.getElementById('back-to-top');
        const timeRangeControls = document.getElementById('time-range-controls');
        const timeRangeSelect = document.getElementById('time-range-select');
        const loadMoreButton = document.getElementById('load-more-button');
        const viewSavedButton = document.getElementById('view-saved-button');
        const storiesHeading = document.getElementById('stories-heading');
        const controlsSection = document.querySelector('.controls');

        // --- Constants & State ---
        const REDDIT_API_BASE_URL = 'https://www.reddit.com/r/';
        const SAVED_STORIES_KEY = 'redditStorytellerSaved';
        let currentAfterToken = null;
        let isShowingSaved = false;

        // --- Initialization ---
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
        fetchStories(subredditInput.value, 'hot', 'all', false);

        // --- Event Listeners ---
        themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
        fetchButton.addEventListener('click', handleFetchClick);
        loadMoreButton.addEventListener('click', handleLoadMoreClick);
        sortSelect.addEventListener('change', handleSortChange);
        viewSavedButton.addEventListener('click', handleViewSavedClick);
        closePopupButton.addEventListener('click', closePopup);
        popupOverlay.addEventListener('click', (e) => e.target === popupOverlay && closePopup());
        window.onscroll = handleScroll;
        backToTopButton.addEventListener('click', scrollToTop);

        // --- Functions ---
        function applyTheme(theme) {
            document.body.className = '';
            if (theme !== 'light') document.body.classList.add(theme);
            localStorage.setItem('theme', theme);
            themeSelect.value = theme;
        }

        function handleFetchClick() {
            const subreddit = subredditInput.value.trim();
            const sort = sortSelect.value;
            const timeRange = timeRangeSelect.value;
            const query = searchInput.value.trim();

            if (subreddit) {
                fetchStories(subreddit, sort, timeRange, false, query);
            } else {
                showErrorPopup("Please enter a subreddit name.");
            }
        }

        function handleLoadMoreClick() {
            const subreddit = subredditInput.value.trim();
            const sort = sortSelect.value;
            const timeRange = timeRangeSelect.value;
            const query = searchInput.value.trim();

            if (subreddit && currentAfterToken) {
                fetchStories(subreddit, sort, timeRange, true, query);
            }
        }

        function handleSortChange() {
            const isTop = sortSelect.value === 'top';
            const isSearch = searchInput.value.trim().length > 0;
            // Show time range for 'top' or for search results sorted by 'top'.
            timeRangeControls.style.display = isTop || (isSearch && sortSelect.value === 'top') ? 'flex' : 'none';
        }

        function handleViewSavedClick() {
            isShowingSaved = !isShowingSaved;
            if (isShowingSaved) {
                displaySavedStories();
                viewSavedButton.textContent = 'Back to Browsing';
                viewSavedButton.classList.add('active');
                controlsSection.style.display = 'none';
            } else {
                handleFetchClick(); // Re-fetch current subreddit
                viewSavedButton.textContent = 'Saved Stories';
                viewSavedButton.classList.remove('active');
                controlsSection.style.display = 'flex';
            }
        }

        function closePopup() {
            popupOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            // Stop video from playing in the background
            const video = popupBody.querySelector('video');
            if (video) video.pause();
        }

        function handleScroll() {
            const shouldShow = document.body.scrollTop > 100 || document.documentElement.scrollTop > 100;
            backToTopButton.style.display = shouldShow ? "flex" : "none";
        }

        function scrollToTop() {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }

        function showLoading(show, isLoadMore) {
            if (isLoadMore) {
                loadingIndicator.style.display = 'none';
                if (show) loadMoreButton.classList.add('pulse-active');
                else loadMoreButton.classList.remove('pulse-active');
            } else {
                loadingIndicator.style.display = show ? 'flex' : 'none';
                if (show) fetchButton.classList.add('pulse-active');
                else fetchButton.classList.remove('pulse-active');
            }
        }

        async function fetchStories(subreddit, sort, timeRange = 'all', loadMore = false, query = '') {
            showLoading(true, loadMore);
            if (!loadMore) {
                storyContainer.innerHTML = '';
                currentAfterToken = null;
            }
            loadMoreButton.style.display = 'none';
            
            storiesHeading.textContent = query ? `Searching for "${query}" in r/${subreddit}` : `Showing stories from r/${subreddit}`;
            
            let redditUrl;
            if (query) {
                redditUrl = `${REDDIT_API_BASE_URL}${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=${sort}&t=${timeRange}&restrict_sr=on&limit=25`;
            } else {
                redditUrl = `${REDDIT_API_BASE_URL}${subreddit}/${sort}.json?limit=25&t=${timeRange}`;
            }

            if (loadMore && currentAfterToken) {
                redditUrl += `&after=${currentAfterToken}`;
            }

            try {
                const response = await fetch(redditUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const posts = data.data.children;
                currentAfterToken = data.data.after;

                if (posts.length === 0 && !loadMore) {
                    storyContainer.innerHTML = `<p>No stories found. Please try a different search or subreddit.</p>`;
                } else {
                    displayStories(posts.map(p => p.data));
                }
            } catch (error) {
                console.error("Failed to fetch stories:", error);
                showErrorPopup(`Could not fetch stories. ${error.message}`);
            } finally {
                showLoading(false, loadMore);
                if (currentAfterToken && !isShowingSaved) {
                    loadMoreButton.style.display = 'block';
                }
            }
        }

        async function fetchAndShowComments(story) {
            popupTitle.textContent = story.title;
            document.body.style.overflow = 'hidden';
            popupOverlay.classList.add('active');
            popupBody.innerHTML = `<div class="spinner"></div><p class="loading-message">Loading story...</p>`;

            let finalContent = createMediaElement(story, true);
            if (story.selftext) {
                finalContent += `<p>${story.selftext.replace(/\n/g, '<br>')}</p>`;
            }

            try {
                const commentsUrl = `${REDDIT_API_BASE_URL}${story.subreddit}/comments/${story.id}.json`;
                const response = await fetch(commentsUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const comments = data[1].data.children.slice(0, 10);

                finalContent += `<hr>`;
                if (comments.length > 0) {
                    finalContent += `<h4>Top Comments:</h4>`;
                    finalContent += comments.map(c => c.data).filter(c => c.body).map(c => `
                        <div class="comment-card">
                            <p class="comment-author">u/${c.author}</p>
                            <p class="comment-body">${c.body.replace(/\n/g, '<br>')}</p>
                        </div>`
                    ).join('');
                } else {
                    finalContent += `<p>No comments found.</p>`;
                }
            } catch (error) {
                console.error("Failed to fetch comments:", error);
                finalContent += `<p>Could not load comments.</p>`;
            }
            
            popupBody.innerHTML = finalContent;
        }

        function displayStories(stories) {
            stories.forEach(story => {
                const storyCard = document.createElement('div');
                storyCard.className = 'story-card';

                const isSaved = isStorySaved(story.id);

                storyCard.innerHTML = `
                    ${createMediaElement(story, false)}
                    <div class="story-card-content">
                        <div class="story-meta">
                            <span><svg viewBox="0 0 24 24"><path d="M12 2L2 12h5v10h10V12h5L12 2z"/></svg>${story.score.toLocaleString()}</span>
                            <span><svg viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>${story.num_comments.toLocaleString()}</span>
                        </div>
                        <h3>${story.title}</h3>
                        <p class="author">by u/${story.author}</p>
                        <p class="preview">${story.selftext ? story.selftext.substring(0, 150) + '...' : ''}</p>
                        <div class="story-card-actions">
                            <button class="read-button">Read Story</button>
                            <button class="save-button ${isSaved ? 'saved' : ''}">${isSaved ? 'Saved' : 'Save'}</button>
                        </div>
                    </div>`;

                storyCard.querySelector('.read-button').addEventListener('click', () => fetchAndShowComments(story));
                storyCard.querySelector('.save-button').addEventListener('click', (e) => toggleSaveStory(e, story));
                
                storyContainer.appendChild(storyCard);
            });
        }
        
        function createMediaElement(story, isPopup) {
            const commonAttrs = isPopup ? 'controls autoplay' : 'controls muted loop playsinline';
            if (story.post_hint === 'image') {
                return `<div class="${isPopup ? 'popup' : 'story-card'}-media"><img src="${story.url}" alt="${story.title}"></div>`;
            } else if (story.is_video && story.media?.reddit_video) {
                return `<div class="${isPopup ? 'popup' : 'story-card'}-media"><video ${commonAttrs} poster="${story.thumbnail}"><source src="${story.media.reddit_video.fallback_url}" type="video/mp4"></video></div>`;
            }
            return '';
        }

        // --- Saved Stories Functions ---
        function toggleSaveStory(event, story) {
            const button = event.target;
            const savedStories = getSavedStories();
            const storyIndex = savedStories.findIndex(s => s.id === story.id);

            if (storyIndex > -1) {
                savedStories.splice(storyIndex, 1);
                button.textContent = 'Save';
                button.classList.remove('saved');
            } else {
                savedStories.push(story);
                button.textContent = 'Saved';
                button.classList.add('saved');
            }
            localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(savedStories));
            if (isShowingSaved) displaySavedStories(); // Refresh view if on saved page
        }
        
        function getSavedStories() {
            return JSON.parse(localStorage.getItem(SAVED_STORIES_KEY)) || [];
        }

        function isStorySaved(storyId) {
            return getSavedStories().some(s => s.id === storyId);
        }

        function displaySavedStories() {
            storyContainer.innerHTML = '';
            loadMoreButton.style.display = 'none';
            const savedStories = getSavedStories();
            storiesHeading.textContent = `You have ${savedStories.length} saved stor${savedStories.length === 1 ? 'y' : 'ies'}`;
            if (savedStories.length > 0) {
                displayStories(savedStories);
            } else {
                storyContainer.innerHTML = `<p>You haven't saved any stories yet.</p>`;
            }
        }

    } catch (e) {
        console.error("An error occurred during page initialization:", e);
        document.body.innerHTML = "<h1>A critical error occurred. Please refresh the page.</h1>";
    }
});

