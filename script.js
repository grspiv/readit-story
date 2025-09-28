window.addEventListener('load', () => {
    try {
        // --- DOM Elements ---
        const searchForm = document.getElementById('search-form');
        const fetchButton = document.getElementById('fetch-button');
        const randomButton = document.getElementById('random-button');
        const surpriseButton = document.getElementById('surprise-button');
        const subredditInput = document.getElementById('subreddit-input');
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const storyContainer = document.getElementById('story-container');
        const loadingIndicator = document.getElementById('loading-indicator');
        const popupOverlay = document.getElementById('popup-overlay');
        const popupTitle = document.getElementById('popup-title');
        const popupControls = document.querySelector('.popup-controls');
        const popupBody = document.getElementById('popup-body');
        const closePopupButton = document.getElementById('close-popup');
        const themeSelect = document.getElementById('theme-select');
        const backToTopButton = document.getElementById('back-to-top');
        const timeRangeControls = document.getElementById('time-range-controls');
        const timeRangeSelect = document.getElementById('time-range-select');
        const viewSavedButton = document.getElementById('view-saved-button');
        const viewHistoryButton = document.getElementById('view-history-button');
        const storiesHeading = document.getElementById('stories-heading');
        const controlsContainer = document.getElementById('controls-container');
        const clearSavedButton = document.getElementById('clear-saved-button');
        const exportSavedButton = document.getElementById('export-saved-button');
        const importSavedButton = document.getElementById('import-saved-button');
        const importFileInput = document.getElementById('import-file-input');
        const flairFilterInput = document.getElementById('flair-filter-input');
        const minScoreInput = document.getElementById('min-score-input');
        const minCommentsInput = document.getElementById('min-comments-input');
        const savedSortSelect = document.getElementById('saved-sort-select');
        const historySortSelect = document.getElementById('history-sort-select');
        const toastNotification = document.getElementById('toast-notification');
        const layoutSelect = document.getElementById('layout-select');
        const galleryToggleButton = document.getElementById('gallery-toggle-button');
        const nsfwToggle = document.getElementById('nsfw-toggle');
        const infiniteScrollLoader = document.getElementById('infinite-scroll-loader');
        const subredditInfoPanel = document.getElementById('subreddit-info-panel');
        const clearSearchButton = document.getElementById('clear-search-button');
        const galleryPrevButton = document.getElementById('gallery-prev');
        const galleryNextButton = document.getElementById('gallery-next');
        const readingProgressBar = document.getElementById('reading-progress-bar');
        const seriesNavigation = document.getElementById('series-navigation');
        const userProfileOverlay = document.getElementById('user-profile-overlay');
        const userProfileTitle = document.getElementById('user-profile-title');
        const userProfileBody = document.getElementById('user-profile-body');
        const closeUserProfilePopup = document.getElementById('close-user-profile-popup');
        const toggleFiltersButton = document.getElementById('toggle-filters-button');
        const advancedFilters = document.getElementById('advanced-filters');
        const savedSearchInput = document.getElementById('saved-search-input');
        const historySearchInput = document.getElementById('history-search-input');
        const jumpToNav = document.getElementById('jump-to-nav');
        const collapseCommentsToggle = document.getElementById('collapse-comments-toggle');
        const savedStoryNotesContainer = document.getElementById('saved-story-notes-container');
        const savedStoryNotes = document.getElementById('saved-story-notes');
        const markAllReadButton = document.getElementById('mark-all-read-button');
        const commentNavigator = document.getElementById('comment-navigator');
        const wordCloudOverlay = document.getElementById('word-cloud-overlay');
        const closeWordCloudPopup = document.getElementById('close-word-cloud-popup');
        const wordCloudContainer = document.getElementById('word-cloud-container');
        const savedTagsFilter = document.getElementById('saved-tags-filter');
        const tagsContainer = document.getElementById('tags-container');
        const savedStoryTagsContainer = document.getElementById('saved-story-tags-container');
        const storyTags = document.getElementById('story-tags');
        const addTagInput = document.getElementById('add-tag-input');
        const quickLookPopup = document.getElementById('quick-look-popup');
        const apiKeyOverlay = document.getElementById('api-key-overlay');
        const closeApiKeyPopup = document.getElementById('close-api-key-popup');
        const saveApiKeyButton = document.getElementById('save-api-key-button');
        const apiKeyInput = document.getElementById('api-key-input');
        const savedStoriesView = document.getElementById('saved-stories-view');
        const historyView = document.getElementById('history-view');
        const clearHistoryButton = document.getElementById('clear-history-button');


        // --- Constants & State ---
        const REDDIT_BASE_URL = 'https://www.reddit.com/';
        const SAVED_STORIES_KEY = 'redditStorytellerSaved';
        const READ_HISTORY_KEY = 'redditStorytellerHistory';
        const SUBREDDIT_HISTORY_KEY = 'redditSubredditHistory';
        const LAYOUT_PREFERENCE_KEY = 'redditStorytellerLayout';
        const GALLERY_PREFERENCE_KEY = 'redditStorytellerGallery';
        const NSFW_PREFERENCE_KEY = 'redditStorytellerNSFW';
        const READING_SETTINGS_KEY = 'redditStorytellerReading';
        const COLLAPSE_COMMENTS_KEY = 'redditStorytellerCollapseComments';
        const STORY_NOTES_KEY = 'redditStorytellerNotes';
        const READING_POSITION_KEY = 'redditStorytellerReadingPosition';
        const RANDOM_SUBREDDITS = ['nosleep', 'LetsNotMeet', 'glitch_in_the_matrix', 'tifu', 'confession', 'maliciouscompliance', 'talesfromtechsupport', 'WritingPrompts', 'shortscarystories', 'UnresolvedMysteries', 'ProRevenge', 'IDontWorkHereLady', 'talesfromretail', 'pettyrevenge', 'entitledparents'];
        
        // --- OPTIMIZATION: API Caching ---
        const apiCache = new Map();
        const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

        let currentView = 'browsing';
        let currentAfterToken = null;
        let allFetchedPosts = [];
        let currentSearchQuery = '';
        let isLoadingMore = false;
        let currentStoryId = null;
        let currentUtterance = null;
        let currentSeries = { parts: [], currentIndex: -1 };
        let topLevelComments = [];
        let currentCommentIndex = -1;
        let liveCommentsInterval = null;
        let activeTagFilter = null;
        let quickLookTimeout = null;
        let apiKeyPromiseResolve = null;
        let apiKeyPromiseReject = null;
        let originalStoryContent = null;
        let currentStorySummary = null;
        let currentStoryELI5 = null;
        let currentStoryTranslations = {};
        let sentimentCache = {};
        
        let audioContext;
        let audioBufferQueue = [];
        let nextScheduleTime = 0;
        let isNarrationPlaying = false;
        let isNarrationPaused = false;
        let activeSourceNodes = [];
        let narrationAudioCache = {};


        // --- Initialization ---
        const savedTheme = localStorage.getItem('theme') || 'light';
        const savedLayout = localStorage.getItem(LAYOUT_PREFERENCE_KEY) || 'grid';
        const savedNSFWPreference = localStorage.getItem(NSFW_PREFERENCE_KEY) === 'true';
        const savedCollapseComments = localStorage.getItem(COLLAPSE_COMMENTS_KEY) === 'true';
        
        applyTheme(savedTheme);
        applyLayout(savedLayout);
        applyNSFWPreference(savedNSFWPreference);
        applyReadingSettings();
        populateSubredditHistory();
        applyCollapseCommentsPreference(savedCollapseComments);
        
        const initialSubreddit = RANDOM_SUBREDDITS[Math.floor(Math.random() * RANDOM_SUBREDDITS.length)];
        subredditInput.value = initialSubreddit;
        fetchStories(initialSubreddit, 'hot', 'all', false);

        // --- Event Listeners ---
        themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
        layoutSelect.addEventListener('change', () => applyLayout(layoutSelect.value));
        galleryToggleButton.addEventListener('click', handleGalleryToggle);
        nsfwToggle.addEventListener('change', () => applyNSFWPreference(nsfwToggle.checked, true));
        searchForm.addEventListener('submit', (e) => { e.preventDefault(); switchToView('browsing', { refresh: true }); });
        randomButton.addEventListener('click', handleRandomClick);
        surpriseButton.addEventListener('click', handleSurpriseClick);
        sortSelect.addEventListener('change', handleSortChange);
        viewSavedButton.addEventListener('click', () => switchToView('saved'));
        viewHistoryButton.addEventListener('click', () => switchToView('history'));
        if(clearSavedButton) clearSavedButton.addEventListener('click', handleClearSaved);
        if(clearHistoryButton) clearHistoryButton.addEventListener('click', handleClearHistory);
        if(exportSavedButton) exportSavedButton.addEventListener('click', handleExportSaved);
        if(importSavedButton) importSavedButton.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', handleImportFile);
        savedSortSelect.addEventListener('change', displaySavedStories);
        historySortSelect.addEventListener('change', displayHistory);
        savedSearchInput.addEventListener('input', displaySavedStories);
        historySearchInput.addEventListener('input', displayHistory);
        flairFilterInput.addEventListener('input', () => renderFilteredStories());
        minScoreInput.addEventListener('input', () => renderFilteredStories());
        minCommentsInput.addEventListener('input', () => renderFilteredStories());
        searchInput.addEventListener('input', () => { clearSearchButton.style.display = searchInput.value ? 'block' : 'none'; });
        clearSearchButton.addEventListener('click', () => { searchInput.value = ''; clearSearchButton.style.display = 'none'; });
        galleryPrevButton.addEventListener('click', () => navigateGallery(-1));
        galleryNextButton.addEventListener('click', () => navigateGallery(1));
        closePopupButton.addEventListener('click', closePopup);
        popupOverlay.addEventListener('click', (e) => e.target === popupOverlay && closePopup());
        closeUserProfilePopup.addEventListener('click', closeUserProfilePopupHandler);
        userProfileOverlay.addEventListener('click', (e) => e.target === userProfileOverlay && closeUserProfilePopupHandler());
        closeWordCloudPopup.addEventListener('click', () => wordCloudOverlay.classList.remove('active'));
        wordCloudOverlay.addEventListener('click', (e) => e.target === wordCloudOverlay && wordCloudOverlay.classList.remove('active'));
        window.addEventListener('scroll', handleScroll);
        backToTopButton.addEventListener('click', scrollToTop);
        document.addEventListener('keydown', handleKeyboardNav);
        popupBody.addEventListener('click', handlePopupBodyClick);
        popupBody.addEventListener('scroll', debounce(handlePopupScroll, 100));
        toggleFiltersButton.addEventListener('click', () => { advancedFilters.classList.toggle('open'); toggleFiltersButton.classList.toggle('active'); });
        collapseCommentsToggle.addEventListener('change', () => applyCollapseCommentsPreference(collapseCommentsToggle.checked, true));
        savedStoryNotes.addEventListener('input', debounce(saveStoryNote, 500));
        markAllReadButton.addEventListener('click', handleMarkAllRead);
        addTagInput.addEventListener('keydown', handleAddTag);
        storyContainer.addEventListener('click', handleStoryContainerClick);
        const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (isDesktop) {
            storyContainer.addEventListener('mouseover', handleQuickLook);
            storyContainer.addEventListener('mouseout', hideQuickLook);
            storyContainer.addEventListener('mousemove', (e) => { if (quickLookPopup.classList.contains('visible')) { positionQuickLook(e); } });
        }
        closeApiKeyPopup.addEventListener('click', () => hideApiKeyModal(true));
        saveApiKeyButton.addEventListener('click', handleSaveApiKey);


        document.body.classList.add('loaded');


        // --- OPTIMIZATION: New Caching Function ---
        /**
         * A wrapper around the fetch API that caches results in memory.
         * @param {string} url The URL to fetch.
         * @param {number} cacheDuration The time in milliseconds to cache the result.
         * @returns {Promise<any>} A promise that resolves with the JSON data.
         */
        async function fetchWithCache(url, cacheDuration = CACHE_DURATION_MS) {
            const cached = apiCache.get(url);
            if (cached && (Date.now() - cached.timestamp < cacheDuration)) {
                return JSON.parse(cached.data); // Return a copy to prevent mutation
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            apiCache.set(url, {
                data: JSON.stringify(data), // Store as string to prevent mutation
                timestamp: Date.now()
            });
            return data;
        }

        // --- Main View Controller ---
        function switchToView(view, options = {}) {
            if (view === currentView && view !== 'browsing') {
                switchToView('browsing');
                return;
            }

            currentView = view;
            activeTagFilter = null;
            window.scrollTo({ top: 0, behavior: 'smooth' });

            [controlsContainer, savedStoriesView, historyView, subredditInfoPanel, markAllReadButton].forEach(el => {
                if(el) el.style.display = 'none';
            });
            [viewSavedButton, viewHistoryButton].forEach(btn => btn.classList.remove('active'));
            
            viewSavedButton.textContent = 'Saved Stories';
            viewHistoryButton.textContent = 'History';

            if (view === 'browsing') {
                if(controlsContainer) controlsContainer.style.display = 'block';
                if(markAllReadButton) markAllReadButton.style.display = 'flex';
                
                if (options && options.refresh) {
                    const subreddit = sanitizeSubredditInput(subredditInput.value);
                    subredditInput.value = subreddit;
                    
                    const sort = sortSelect.value;
                    const timeRange = timeRangeSelect.value;
                    currentSearchQuery = searchInput.value.trim();
                    if (subreddit) {
                        fetchStories(subreddit, sort, timeRange, false, currentSearchQuery);
                    } else {
                        showErrorPopup("Please enter a subreddit name.");
                    }
                } else {
                    storyContainer.innerHTML = '';
                    displayStories(allFetchedPosts);
                    renderFilteredStories();
                    const query = searchInput.value.trim();
                    storiesHeading.textContent = query ? `Searching for "${query}" in r/${subredditInput.value}` : `Showing stories from r/${subredditInput.value}`;
                    
                    const isMultiReddit = subredditInput.value.includes('+');
                    const isSearch = query.length > 0;

                    if (!isSearch) {
                         subredditInfoPanel.style.display = 'flex';
                    } else {
                         subredditInfoPanel.style.display = 'none';
                    }
                }
            } else if (view === 'saved') {
                if(savedStoriesView) savedStoriesView.style.display = 'block';
                viewSavedButton.textContent = 'Back to Browsing';
                viewSavedButton.classList.add('active');
                displaySavedStories();
            } else if (view === 'history') {
                if(historyView) historyView.style.display = 'block';
                viewHistoryButton.textContent = 'Back to Browsing';
                viewHistoryButton.classList.add('active');
                displayHistory();
            }
        }

        // --- Functions ---
        function sanitizeSubredditInput(input) {
            if (!input) return '';
            return input.trim().split('+').map(s => s.trim()).filter(Boolean).join('+');
        }

        function applyTheme(theme) {
            document.body.classList.remove('dark', 'sepia', 'slate', 'forest', 'solarized-light', 'dracula', 'kaydoh', 'kizzie');
            if (theme !== 'light') document.body.classList.add(theme);
            localStorage.setItem('theme', theme);
            themeSelect.value = theme;
        }
        
        function applyLayout(layout) {
            storyContainer.classList.remove('grid-view', 'list-view', 'classic-view');
            storyContainer.classList.add(`${layout}-view`);
            localStorage.setItem(LAYOUT_PREFERENCE_KEY, layout);
            layoutSelect.value = layout;
        }

        function applyGalleryPreference(isGallery) {
             if (isGallery) {
                storyContainer.classList.add('gallery-view');
                galleryToggleButton.classList.add('active');
            } else {
                storyContainer.classList.remove('gallery-view');
                galleryToggleButton.classList.remove('active');
            }
        }

        function applyNSFWPreference(isBlurred, shouldRender = false) {
            nsfwToggle.checked = isBlurred;
            localStorage.setItem(NSFW_PREFERENCE_KEY, isBlurred);
            if (shouldRender) renderFilteredStories();
        }

        function applyCollapseCommentsPreference(shouldCollapse, shouldRender = false) {
            collapseCommentsToggle.checked = shouldCollapse;
            localStorage.setItem(COLLAPSE_COMMENTS_KEY, shouldCollapse);
            if (shouldRender && popupOverlay.classList.contains('active')) {
                const commentsContainer = document.getElementById('comment-section');
                if (commentsContainer) {
                    commentsContainer.querySelectorAll('.comment-card').forEach(card => {
                        const collapseButton = card.querySelector('.collapse-comment');
                        if (shouldCollapse) {
                            card.classList.add('collapsed');
                            if(collapseButton) collapseButton.textContent = '[+]';
                        } else {
                            card.classList.remove('collapsed');
                            if(collapseButton) collapseButton.textContent = '[–]';
                        }
                    });
                }
            }
        }
        
        function handleGalleryToggle() {
            const isGallery = storyContainer.classList.toggle('gallery-view');
            galleryToggleButton.classList.toggle('active');
            localStorage.setItem(GALLERY_PREFERENCE_KEY, isGallery);
        }

        function handleRandomClick() {
            const randomSub = RANDOM_SUBREDDITS[Math.floor(Math.random() * RANDOM_SUBREDDITS.length)];
            subredditInput.value = randomSub;
            searchInput.value = '';
            if (toggleFiltersButton.offsetParent !== null) {
                advancedFilters.classList.remove('open');
                toggleFiltersButton.classList.remove('active');
            }
            switchToView('browsing', { refresh: true });
        }

        async function handleSurpriseClick() {
            showToast('Finding a great story for you...');
            surpriseButton.disabled = true;
            surpriseButton.classList.add('pulse-active');
            if (toggleFiltersButton.offsetParent !== null) {
                advancedFilters.classList.remove('open');
                toggleFiltersButton.classList.remove('active');
            }

            const randomSub = RANDOM_SUBREDDITS[Math.floor(Math.random() * RANDOM_SUBREDDITS.length)];
            const url = `${REDDIT_BASE_URL}r/${randomSub}/top.json?t=year&limit=50`;

            try {
                const data = await fetchWithCache(url);
                const stories = data.data.children.map(p => p.data).filter(p => p.selftext);

                if (stories.length === 0) throw new Error(`No text-based stories found in r/${randomSub}.`);

                const randomStory = stories[Math.floor(Math.random() * stories.length)];
                if (!allFetchedPosts.some(p => p.id === randomStory.id)) {
                    allFetchedPosts.push(randomStory);
                }
                fetchAndShowComments(randomStory);
            } catch (error) {
                console.error("Surprise Me Error:", error);
                showErrorPopup(error.message || "Failed to find a story. Please try again.");
            } finally {
                surpriseButton.disabled = false;
                surpriseButton.classList.remove('pulse-active');
            }
        }

        function handleLoadMore() {
            const subreddit = sanitizeSubredditInput(subredditInput.value);
            const sort = sortSelect.value;
            const timeRange = timeRangeSelect.value;
            if (subreddit && currentAfterToken) {
                fetchStories(subreddit, sort, timeRange, true, currentSearchQuery);
            }
        }

        function handleSortChange() {
            const isTop = sortSelect.value === 'top';
            const isSearch = searchInput.value.trim().length > 0;
            timeRangeControls.style.display = isTop || (isSearch && sortSelect.value === 'top') ? 'flex' : 'none';
        }

        function stopNarration() {
            isNarrationPlaying = false;
            isNarrationPaused = false;
            activeSourceNodes.forEach(source => { try { source.stop(); } catch(e) {} });
            activeSourceNodes = [];
            audioBufferQueue = [];
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
                audioContext = null;
            }
            const narrateButton = document.getElementById('narrate-button');
            const stopButton = document.getElementById('stop-narration-button');
            if (narrateButton) {
                narrateButton.textContent = 'Narrate Story';
                narrateButton.disabled = false;
            }
            if (stopButton) stopButton.style.display = 'none';
        }

        function closePopup() {
            saveReadingPosition();
            stopNarration(); 
            if (liveCommentsInterval) {
                clearInterval(liveCommentsInterval);
                liveCommentsInterval = null;
            }
            popupOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            const video = popupBody.querySelector('video');
            if (video) video.pause();
            galleryPrevButton.style.display = 'none';
            galleryNextButton.style.display = 'none';
            currentStoryId = null;
            originalStoryContent = null;
            currentStorySummary = null;
            currentStoryELI5 = null;
            currentStoryTranslations = {};
            narrationAudioCache = {}; 
        }

        function handleScroll() {
            backToTopButton.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ? "flex" : "none";
            if (!isLoadingMore && currentView === 'browsing' && currentAfterToken) {
                 if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                    handleLoadMore();
                }
            }
        }

        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        function showErrorPopup(message) {
            popupTitle.textContent = "Error";
            popupBody.innerHTML = `<p>${message}</p>`;
            popupControls.innerHTML = '';
            popupOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        function showToast(message) {
            toastNotification.textContent = message;
            toastNotification.classList.add('show');
            setTimeout(() => {
                toastNotification.classList.remove('show');
            }, 2500);
        }

        function showLoading(show, isLoadMore) {
            if (isLoadMore) {
                infiniteScrollLoader.style.display = show ? 'flex' : 'none';
            } else {
                loadingIndicator.style.display = show ? 'flex' : 'none';
            }
        }

        async function fetchSubredditInfo(subreddit) {
            try {
                const data = await fetchWithCache(`${REDDIT_BASE_URL}r/${subreddit}/about.json`);
                const info = data.data;
                const fullDescription = info.public_description || '';
                const match = /[.!?](?=\s|$)/.exec(fullDescription);
                let firstSentenceIndex = match ? match.index : -1;
                const isTruncated = firstSentenceIndex !== -1 && fullDescription.length > firstSentenceIndex + 2;
                
                let descriptionHTML = '';
                if (isTruncated) {
                    const firstSentence = fullDescription.substring(0, firstSentenceIndex + 1);
                    const restOfDescription = fullDescription.substring(firstSentenceIndex + 1).trim();
                    descriptionHTML = `<p class="subreddit-description">${renderMarkdown(firstSentence)}<span id="more-description-content" style="display: none;"> ${renderMarkdown(restOfDescription)}</span></p><button id="toggle-description-button" class="action-button secondary small">Show More</button>`;
                } else {
                    descriptionHTML = `<p class="subreddit-description">${renderMarkdown(fullDescription)}</p>`;
                }
        
                subredditInfoPanel.innerHTML = `<img src="${info.community_icon || info.icon_img || 'https://placehold.co/60x60/e74c3c/fff?text=R'}" alt="Subreddit Icon" class="subreddit-icon"><div class="subreddit-details"><div class="subreddit-info-header"><h3 class="subreddit-title">${info.display_name_prefixed}</h3><span class="subreddit-stats">${(info.subscribers || 0).toLocaleString()} members</span></div><div class="subreddit-description-container">${descriptionHTML}</div></div>`;
        
                if (isTruncated) {
                    const toggleButton = subredditInfoPanel.querySelector('#toggle-description-button');
                    const moreContentSpan = subredditInfoPanel.querySelector('#more-description-content');
                    if (toggleButton && moreContentSpan) {
                        toggleButton.addEventListener('click', () => {
                            const isHidden = moreContentSpan.style.display === 'none';
                            moreContentSpan.style.display = isHidden ? 'inline' : 'none';
                            toggleButton.textContent = isHidden ? 'Show Less' : 'Show More';
                        });
                    }
                }
                subredditInfoPanel.style.display = 'flex';
                subredditInfoPanel.style.flexWrap = 'nowrap';
            } catch (error) {
                console.error("Failed to display subreddit info:", error);
                subredditInfoPanel.style.display = 'none';
            }
        }

        async function fetchMultiSubredditInfo(subreddits) {
            subredditInfoPanel.innerHTML = '';
            subredditInfoPanel.style.display = 'flex';
            subredditInfoPanel.style.flexWrap = 'wrap'; 
            subredditInfoPanel.style.gap = '15px'; 

            const promises = subreddits.map(sub => fetchWithCache(`${REDDIT_BASE_URL}r/${sub}/about.json`).catch(() => null));

            try {
                const results = await Promise.all(promises);
                const infos = results.filter(Boolean).map(data => data.data);

                if (infos.length === 0) {
                    subredditInfoPanel.style.display = 'none';
                    return;
                }

                subredditInfoPanel.innerHTML = infos.map(info => `<div class="multi-subreddit-item"><img src="${info.community_icon || info.icon_img || 'https://placehold.co/40x40/e74c3c/fff?text=R'}" alt="${info.display_name_prefixed} Icon" class="subreddit-icon-small"><div class="multi-subreddit-details"><a href="#" data-subreddit="${info.display_name}" class="multi-subreddit-link">${info.display_name_prefixed}</a><span class="subreddit-stats-small">${(info.subscribers || 0).toLocaleString()} members</span></div></div>`).join('');
                
                subredditInfoPanel.querySelectorAll('.multi-subreddit-link').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        subredditInput.value = e.target.dataset.subreddit;
                        switchToView('browsing', { refresh: true });
                    });
                });

            } catch (error) {
                console.error("Failed to fetch multi-subreddit info:", error);
                subredditInfoPanel.style.display = 'none';
            }
        }

        async function fetchStories(subreddit, sort, timeRange = 'all', loadMore = false, query = '') {
            if (isLoadingMore) return;
            isLoadingMore = true;

            if (!loadMore) {
                scrollToTop();
                allFetchedPosts = [];
                currentAfterToken = null;
                storyContainer.innerHTML = '';
                const isMultiReddit = subreddit.includes('+');
                if (!isMultiReddit && !query.toLowerCase().startsWith('author:')) saveSubredditToHistory(subreddit);
                
                if (query) {
                    subredditInfoPanel.style.display = 'none';
                } else {
                    isMultiReddit ? fetchMultiSubredditInfo(subreddit.split('+').filter(Boolean)) : fetchSubredditInfo(subreddit);
                }
            }
            
            showLoading(true, loadMore);
            storiesHeading.textContent = query ? `Searching for "${query}" in r/${subreddit}` : `Showing stories from r/${subreddit}`;
            
            const isMultiReddit = subreddit.includes('+');

            if (isMultiReddit && !query && !loadMore) {
                currentAfterToken = null;
                showToast("Infinite scroll is disabled for multireddit view.");
                try {
                    const subreddits = sanitizeSubredditInput(subreddit).split('+');
                    const promises = subreddits.map(sub => {
                        const url = `${REDDIT_BASE_URL}r/${sub}/${sort}.json?limit=50&t=${timeRange}`;
                        return fetch(url).then(res => res.ok ? res.json() : null);
                    });
                    const results = await Promise.all(promises);
                    let combinedPosts = [];
                    results.forEach(result => {
                        if (result?.data?.children) {
                            combinedPosts = combinedPosts.concat(result.data.children.map(p => p.data));
                        }
                    });
                    if (combinedPosts.length === 0) throw new Error("No posts found in the specified subreddits.");
                    
                    combinedPosts.sort((a, b) => sort === 'new' ? b.created_utc - a.created_utc : b.score - a.score);

                    allFetchedPosts = Array.from(new Map(combinedPosts.map(post => [post.id, post])).values());
                    displayStories(allFetchedPosts);
                    renderFilteredStories();
                } catch (error) {
                    console.error("Failed to fetch multireddit stories:", error);
                    showErrorPopup(`Could not fetch stories. ${error.message}`);
                    storyContainer.innerHTML = '';
                } finally {
                    showLoading(false, false);
                    isLoadingMore = false;
                }
                return;
            }

            let redditUrl = query
                ? `${REDDIT_BASE_URL}r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=${sort}&t=${timeRange}&restrict_sr=on&limit=25`
                : `${REDDIT_BASE_URL}r/${subreddit}/${sort}.json?limit=25&t=${timeRange}`;
            if (loadMore && currentAfterToken) redditUrl += `&after=${currentAfterToken}`;

            try {
                const response = await fetch(redditUrl);
                if (!response.ok) throw new Error(`Failed to fetch`);
                const data = await response.json();
                const newPosts = data.data.children.map(p => p.data);
                allFetchedPosts = allFetchedPosts.concat(newPosts);
                currentAfterToken = data.data.after;
                displayStories(newPosts);
                renderFilteredStories();
            } catch (error) {
                console.error("Failed to fetch stories:", error);
                showErrorPopup(`Could not fetch stories. The subreddit might be private, banned, or misspelled. ${error.message}`);
                storyContainer.innerHTML = '';
            } finally {
                showLoading(false, loadMore);
                isLoadingMore = false;
            }
        }
        
        async function fetchAndShowComments(story) {
            closePopup();
            popupBody.innerHTML = '';
            currentStoryId = story.id;
            addStoryToHistory(story);
            const storyCard = storyContainer.querySelector(`.story-card[data-story-id="${story.id}"]`);
            if(storyCard) storyCard.classList.add('read');

            const popupSubredditLink = document.getElementById('popup-subreddit-link');
            popupSubredditLink.innerHTML = `<a href="#">${story.subreddit_name_prefixed}</a>`;
            popupSubredditLink.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                closePopup();
                subredditInput.value = story.subreddit;
                switchToView('browsing', { refresh: true });
            });

            popupTitle.textContent = story.title;
            const header = popupTitle.parentElement.parentElement;
            
            jumpToNav.innerHTML = `
                <button id="jump-to-story">Jump to Story</button>
                <button id="jump-to-comments">Jump to Comments</button>
            `;
            document.getElementById('jump-to-story').addEventListener('click', () => {
                const storyContent = popupBody.querySelector('#story-content-wrapper');
                if (storyContent) storyContent.scrollIntoView({ behavior: 'smooth' });
            });
            document.getElementById('jump-to-comments').addEventListener('click', () => {
                const commentSection = popupBody.querySelector('#comment-section');
                if (commentSection) commentSection.scrollIntoView({ behavior: 'smooth' });
            });
            
            popupControls.innerHTML = `
                <div class="popup-main-actions">
                    <button id="summarize-button" class="action-button secondary">Summarize</button>
                    <button id="eli5-button" class="action-button secondary">ELI5</button>
                    ${story.subreddit.toLowerCase() === 'writingprompts' ? '<button id="continue-story-button" class="action-button secondary">Continue Story</button>' : ''}
                    <button id="word-cloud-button" class="action-button secondary">Word Cloud</button>
                    <div class="narration-controls">
                        <button id="narrate-button" class="action-button secondary">Narrate Story</button>
                        <button id="stop-narration-button" class="action-button danger" style="display:none;">Stop</button>
                    </div>
                </div>
                <div class="popup-secondary-controls">
                     <div class="narration-options">
                        <label for="narration-speed-select">Speed:</label>
                        <select id="narration-speed-select" class="dropdown-input">
                            <option value="0.75">0.75x</option>
                            <option value="1" selected>1x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2x</option>
                        </select>
                     </div>
                     <div class="translation-controls">
                        <label for="translation-select">Translate:</label>
                        <select id="translation-select" class="dropdown-input">
                            <option value="">Original</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Mandarin Chinese">Mandarin Chinese</option>
                        </select>
                    </div>
                     <div class="reading-controls">
                        <span>Font Size:</span>
                        <button id="font-size-down" class="icon-button" title="Decrease Font Size" aria-label="Decrease font size">A-</button>
                        <button id="font-size-up" class="icon-button" title="Increase Font Size" aria-label="Increase font size">A+</button>
                    </div>
                    <div class="reading-controls">
                        <span>Line Height:</span>
                        <button id="line-height-down" class="icon-button" title="Decrease Line Height" aria-label="Decrease line height"> Less</button>
                        <button id="line-height-up" class="icon-button" title="Increase Line Height" aria-label="Increase line height">More</button>
                    </div>
                     <div class="comment-sort-controls">
                        <label for="comment-sort-select">Sort Comments:</label>
                        <select id="comment-sort-select" class="dropdown-input" aria-label="Sort comments by">
                            <option value="confidence">Top</option>
                            <option value="new">New</option>
                            <option value="controversial">Controversial</option>
                            <option value="q&a">Q&A</option>
                        </select>
                    </div>
                </div>
            `;

            setupReadingControls(story);
            document.getElementById('comment-sort-select').addEventListener('change', (e) => {
                fetchCommentsForCurrentStory(e.target.value);
            });
            document.getElementById('word-cloud-button').addEventListener('click', () => generateWordCloud(story));
            document.getElementById('summarize-button').addEventListener('click', () => handleSummarize(story, 'summarize'));
            document.getElementById('eli5-button').addEventListener('click', () => handleSummarize(story, 'eli5'));
            const continueStoryBtn = document.getElementById('continue-story-button');
            if (continueStoryBtn) {
                continueStoryBtn.addEventListener('click', () => handleStoryContinuation(story));
            }
            document.getElementById('narrate-button').addEventListener('click', () => handleNarration(story));
            document.getElementById('stop-narration-button').addEventListener('click', () => stopNarration());
            document.getElementById('translation-select').addEventListener('change', (e) => handleTranslation(story, e.target.value));

            
            let headerActions = header.querySelector('.popup-header-actions');
            if (!headerActions) {
                headerActions = document.createElement('div');
                headerActions.className = 'popup-header-actions';
                header.insertBefore(headerActions, closePopupButton);
            }
            headerActions.innerHTML = '';
            
            const redditLink = `${REDDIT_BASE_URL}${story.permalink}`;
            
            const shareBtn = document.createElement('button');
            shareBtn.className = 'icon-button';
            shareBtn.title = 'Copy Link';
            shareBtn.setAttribute('aria-label', 'Copy link to story');
            shareBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>`;
            shareBtn.onclick = () => {
                navigator.clipboard.writeText(redditLink);
                showToast('Link copied to clipboard!');
            };
            headerActions.appendChild(shareBtn);

            const linkEl = document.createElement('a');
            linkEl.href = redditLink;
            linkEl.target = '_blank';
            linkEl.rel = 'noopener noreferrer';
            linkEl.className = 'icon-button';
            linkEl.title = 'View on Reddit';
            linkEl.setAttribute('aria-label', 'View story on Reddit');
            linkEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
            headerActions.appendChild(linkEl);

            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'icon-button';
            downloadBtn.title = 'Download Story';
            downloadBtn.setAttribute('aria-label', 'Download story as text file');
            downloadBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
            downloadBtn.onclick = () => downloadStory(story);
            headerActions.appendChild(downloadBtn);

            if (isStorySaved(story.id)) {
                savedStoryNotesContainer.style.display = 'block';
                savedStoryTagsContainer.style.display = 'block';
                savedStoryNotes.value = getStoryNote(story.id);
                renderStoryTags(story.id);
            } else {
                savedStoryNotesContainer.style.display = 'none';
                savedStoryTagsContainer.style.display = 'none';
            }

            document.body.style.overflow = 'hidden';
            popupOverlay.classList.add('active');
            popupBody.scrollTop = 0;
            handlePopupScroll();
            
            if (storyContainer.classList.contains('gallery-view')) {
                galleryPrevButton.style.display = 'block';
                galleryNextButton.style.display = 'block';
            }
            
            let storyText = story.selftext || '';
            let searchQueryForHighlight = currentView === 'browsing' ? currentSearchQuery : (currentView === 'saved' ? savedSearchInput.value : historySearchInput.value);
            if (searchQueryForHighlight) {
                storyText = highlightKeywords(storyText, searchQueryForHighlight);
            }

            let finalContent = `<div id="story-content-wrapper">`;
            finalContent += createMediaElement(story, true);

            if (story.crosspost_parent_list && story.crosspost_parent_list.length > 0) {
                 finalContent += `<div class="crosspost-info">Cross-posted from <a href="#" onclick="event.preventDefault(); window.open('${REDDIT_BASE_URL}r/${story.crosspost_parent_list[0].subreddit}', '_blank')">r/${story.crosspost_parent_list[0].subreddit}</a></div>`;
            }

            if (storyText) {
                finalContent += `<div class="markdown-content">${renderMarkdown(storyText)}</div>`;
            }
            finalContent += `</div>`;
            
            finalContent += `<hr><div id="comment-section" data-op-author="${story.author}"></div>`;
            popupBody.innerHTML = finalContent;

            await fetchCommentsForCurrentStory('confidence');
            restoreReadingPosition(story.id);
            findSeries(story);
        }

        async function fetchCommentsForCurrentStory(sort) {
            const story = allFetchedPosts.find(p => p.id === currentStoryId) || getHistory().find(p => p.id === currentStoryId) || getSavedStories().find(p => p.id === currentStoryId);
            if (!story) return;

            const commentSection = document.getElementById('comment-section');
            if (commentSection) {
                commentSection.innerHTML = `<h4>Comments:</h4><div class="spinner"></div>`;
            } else {
                 popupBody.innerHTML += `<hr><div id="comment-section" data-op-author="${story.author}"><h4>Comments:</h4><div class="spinner"></div></div>`;
            }
            
            commentNavigator.style.display = 'none';
            topLevelComments = [];

            try {
                const commentsUrl = `${REDDIT_BASE_URL}r/${story.subreddit}/comments/${story.id}.json?sort=${sort}`;
                // OPTIMIZATION: Use cache for comments
                const data = await fetchWithCache(commentsUrl);
                const comments = data[1].data.children;
                
                const currentCommentSection = document.getElementById('comment-section');
                currentCommentSection.innerHTML = `<h4>Comments:</h4>`;
                appendComments(story.name, comments);
                
                topLevelComments = [...currentCommentSection.querySelectorAll(':scope > .comment-card')];
                setupCommentNavigator();

            } catch (error) {
                console.error(`Failed to fetch comments sorted by ${sort}:`, error);
                 const currentCommentSection = document.getElementById('comment-section');
                currentCommentSection.innerHTML = `<p>${error.message}</p>`;
            }
        }
        
        // This is the rest of the file, included in its entirety.
        // The functions below are unchanged from the previous version.
        
        function appendComments(postName, commentData) {
            const commentSection = document.getElementById('comment-section');
            if (!commentSection) return;
            const opAuthor = commentSection.dataset.opAuthor;
            const shouldCollapse = collapseCommentsToggle.checked;
            let searchQueryForHighlight = currentView === 'browsing' ? currentSearchQuery : (currentView === 'saved' ? savedSearchInput.value : historySearchInput.value);

            const moreCommentsObject = commentData.find(c => c.kind === 'more');
            const actualComments = commentData.filter(c => c.kind === 't1');

            if (actualComments.length > 0) {
                 const commentsHTML = actualComments.map(c => c.data).filter(c => c.body).map(c => {
                    let commentBody = c.body;
                    if (searchQueryForHighlight) {
                       commentBody = highlightKeywords(commentBody, searchQueryForHighlight);
                    }
                    const isOp = c.author === opAuthor;
                    const opClass = isOp ? 'op-comment' : '';
                    const opLabel = isOp ? '<span class="op-label">OP</span>' : '';
                    const collapsedClass = shouldCollapse ? 'collapsed' : '';
                    const collapseSymbol = shouldCollapse ? '[+]' : '[–]';

                    return `
                    <div class="comment-card ${opClass} ${collapsedClass}" data-comment-id="${c.id}" data-comment-author="${c.author}">
                        <p class="comment-author"><span class="collapse-comment">${collapseSymbol}</span><a href="#" class="author-link">u/${c.author}</a> ${opLabel}</p>
                        <div class="comment-body markdown-content">${renderMarkdown(commentBody)}</div>
                    </div>`
                }).join('');
                commentSection.insertAdjacentHTML('beforeend', commentsHTML);
            }

            const loadMoreContainer = document.querySelector('.load-more-comments-container');
            if (loadMoreContainer) loadMoreContainer.remove();

            if (moreCommentsObject && moreCommentsObject.data.children.length > 0) {
                const newLoadMoreContainer = document.createElement('div');
                newLoadMoreContainer.className = 'load-more-comments-container';
                const loadMoreCommentsButton = document.createElement('button');
                loadMoreCommentsButton.className = 'action-button secondary';
                loadMoreCommentsButton.textContent = `Load More Replies (${moreCommentsObject.data.children.length})`;
                
                loadMoreCommentsButton.onclick = () => {
                    fetchMoreComments(postName, moreCommentsObject.data.children, newLoadMoreContainer);
                    loadMoreCommentsButton.textContent = 'Loading...';
                    loadMoreCommentsButton.disabled = true;
                };
                newLoadMoreContainer.appendChild(loadMoreCommentsButton);
                commentSection.appendChild(newLoadMoreContainer);
            }
        }

        async function fetchMoreComments(postName, childrenIds, buttonContainer) {
            try {
                const ids = childrenIds.slice(0, 100).join(',');
                const url = `${REDDIT_BASE_URL}api/morechildren.json?api_type=json&link_id=${postName}&children=${ids}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                
                const newComments = data.json.data.things;
                
                buttonContainer.remove();
                appendComments(postName, newComments);

            } catch (error) {
                console.error('Failed to fetch more comments:', error);
                buttonContainer.innerHTML = `<p>Failed to load more comments.</p>`;
            }
        }
        
        function renderFilteredStories() {
            const flairFilter = flairFilterInput.value.trim().toLowerCase();
            const minScore = parseInt(minScoreInput.value, 10) || 0;
            const minComments = parseInt(minCommentsInput.value, 10) || 0;
            const readStories = getHistory().map(h => h.id);

            let visibleCount = 0;
            storyContainer.querySelectorAll('.story-card').forEach(card => {
                const storyId = card.dataset.storyId;
                const story = allFetchedPosts.find(p => p.id === storyId);
                
                if (!story) return;

                const flairMatch = !flairFilter || (story.link_flair_text && story.link_flair_text.toLowerCase().includes(flairFilter));
                const scoreMatch = story.score >= minScore;
                const commentsMatch = story.num_comments >= minComments;
                
                if (flairMatch && scoreMatch && commentsMatch) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }

                if (readStories.includes(storyId)) {
                    card.classList.add('read');
                } else {
                    card.classList.remove('read');
                }
            });
            
            markAllReadButton.style.display = visibleCount > 0 && currentView === 'browsing' ? 'flex' : 'none';
            
            const isImageHeavy = allFetchedPosts.length > 0 && allFetchedPosts.filter(p => p.post_hint === 'image').length / allFetchedPosts.length > 0.5;
            galleryToggleButton.style.display = isImageHeavy ? 'flex' : 'none';
        }


        function displayStories(stories, options = {}) {
            const fragment = document.createDocumentFragment();
            const shouldBlur = nsfwToggle.checked;

            stories.forEach((story, index) => {
                const storyCard = document.createElement('div');
                storyCard.className = 'story-card';
                storyCard.dataset.storyId = story.id;
                
                if (isStoryRead(story.id)) {
                    storyCard.classList.add('read');
                }

                if (story.distinguished === 'moderator') {
                    storyCard.classList.add('moderator-post');
                }
                storyCard.style.animationDelay = `${index * 0.05}s`;
                const isSaved = isStorySaved(story.id);
                const readingTime = calculateReadingTime(story.selftext);
                const timeAgo = formatTimeAgo(story.created_utc);
                const isSensitive = story.over_18 || story.spoiler;
                
                let readAtTimeHTML = '';
                if (options.isHistoryView && story.readAt) {
                    readAtTimeHTML = `<p class="read-at-time">Read ${formatTimeAgo(new Date(story.readAt).getTime() / 1000)}</p>`;
                }

                let gildedHTML = '';
                if (story.total_awards_received > 0) {
                    gildedHTML = `<span><svg class="gilded-icon" width="24" height="24" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>${story.total_awards_received}</span>`;
                }

                if (shouldBlur && isSensitive) {
                    storyCard.classList.add('nsfw-blur');
                    const uncoverDiv = document.createElement('div');
                    uncoverDiv.className = 'nsfw-uncover';
                    uncoverDiv.innerHTML = `
                        <h4>${story.over_18 ? 'NSFW Content' : 'Spoiler'}</h4>
                        <p>Click to reveal</p>
                    `;
                    uncoverDiv.addEventListener('click', (e) => {
                        e.stopPropagation();
                        storyCard.classList.remove('nsfw-blur');
                        uncoverDiv.remove();
                    }, { once: true });
                    storyCard.appendChild(uncoverDiv);
                }
                
                let crosspostHTML = '';
                if (story.crosspost_parent_list && story.crosspost_parent_list.length > 0) {
                    crosspostHTML = `<div class="crosspost-info">Cross-posted from <a href="#" data-subreddit="${story.crosspost_parent_list[0].subreddit}">r/${story.crosspost_parent_list[0].subreddit}</a></div>`;
                }
                
                const galleryOverlayHTML = `
                    <div class="gallery-card-overlay">
                        <h4>${story.title}</h4>
                        <p>${(story.score || 0).toLocaleString()} upvotes</p>
                    </div>`;

                storyCard.innerHTML += `
                    ${createMediaElement(story, false)}
                    <div class="story-card-content">
                        ${crosspostHTML}
                        <div class="story-meta">
                            <span><svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 12h5v10h10V12h5L12 2z"/></svg>${(story.score || 0).toLocaleString()}</span>
                            <span><svg width="24" height="24" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>${(story.num_comments || 0).toLocaleString()}</span>
                            <span><svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>${timeAgo}</span>
                             ${gildedHTML}
                            ${story.link_flair_text ? `<span class="story-flair">${story.link_flair_text}</span>` : ''}
                            <span class="sentiment-badge" data-story-id="${story.id}"></span>
                        </div>
                        <h3><a href="${REDDIT_BASE_URL}${story.permalink}" target="_blank" rel="noopener noreferrer">${story.title}</a></h3>
                        <p class="author" title="View u/${story.author}'s profile">by u/${story.author}</p>
                        ${readAtTimeHTML}
                        <p class="reading-time">${readingTime} (${(story.selftext || '').split(/\s+/).length} words)</p>
                        <p class="preview">${story.selftext ? story.selftext.substring(0, 150) + '...' : ''}</p>
                        <div class="story-card-actions">
                            <button class="read-button">Read Story</button>
                            <div class="action-buttons">
                                <button class="icon-button sentiment-button" title="Analyze Comment Sentiment">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                                </button>
                                <a href="${REDDIT_BASE_URL}${story.permalink}" target="_blank" rel="noopener noreferrer" class="icon-button" title="View on Reddit">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </a>
                                <button class="save-button ${isSaved ? 'saved' : ''}">${isSaved ? 'Remove' : 'Save'}</button>
                            </div>
                        </div>
                    </div>
                    ${galleryOverlayHTML}`;
                
                fragment.appendChild(storyCard);
            });
            storyContainer.appendChild(fragment);
        }

        function handleStoryContainerClick(e) {
            const card = e.target.closest('.story-card');
            if (!card) return;

            const storyId = card.dataset.storyId;
            const story = allFetchedPosts.find(p => p.id === storyId) || getHistory().find(p => p.id === storyId) || getSavedStories().find(p => p.id === storyId);
            if (!story) return;

            const redditLink = `${REDDIT_BASE_URL}${story.permalink}`;

            if (e.target.closest('.read-button')) {
                e.stopPropagation();
                fetchAndShowComments(story);
            } else if (e.target.closest('.sentiment-button')) {
                e.stopPropagation();
                getCommentSentiment(story);
            } else if (e.target.closest('.author')) {
                e.stopPropagation();
                fetchUserProfile(story.author);
            } else if (e.target.closest('.crosspost-info a')) {
                e.stopPropagation();
                subredditInput.value = e.target.dataset.subreddit;
                switchToView('browsing', { refresh: true });
            } else if (e.target.closest('.save-button')) {
                e.stopPropagation();
                toggleSaveStory(story);
            } else if (e.target.closest('.share-button')) {
                e.stopPropagation();
                navigator.clipboard.writeText(redditLink);
                showToast('Link copied to clipboard!');
            } else if (e.target.closest('a')) {
                // Let links behave normally
            }
            else {
                fetchAndShowComments(story);
            }
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
        
        function calculateReadingTime(text) {
            if (!text) return '1 min read';
            const wordsPerMinute = 225;
            const words = text.trim().split(/\s+/).length;
            const time = Math.ceil(words / wordsPerMinute);
            return `${time} min read`;
        }

        function formatTimeAgo(utcTimestamp) {
            const now = new Date();
            const postDate = new Date(utcTimestamp * 1000);
            const seconds = Math.floor((now - postDate) / 1000);

            let interval = seconds / 31536000;
            if (interval > 1) {
                const years = Math.floor(interval);
                return `${years} year${years > 1 ? 's' : ''} ago`;
            }
            interval = seconds / 2592000;
            if (interval > 1) {
                const months = Math.floor(interval);
                return `${months} month${months > 1 ? 's' : ''} ago`;
            }
            interval = seconds / 86400;
            if (interval > 1) {
                const days = Math.floor(interval);
                return `${days} day${days > 1 ? 's' : ''} ago`;
            }
            interval = seconds / 3600;
            if (interval > 1) {
                const hours = Math.floor(interval);
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            }
            interval = seconds / 60;
            if (interval > 1) {
                const minutes = Math.floor(interval);
                return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            }
            return `${Math.floor(seconds)} second${seconds !== 1 ? 's' : ''} ago`;
        }
        
        function highlightKeywords(text, query) {
            if (!query) return text;
            const keywords = query.split(' ').filter(Boolean);
            const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
            return text.replace(regex, `<span class="highlight">$1</span>`);
        }
        
        function handleAuthorClick(author) {
            searchInput.value = `author:${author}`;
            switchToView('browsing', { refresh: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        function renderMarkdown(text) {
            if (!text) return '';
            const tempTextArea = document.createElement('textarea');
            tempTextArea.innerHTML = text;
            const decodedText = tempTextArea.value;
            return marked.parse(decodedText, { breaks: true });
        }

        function getHistory() {
            const history = JSON.parse(localStorage.getItem(READ_HISTORY_KEY)) || [];
            return history.filter(story => story && story.id && story.title);
        }

        function addStoryToHistory(story) {
            if (!story || !story.id) return;
            let history = getHistory();
            const storyIndex = history.findIndex(s => s.id === story.id);
            if (storyIndex > -1) {
                history.splice(storyIndex, 1);
            }
            history.unshift({ ...story, readAt: new Date().toISOString() });
            history = history.slice(0, 200);
            localStorage.setItem(READ_HISTORY_KEY, JSON.stringify(history));
        }

        function isStoryRead(storyId) {
            return getHistory().some(s => s.id === storyId);
        }

        function displayHistory() {
            storyContainer.innerHTML = '';
            const history = getHistory();
            const searchTerm = historySearchInput.value.trim().toLowerCase();
            const viewActions = historyView.querySelector('.view-actions');
            
            let filteredHistory = history;
            if (searchTerm) {
                filteredHistory = history.filter(story => 
                    story.title.toLowerCase().includes(searchTerm) || 
                    (story.selftext && story.selftext.toLowerCase().includes(searchTerm)) || 
                    story.subreddit.toLowerCase().includes(searchTerm)
                );
            }

            const sortMethod = historySortSelect.value;
            
            switch (sortMethod) {
                case 'date-desc':
                    filteredHistory.sort((a, b) => new Date(b.readAt) - new Date(a.readAt));
                    break;
                case 'date-asc':
                    filteredHistory.sort((a, b) => new Date(a.readAt) - new Date(b.readAt));
                    break;
                case 'score-desc':
                    filteredHistory.sort((a, b) => (b.score || 0) - (a.score || 0));
                    break;
                case 'subreddit-az':
                    filteredHistory.sort((a, b) => a.subreddit.localeCompare(b.subreddit));
                    break;
            }

            storiesHeading.textContent = `Showing ${filteredHistory.length} stor${filteredHistory.length === 1 ? 'y' : 'ies'} from your history`;
            
            if (history.length > 0) {
                 if (viewActions) viewActions.style.display = 'flex';
                displayStories(filteredHistory, { isHistoryView: true });
                if (filteredHistory.length === 0) {
                    storyContainer.innerHTML = `<p class="empty-state">No stories in your history match your search.</p>`;
                }
            } else {
                 if (viewActions) viewActions.style.display = 'none';
                storyContainer.innerHTML = `<p class="empty-state">You haven't read any stories yet.</p>`;
            }
        }
        
        function handleClearHistory() {
            if (confirm("Are you sure you want to clear your reading history? This cannot be undone.")) {
                localStorage.removeItem(READ_HISTORY_KEY);
                localStorage.removeItem(READING_POSITION_KEY);
                displayHistory();
                renderFilteredStories();
            }
        }
        
         function handleClearSaved() {
            if (confirm("Are you sure you want to delete all saved stories? This cannot be undone.")) {
                localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify([]));
                localStorage.removeItem(STORY_NOTES_KEY);
                displaySavedStories();
            }
        }

        function toggleSaveStory(story) {
            let savedStories = getSavedStories();
            const storyIndex = savedStories.findIndex(s => s.id === story.id);
            const isNowSaved = storyIndex === -1;

            if (isNowSaved) {
                const storyToSave = { ...story, dateSaved: new Date().toISOString(), tags: [] };
                savedStories.push(storyToSave);
            } else {
                savedStories.splice(storyIndex, 1);
            }

            localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(savedStories));

            if (currentView === 'saved') {
                displaySavedStories();
                return;
            }

            const storyCards = document.querySelectorAll(`.story-card[data-story-id="${story.id}"]`);
            storyCards.forEach(card => {
                const button = card.querySelector('.save-button');
                if (button) {
                    if (isNowSaved) {
                        button.textContent = 'Remove';
                        button.classList.add('saved');
                    } else {
                        button.textContent = 'Save';
                        button.classList.remove('saved');
                    }
                }
            });

            if (popupOverlay.classList.contains('active') && currentStoryId === story.id) {
                if (isNowSaved) {
                    savedStoryNotesContainer.style.display = 'block';
                    savedStoryTagsContainer.style.display = 'block';
                    savedStoryNotes.value = getStoryNote(story.id);
                    renderStoryTags(story.id);
                } else {
                    savedStoryNotesContainer.style.display = 'none';
                    savedStoryTagsContainer.style.display = 'none';
                }
            }
        }
        
        function getSavedStories() {
            return JSON.parse(localStorage.getItem(SAVED_STORIES_KEY)) || [];
        }

        function isStorySaved(storyId) {
            return getSavedStories().some(s => s.id === storyId);
        }

        function displaySavedStories() {
            storyContainer.innerHTML = '';
            let savedStories = getSavedStories();
            const viewActions = savedStoriesView.querySelector('.view-actions');
            
            renderTagFilters();
            
            const searchTerm = savedSearchInput.value.trim().toLowerCase();

            if (searchTerm) {
                savedStories = savedStories.filter(story => 
                    story.title.toLowerCase().includes(searchTerm) || 
                    (story.selftext && story.selftext.toLowerCase().includes(searchTerm)) || 
                    story.subreddit.toLowerCase().includes(searchTerm)
                );
            }

            if(activeTagFilter) {
                savedStories = savedStories.filter(story => story.tags && story.tags.includes(activeTagFilter));
            }

            const sortMethod = savedSortSelect.value;
            
            switch (sortMethod) {
                case 'date-desc':
                    savedStories.sort((a, b) => new Date(b.dateSaved) - new Date(a.dateSaved));
                    break;
                case 'date-asc':
                    savedStories.sort((a, b) => new Date(a.dateSaved) - new Date(b.dateSaved));
                    break;
                case 'score-desc':
                    savedStories.sort((a, b) => (b.score || 0) - (a.score || 0));
                    break;
                case 'subreddit-az':
                    savedStories.sort((a, b) => a.subreddit.localeCompare(b.subreddit));
                    break;
            }

            storiesHeading.textContent = `Showing ${savedStories.length} saved stor${savedStories.length === 1 ? 'y' : 'ies'}`;
            
            if (getSavedStories().length > 0) {
                if(viewActions) viewActions.style.display = 'flex';
                displayStories(savedStories);
                 if (savedStories.length === 0) {
                    storyContainer.innerHTML = `<p class="empty-state">No saved stories match your search or filter.</p>`;
                }
            } else {
                if(viewActions) viewActions.style.display = 'none';
                storyContainer.innerHTML = `<p class="empty-state">You haven't saved any stories yet.</p>`;
            }
        }
        
        function handleExportSaved() {
            const savedStories = getSavedStories();
            if (savedStories.length === 0) {
                showToast("No saved stories to export.");
                return;
            }
            const notes = getStoryNotes();
            const exportData = {
                stories: savedStories,
                notes: notes,
            };
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.download = `reddit-storyteller-saved_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast("Saved stories exported!");
        }

        function handleImportFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    const importedStories = Array.isArray(importedData) ? importedData : importedData.stories;
                    const importedNotes = importedData.notes || {};

                    if (!Array.isArray(importedStories)) throw new Error("Invalid stories format.");

                    const existingStories = getSavedStories();
                    const existingIds = new Set(existingStories.map(s => s.id));
                    let newStoriesCount = 0;

                    importedStories.forEach(story => {
                        if (story.id && !existingIds.has(story.id)) {
                            if (!story.tags) story.tags = [];
                            existingStories.push(story);
                            newStoriesCount++;
                        }
                    });

                    const existingNotes = getStoryNotes();
                    const finalNotes = { ...existingNotes, ...importedNotes };

                    localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(existingStories));
                    localStorage.setItem(STORY_NOTES_KEY, JSON.stringify(finalNotes));

                    showToast(`Successfully imported ${newStoriesCount} new stories!`);
                    if (currentView === 'saved') displaySavedStories();

                } catch (error) {
                    showErrorPopup("Import failed. The file is either corrupted or not in the correct format.");
                    console.error("Import error:", error);
                } finally {
                    importFileInput.value = '';
                }
            };
            reader.readAsText(file);
        }

        function getSubredditHistory() {
            return JSON.parse(localStorage.getItem(SUBREDDIT_HISTORY_KEY)) || [];
        }

        function saveSubredditToHistory(subreddit) {
            if (!subreddit || subreddit.includes('+')) return;
            let history = getSubredditHistory();
            history = history.filter(item => item.toLowerCase() !== subreddit.toLowerCase());
            history.unshift(subreddit);
            history = history.slice(0, 10);
            localStorage.setItem(SUBREDDIT_HISTORY_KEY, JSON.stringify(history));
            populateSubredditHistory();
        }

        function populateSubredditHistory() {
            const history = getSubredditHistory();
            const dataList = document.getElementById('subreddit-list');
            const defaultSubs = ["AskReddit", "WritingPrompts", "TrueOffMyChest", "TIFU", "nosleep"];
            const combinedList = [...new Set([...history, ...defaultSubs])];
            dataList.innerHTML = '';
            combinedList.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                dataList.appendChild(option);
            });
        }

        function downloadStory(story) {
            try {
                const comments = [...popupBody.querySelectorAll('.comment-card')].map(card => {
                    if (card.classList.contains('collapsed')) return '';
                    const author = card.dataset.commentAuthor;
                    const body = card.querySelector('.comment-body').innerText;
                    return `Comment by u/${author}:\n${body}\n\n--------------------\n\n`;
                }).join('');
                
                const notes = getStoryNote(story.id);
                const notesSection = notes ? `====================\r\nMY NOTES\r\n====================\r\n\r\n${notes}\r\n\r\n` : '';

                const storyContent = `Title: ${story.title}\r\n` +
                                     `Author: u/${story.author}\r\n` +
                                     `Subreddit: ${story.subreddit_name_prefixed}\r\n` +
                                     `Link: ${REDDIT_BASE_URL}${story.permalink}\r\n` +
                                     `Score: ${story.score}\r\n` +
                                     `Comments: ${story.num_comments}\r\n\r\n` +
                                     `====================\r\n\r\n` +
                                     `${story.selftext}\r\n\r\n` +
                                     `${notesSection}` +
                                     `====================\r\nCOMMENTS\r\n====================\r\n\r\n` +
                                     `${comments}`;

                const blob = new Blob([storyContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const safeFilename = story.title.replace(/[^a-z0-9]/gi, '_').slice(0, 50);
                link.download = `${safeFilename}.txt`;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                showToast('Story downloaded!');
            } catch (error) {
                console.error('Download error:', error);
                showErrorPopup('Could not prepare the story for download.');
            }
        }

        function handleMarkAllRead() {
            const visibleCards = [...storyContainer.querySelectorAll('.story-card')].filter(card => card.style.display !== 'none');
            if (visibleCards.length === 0) {
                showToast("No stories to mark as read.");
                return;
            }

            visibleCards.forEach(card => {
                const storyId = card.dataset.storyId;
                const story = allFetchedPosts.find(p => p.id === storyId);
                if (story && !isStoryRead(storyId)) {
                    addStoryToHistory(story);
                    card.classList.add('read');
                }
            });
            showToast(`Marked ${visibleCards.length} stories as read.`);
        }
        
        function getReadingSettings() {
            return JSON.parse(localStorage.getItem(READING_SETTINGS_KEY)) || { fontSize: 1.1, lineHeight: 1.6 };
        }

        function saveReadingSettings(settings) {
            localStorage.setItem(READING_SETTINGS_KEY, JSON.stringify(settings));
        }

        function applyReadingSettings() {
            const settings = getReadingSettings();
            document.documentElement.style.setProperty('--popup-font-size', `${settings.fontSize}em`);
            document.documentElement.style.setProperty('--popup-line-height', `${settings.lineHeight}`);
        }
        
        function setupReadingControls(story) {
            const fontSizeUp = document.getElementById('font-size-up');
            const fontSizeDown = document.getElementById('font-size-down');
            const lineHeightUp = document.getElementById('line-height-up');
            const lineHeightDown = document.getElementById('line-height-down');
            
            fontSizeUp.addEventListener('click', () => updateReadingSetting('fontSize', 0.1));
            fontSizeDown.addEventListener('click', () => updateReadingSetting('fontSize', -0.1));
            lineHeightUp.addEventListener('click', () => updateReadingSetting('lineHeight', 0.1));
            lineHeightDown.addEventListener('click', () => updateReadingSetting('lineHeight', -0.1));
        }

        function updateReadingSetting(setting, change) {
            const settings = getReadingSettings();
            if (setting === 'fontSize') {
                settings.fontSize = Math.max(0.5, settings.fontSize + change);
            } else if (setting === 'lineHeight') {
                settings.lineHeight = Math.max(1, settings.lineHeight + change);
            }
            saveReadingSettings(settings);
            applyReadingSettings();
        }

        function handleKeyboardNav(e) {
            const isPopupActive = popupOverlay.classList.contains('active');
            const isProfileActive = userProfileOverlay.classList.contains('active');
            const isWordCloudActive = wordCloudOverlay.classList.contains('active');
            const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

            if (isTyping) return;

            let cards = [...storyContainer.querySelectorAll('.story-card')].filter(card => card.style.display !== 'none');
            let activeCard = storyContainer.querySelector('.active-card');
            let currentIndex = activeCard ? cards.indexOf(activeCard) : -1;
            
            switch (e.key) {
                case 'Escape':
                    if (isPopupActive) closePopup();
                    if (isProfileActive) closeUserProfilePopupHandler();
                    if (isWordCloudActive) wordCloudOverlay.classList.remove('active');
                    break;
                case 'j':
                    if (!isPopupActive && !isProfileActive) {
                        e.preventDefault();
                        if (currentIndex < cards.length - 1) {
                            currentIndex++;
                            setActiveCard(cards[currentIndex]);
                        }
                    } else if (isPopupActive) {
                        e.preventDefault();
                        navigateComments(1);
                    }
                    break;
                case 'k':
                     if (!isPopupActive && !isProfileActive) {
                        e.preventDefault();
                        if (currentIndex > 0) {
                            currentIndex--;
                            setActiveCard(cards[currentIndex]);
                        }
                    } else if (isPopupActive) {
                        e.preventDefault();
                        navigateComments(-1);
                    }
                    break;
                case 'o':
                case 'Enter':
                     if (!isPopupActive && !isProfileActive && activeCard) {
                        e.preventDefault();
                        activeCard.click();
                    }
                    break;
            }
        }
        
        function setActiveCard(card) {
            storyContainer.querySelector('.active-card')?.classList.remove('active-card');
            if (card) {
                card.classList.add('active-card');
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        function handlePopupBodyClick(e) {
            const collapseButton = e.target.closest('.collapse-comment');
            if (collapseButton) {
                const commentCard = collapseButton.closest('.comment-card');
                const isCollapsed = commentCard.classList.toggle('collapsed');
                collapseButton.textContent = isCollapsed ? '[+]' : '[–]';
            }
            const authorLink = e.target.closest('.author-link');
            if(authorLink) {
                e.preventDefault();
                const author = authorLink.textContent.replace('u/', '');
                fetchUserProfile(author);
            }
            const removeTagBtn = e.target.closest('.remove-tag');
            if(removeTagBtn) {
                const tag = removeTagBtn.parentElement.dataset.tag;
                removeTagFromStory(currentStoryId, tag);
            }
        }
        
        function navigateGallery(direction) {
            let imagePosts = allFetchedPosts.filter(p => p.post_hint === 'image');
            const currentPostIndex = imagePosts.findIndex(p => p.id === currentStoryId);
            
            if (currentPostIndex !== -1) {
                let nextIndex = currentPostIndex + direction;
                if (nextIndex >= imagePosts.length) nextIndex = 0;
                if (nextIndex < 0) nextIndex = imagePosts.length - 1;
                fetchAndShowComments(imagePosts[nextIndex]);
            }
        }

        function handlePopupScroll() {
            const { scrollTop, scrollHeight, clientHeight } = popupBody;
            if (scrollHeight <= clientHeight) {
                readingProgressBar.style.width = '100%';
                return;
            }
            const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
            readingProgressBar.style.width = `${scrollPercent}%`;
        }
        
        async function findSeries(story) {
            seriesNavigation.innerHTML = '';
            currentSeries = { parts: [], currentIndex: -1 };
            
            const partRegex = /(?:part|chapter)\s*(\d+)/i;
            const match = story.title.match(partRegex);
            
            if (!match) return;

            const baseTitle = story.title.replace(partRegex, '').replace(/[\[\]()|]/g, '').trim();

            try {
                const url = `${REDDIT_BASE_URL}user/${story.author}/submitted.json?sort=new&limit=100`;
                const data = await fetchWithCache(url);
                
                const authorPosts = data.data.children.map(p => p.data);
                const seriesPosts = authorPosts.filter(p => p.subreddit === story.subreddit && p.title.toLowerCase().includes(baseTitle.toLowerCase()));

                seriesPosts.forEach(p => {
                    const postMatch = p.title.match(partRegex);
                    if (postMatch) p.part = parseInt(postMatch[1], 10);
                });

                currentSeries.parts = seriesPosts.sort((a,b) => a.part - b.part);
                currentSeries.currentIndex = currentSeries.parts.findIndex(p => p.id === story.id);
                
                displaySeriesNav();

            } catch (error) {
                console.error("Failed to find series:", error);
            }
        }

        function displaySeriesNav() {
            seriesNavigation.innerHTML = '';
            if (currentSeries.currentIndex === -1) return;

            const prevButton = document.createElement('button');
            prevButton.textContent = '← Previous Part';
            prevButton.disabled = currentSeries.currentIndex === 0;
            prevButton.onclick = () => {
                const prevStory = currentSeries.parts[currentSeries.currentIndex - 1];
                if (prevStory) {
                    closePopup();
                    fetchAndShowComments(prevStory);
                }
            };

            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next Part →';
            nextButton.disabled = currentSeries.currentIndex === currentSeries.parts.length - 1;
            nextButton.onclick = () => {
                const nextStory = currentSeries.parts[currentSeries.currentIndex + 1];
                if (nextStory) {
                    closePopup();
                    fetchAndShowComments(nextStory);
                }
            };

            seriesNavigation.appendChild(prevButton);
            seriesNavigation.appendChild(nextButton);
        }

        function setupCommentNavigator() {
            if (topLevelComments.length < 5) {
                commentNavigator.style.display = 'none';
                return;
            }
            commentNavigator.style.display = 'flex';
            currentCommentIndex = -1;
            commentNavigator.innerHTML = `
                <button id="comment-prev" title="Previous Comment (k)">▲</button>
                <span id="comment-nav-counter">0 / ${topLevelComments.length}</span>
                <button id="comment-next" title="Next Comment (j)">▼</button>
            `;
            
            document.getElementById('comment-prev').addEventListener('click', () => navigateComments(-1));
            document.getElementById('comment-next').addEventListener('click', () => navigateComments(1));
            updateCommentNavigator();
        }

        function navigateComments(direction) {
            if (topLevelComments.length === 0) return;

            if (currentCommentIndex > -1 && topLevelComments[currentCommentIndex]) {
                topLevelComments[currentCommentIndex].classList.remove('active-comment');
            }
            
            currentCommentIndex += direction;

            if (currentCommentIndex >= topLevelComments.length) currentCommentIndex = 0;
            if (currentCommentIndex < 0) currentCommentIndex = topLevelComments.length -1;

            const nextComment = topLevelComments[currentCommentIndex];
            nextComment.scrollIntoView({ behavior: 'smooth', block: 'center' });
            nextComment.classList.add('active-comment');
            
            updateCommentNavigator();
        }

        function updateCommentNavigator() {
            const counter = document.getElementById('comment-nav-counter');
            if (counter) counter.textContent = `${currentCommentIndex + 1} / ${topLevelComments.length}`;
        }
        
        async function fetchUserProfile(author) {
            userProfileTitle.textContent = `u/${author}`;
            userProfileBody.innerHTML = '<div class="spinner"></div>';
            userProfileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            try {
                const [aboutData, submittedData] = await Promise.all([
                    fetchWithCache(`${REDDIT_BASE_URL}user/${author}/about.json`),
                    fetchWithCache(`${REDDIT_BASE_URL}user/${author}/submitted.json?limit=10`)
                ]);
                
                displayUserProfile(aboutData.data, submittedData.data.children.map(p => p.data));

            } catch (error) {
                console.error("Failed to fetch user profile:", error);
                userProfileBody.innerHTML = `<p>Could not load profile for u/${author}.</p>`;
            }
        }

        function displayUserProfile(about, posts) {
            const cakeDay = new Date(about.created_utc * 1000).toLocaleDateString();
            
            const postsHTML = posts.map(post => `
                <div class="user-profile-post" data-story-id="${post.id}">
                    <p class="user-profile-post-title">${post.title}</p>
                    <p class="user-profile-post-meta">
                        <strong>r/${post.subreddit}</strong> • ${post.score} upvotes • ${post.num_comments} comments
                    </p>
                </div>
            `).join('');

            userProfileBody.innerHTML = `
                <div class="user-profile-info">
                    <img src="${about.icon_img?.split('?')[0] || 'https://placehold.co/80x80/e74c3c/fff?text=R'}" alt="${about.name}'s avatar" class="user-profile-avatar">
                    <div class="user-profile-stats">
                        <div class="user-profile-stat">
                            <div class="user-profile-stat-value">${(about.total_karma || 0).toLocaleString()}</div>
                            <div class="user-profile-stat-label">Total Karma</div>
                        </div>
                         <div class="user-profile-stat">
                            <div class="user-profile-stat-value">${cakeDay}</div>
                            <div class="user-profile-stat-label">Cake Day</div>
                        </div>
                    </div>
                </div>
                <div class="user-profile-posts">
                    <h3>Recent Posts</h3>
                    ${postsHTML || '<p>No recent posts found.</p>'}
                </div>
            `;
            
            userProfileBody.querySelectorAll('.user-profile-post').forEach(el => {
                el.addEventListener('click', () => {
                    const story = posts.find(p => p.id === el.dataset.storyId);
                    if (story) {
                        closeUserProfilePopupHandler();
                        if (!allFetchedPosts.some(p => p.id === story.id)) allFetchedPosts.push(story);
                        fetchAndShowComments(story);
                    }
                });
            });
        }
        
        function closeUserProfilePopupHandler() {
            userProfileOverlay.classList.remove('active');
            if(!popupOverlay.classList.contains('active')) document.body.style.overflow = 'auto';
        }
        
        function getStoryNotes() {
            return JSON.parse(localStorage.getItem(STORY_NOTES_KEY)) || {};
        }

        function getStoryNote(storyId) {
            return getStoryNotes()[storyId] || '';
        }

        function saveStoryNote() {
            if (!currentStoryId) return;
            const notes = getStoryNotes();
            notes[currentStoryId] = savedStoryNotes.value;
            localStorage.setItem(STORY_NOTES_KEY, JSON.stringify(notes));
        }

        function handleAddTag(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = addTagInput.value.trim().toLowerCase();
                if (tag && currentStoryId) {
                    addTagToStory(currentStoryId, tag);
                    addTagInput.value = '';
                }
            }
        }

        function addTagToStory(storyId, tag) {
            let savedStories = getSavedStories();
            const story = savedStories.find(s => s.id === storyId);
            if (story) {
                if (!story.tags) story.tags = [];
                if (!story.tags.includes(tag)) {
                    story.tags.push(tag);
                    localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(savedStories));
                    renderStoryTags(storyId);
                }
            }
        }

        function removeTagFromStory(storyId, tag) {
            let savedStories = getSavedStories();
            const story = savedStories.find(s => s.id === storyId);
            if (story && story.tags) {
                story.tags = story.tags.filter(t => t !== tag);
                localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(savedStories));
                renderStoryTags(storyId);
            }
        }

        function renderStoryTags(storyId) {
            const story = getSavedStories().find(s => s.id === storyId);
            storyTags.innerHTML = '';
            if (story && story.tags) {
                story.tags.forEach(tag => {
                    const tagEl = document.createElement('span');
                    tagEl.className = 'story-tag';
                    tagEl.dataset.tag = tag;
                    tagEl.innerHTML = `${tag} <span class="remove-tag" title="Remove tag">&times;</span>`;
                    storyTags.appendChild(tagEl);
                });
            }
        }

        function renderTagFilters() {
            const allTags = new Set(getSavedStories().flatMap(story => story.tags || []));
            tagsContainer.innerHTML = '';
            if (allTags.size > 0) {
                savedTagsFilter.style.display = 'block';
                const allBtn = document.createElement('button');
                allBtn.className = 'tag-filter-button';
                allBtn.textContent = 'All';
                if (activeTagFilter === null) allBtn.classList.add('active');
                allBtn.onclick = () => { activeTagFilter = null; displaySavedStories(); };
                tagsContainer.appendChild(allBtn);
                [...allTags].sort().forEach(tag => {
                    const tagBtn = document.createElement('button');
                    tagBtn.className = 'tag-filter-button';
                    tagBtn.textContent = tag;
                    if (tag === activeTagFilter) tagBtn.classList.add('active');
                    tagBtn.onclick = () => { activeTagFilter = activeTagFilter === tag ? null : tag; displaySavedStories(); };
                    tagsContainer.appendChild(tagBtn);
                });
            } else {
                savedTagsFilter.style.display = 'none';
            }
        }

        function getReadingPositions() {
            return JSON.parse(localStorage.getItem(READING_POSITION_KEY)) || {};
        }

        function saveReadingPosition() {
            if (!currentStoryId) return;
            const positions = getReadingPositions();
            positions[currentStoryId] = popupBody.scrollTop;
            localStorage.setItem(READING_POSITION_KEY, JSON.stringify(positions));
        }

        function restoreReadingPosition(storyId) {
            const savedPosition = getReadingPositions()[storyId];
            if (savedPosition) {
                setTimeout(() => { popupBody.scrollTop = savedPosition; }, 100);
            }
        }

        function generateWordCloud(story) {
            wordCloudContainer.innerHTML = '<div class="spinner"></div>';
            wordCloudOverlay.classList.add('active');
            setTimeout(() => {
                try {
                    const allText = [...popupBody.querySelectorAll('.comment-body')].map(node => node.innerText).join(' ');
                    if (allText.trim().length === 0) {
                        wordCloudContainer.innerHTML = '<p>Not enough comment text to generate a word cloud.</p>';
                        return;
                    }
                    drawWordCloud(processTextForWordCloud(allText));
                } catch (error) {
                    console.error("Word cloud generation failed:", error);
                    wordCloudContainer.innerHTML = '<p>Sorry, the word cloud could not be generated.</p>';
                }
            }, 50);
        }
        
        function processTextForWordCloud(text) {
             const stopWords = new Set(["i","me","my","myself","we","our","ours","ourselves","you","your","yours","yourself","yourselves","he","him","his","himself","she","her","hers","herself","it","its","itself","they","them","their","theirs","themselves","what","which","who","whom","this","that","these","those","am","is","are","was","were","be","been","being","have","has","had","having","do","does","did","doing","a","an","the","and","but","if","or","because","as","until","while","of","at","by","for","with","about","against","between","into","through","during","before","after","above","below","to","from","up","down","in","out","on","off","over","under","again","further","then","once","here","there","when","where","why","how","all","any","both","each","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","s","t","can","will","just","don","should","now",""]);
            const counts = {};
            const words = text.toLowerCase().match(/\b\w+/g) || [];
            words.forEach(word => {
                if (!stopWords.has(word) && isNaN(word)) counts[word] = (counts[word] || 0) + 1;
            });
            return Object.entries(counts).map(([text, size]) => ({ text, size })).sort((a, b) => b.size - a.size).slice(0, 150);
        }

        function drawWordCloud(words) {
            wordCloudContainer.innerHTML = '';
            const width = wordCloudContainer.clientWidth;
            const height = 400;
            const isDarkTheme = document.body.classList.contains('dark');
            const colorScale = d3.scaleOrdinal(isDarkTheme ? ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"] : d3.schemeCategory10);
            const layout = d3.layout.cloud().size([width, height]).words(words.map(d => ({ text: d.text, size: 10 + Math.sqrt(d.size) * 7 }))).padding(5).rotate(() => (Math.random() > 0.85 ? 90 : 0)).font(window.getComputedStyle(document.body).fontFamily).fontSize(d => d.size).on("end", draw);
            layout.start();
            function draw(words) {
                d3.select(wordCloudContainer).append("svg").attr("width", layout.size()[0]).attr("height", layout.size()[1]).append("g").attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")").selectAll("text").data(words).enter().append("text").style("font-size", d => d.size + "px").style("font-family", window.getComputedStyle(document.body).fontFamily).style("fill", (d, i) => colorScale(i)).attr("text-anchor", "middle").attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`).text(d => d.text);
            }
        }

        function toggleLiveComments(e) {
            const btn = e.target;
            if (liveCommentsInterval) {
                clearInterval(liveCommentsInterval);
                liveCommentsInterval = null;
                btn.classList.remove('active');
                btn.textContent = 'Live Comments';
                showToast('Live comments stopped.');
            } else {
                fetchNewComments();
                liveCommentsInterval = setInterval(fetchNewComments, 30000);
                btn.classList.add('active');
                btn.textContent = 'Live (Stop)';
                showToast('Live comments started. New comments will be highlighted.');
            }
        }

        async function fetchNewComments() {
            if (!currentStoryId) return;
            const story = allFetchedPosts.find(p => p.id === currentStoryId) || getHistory().find(p => p.id === currentStoryId) || getSavedStories().find(p => p.id === currentStoryId);
            if (!story) return;

            try {
                const response = await fetch(`${REDDIT_BASE_URL}r/${story.subreddit}/comments/${story.id}.json?sort=new&limit=25`);
                if (!response.ok) return;
                const data = await response.json();
                const newComments = data[1].data.children.filter(c => c.kind === 't1');
                const commentSection = document.getElementById('comment-section');
                if (!commentSection) return;

                const existingCommentIds = new Set([...commentSection.querySelectorAll('.comment-card')].map(c => c.dataset.commentId));
                const uniqueNewComments = newComments.filter(c => !existingCommentIds.has(c.data.id));

                if (uniqueNewComments.length > 0) {
                    const opAuthor = commentSection.dataset.opAuthor;
                    const commentsHTML = uniqueNewComments.map(c => c.data).map(c => {
                        const isOp = c.author === opAuthor;
                        return `<div class="comment-card ${isOp ? 'op-comment' : ''} new-comment-highlight" data-comment-id="${c.id}" data-comment-author="${c.author}"><p class="comment-author"><span class="collapse-comment">[–]</span><a href="#" class="author-link">u/${c.author}</a> ${isOp ? '<span class="op-label">OP</span>' : ''}</p><div class="comment-body markdown-content">${renderMarkdown(c.body)}</div></div>`
                    }).join('');
                    commentSection.insertAdjacentHTML('afterbegin', commentsHTML);
                }
            } catch(e) {
                console.error("Failed to fetch live comments:", e);
            }
        }
        
        function handleQuickLook(e) {
            const card = e.target.closest('.story-card');
            if (card) {
                clearTimeout(quickLookTimeout);
                quickLookTimeout = setTimeout(() => {
                    showQuickLook(card);
                    positionQuickLook(e);
                }, 300);
            }
        }
        
        function showQuickLook(card) {
            const storyId = card.dataset.storyId;
            const story = allFetchedPosts.find(p => p.id === storyId);
            if (!story || !story.selftext) return;
            quickLookPopup.innerHTML = `<h4>${story.title}</h4><p>${story.selftext}</p>`;
            quickLookPopup.classList.add('visible');
        }

        function hideQuickLook() {
            clearTimeout(quickLookTimeout);
             quickLookPopup.classList.remove('visible');
        }

        function positionQuickLook(e) {
            const offsetX = 20;
            const offsetY = 20;
            let x = e.clientX + offsetX;
            let y = e.clientY + offsetY;
            if (x + quickLookPopup.offsetWidth > window.innerWidth) x = e.clientX - quickLookPopup.offsetWidth - offsetX;
            if (y + quickLookPopup.offsetHeight > window.innerHeight) y = e.clientY - quickLookPopup.offsetHeight - offsetY;
            quickLookPopup.style.left = `${x}px`;
            quickLookPopup.style.top = `${y}px`;
        }
        
        function showApiKeyModal() {
            return new Promise((resolve, reject) => {
                apiKeyPromiseResolve = resolve;
                apiKeyPromiseReject = reject;
                apiKeyInput.value = '';
                apiKeyOverlay.classList.add('active');
            });
        }

        function hideApiKeyModal(isRejected = false) {
            apiKeyOverlay.classList.remove('active');
            if (isRejected && apiKeyPromiseReject) apiKeyPromiseReject(new Error("API Key not provided."));
            apiKeyPromiseResolve = null;
            apiKeyPromiseReject = null;
        }

        function handleSaveApiKey() {
            const key = apiKeyInput.value.trim();
            if (key) {
                localStorage.setItem('geminiApiKey', key);
                if (apiKeyPromiseResolve) apiKeyPromiseResolve(key);
                hideApiKeyModal();
                showToast("API Key saved successfully!");
            } else {
                showToast("Please enter a valid API Key.");
            }
        }

        async function getGeminiApiKey() {
            let key = localStorage.getItem('geminiApiKey');
            if (!key) {
                key = await showApiKeyModal();
            }
            return key;
        }
        
        async function fetchWithBackoff(url, options, maxRetries = 5) {
            let lastError;
            for (let i = 0; i < maxRetries; i++) {
                try {
                    const response = await fetch(url, options);
                    if (response.status === 429) {
                        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                        console.warn(`Rate limited. Retrying in ${delay}ms...`);
                        lastError = new Error(`API rate limit exceeded`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    return response;
                } catch (e) {
                    lastError = e;
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    console.warn(`Fetch failed. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            throw new Error(`Failed to fetch after ${maxRetries} retries. Last error: ${lastError ? lastError.message : 'Unknown error'}`);
        }

        async function callGeminiAPI(prompt, model = 'gemini-2.5-flash-preview-05-20') {
            try {
                const apiKey = await getGeminiApiKey();
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                const response = await fetchWithBackoff(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) {
                    const errorBody = await response.json();
                    console.error("Gemini API Error:", errorBody);
                    if (response.status === 400 || response.status === 403) { 
                        localStorage.removeItem('geminiApiKey'); 
                        throw new Error(`API Error: Invalid API key. Please check your key and try again.`);
                    }
                     if (response.status === 404) {
                        throw new Error(`API Error: Model not found. Please check the model name.`);
                    }
                    throw new Error(`API Error: ${errorBody.error.message}`);
                }
                const result = await response.json();
                const candidate = result.candidates?.[0];
                if (candidate && candidate.content?.parts?.[0]?.text) {
                    return candidate.content.parts[0].text;
                } else {
                    console.warn("Unexpected API response structure:", result);
                    if (candidate && candidate.finishReason !== 'STOP') throw new Error(`Generation stopped for reason: ${candidate.finishReason}`);
                    throw new Error("Invalid response structure from API.");
                }
            } catch (error) {
                console.error("Error calling Gemini API:", error);
                showToast(error.message);
                throw error; 
            }
        }
        
        async function streamGeminiAPI(prompt, onChunk) {
            let fullText = "";
            try {
                const apiKey = await getGeminiApiKey();
                const model = 'gemini-2.5-flash-preview-05-20';
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                const response = await fetchWithBackoff(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) {
                    const errorBody = await response.json();
                    console.error("Gemini API Error:", errorBody);
                    if (response.status === 400 || response.status === 403) { 
                        localStorage.removeItem('geminiApiKey'); 
                        throw new Error(`API Error: Invalid API key. Please check your key and try again.`);
                    }
                    if (response.status === 404) throw new Error(`API Error: Model not found. Please check the model name.`);
                    throw new Error(`API Error: ${errorBody.error.message}`);
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    const lines = decoder.decode(value, { stream: true }).split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6).trim();
                            if (data) {
                                try {
                                    const json = JSON.parse(data);
                                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                                    if (text) {
                                        fullText += text;
                                        onChunk(text);
                                    }
                                } catch (e) {
                                    console.log("Failed to parse stream data:", data);
                                }
                            }
                        }
                    }
                }
                return fullText;
            } catch (error) {
                console.error("Error in streaming Gemini API call:", error);
                showToast(error.message);
                throw error;
            }
        }

        async function handleSummarize(story, mode = 'summarize') {
            const button = document.getElementById(mode === 'summarize' ? 'summarize-button' : 'eli5-button');
            const storyContentWrapper = document.getElementById('story-content-wrapper');
            const titleText = mode === 'summarize' ? 'AI Summary' : 'Explained Like You\'re 5';
            const buttonText = mode === 'summarize' ? 'Summarize' : 'ELI5';
            if (!story.selftext) {
                showToast("This story has no text to process.");
                return;
            }
            if (button.textContent === 'Show Original') {
                storyContentWrapper.innerHTML = originalStoryContent;
                originalStoryContent = null;
                button.textContent = buttonText;
                return;
            }
            const cachedResult = (mode === 'summarize') ? currentStorySummary : currentStoryELI5;
            if (cachedResult) {
                if (!originalStoryContent) originalStoryContent = storyContentWrapper.innerHTML;
                const outputContainer = document.createElement('div');
                outputContainer.className = 'ai-output-box';
                outputContainer.innerHTML = `<h4>${titleText}</h4><div class="markdown-content">${renderMarkdown(cachedResult)}</div>`;
                storyContentWrapper.innerHTML = '';
                storyContentWrapper.appendChild(outputContainer);
                button.textContent = 'Show Original';
                return;
            }

            button.disabled = true;
            button.textContent = 'Generating...';
            originalStoryContent = storyContentWrapper.innerHTML;

            const outputContainer = document.createElement('div');
            outputContainer.className = 'ai-output-box';
            outputContainer.innerHTML = `<h4>${titleText}</h4><div class="markdown-content" id="live-ai-content"></div>`;
            storyContentWrapper.innerHTML = '';
            storyContentWrapper.appendChild(outputContainer);

            const liveContent = document.getElementById('live-ai-content');
            let fullText = "";
            let prompt = mode === 'summarize'
                ? `Summarize the following story in a single, well-written paragraph. Be concise and capture the main points:\n\n---\n\n${story.selftext}`
                : `Explain the following text like I'm 5 years old. Use simple words and short sentences:\n\n---\n\n${story.selftext}`;
            try {
                await streamGeminiAPI(prompt, (chunk) => {
                    fullText += chunk;
                    liveContent.innerHTML = renderMarkdown(fullText + '...');
                });
                liveContent.innerHTML = renderMarkdown(fullText);
                button.textContent = 'Show Original';
                if (mode === 'summarize') currentStorySummary = fullText;
                else currentStoryELI5 = fullText;
            } catch (error) {
                storyContentWrapper.innerHTML = originalStoryContent;
                originalStoryContent = null;
                showToast(`Sorry, the output could not be generated. ${error.message}`);
            } finally {
                button.disabled = false;
                if(storyContentWrapper.innerHTML.includes('live-ai-content') && button.textContent !== 'Show Original') {
                     button.textContent = buttonText;
                }
            }
        }

        async function handleStoryContinuation(story) {
            const button = document.getElementById('continue-story-button');
            button.disabled = true;
            button.textContent = 'Writing...';
            const storyContent = document.querySelector('#story-content-wrapper .markdown-content');
            const continuationContainer = document.createElement('div');
            continuationContainer.className = 'ai-output-box continuation';
            continuationContainer.innerHTML = `<h4>AI Continuation...</h4><div id="live-continuation-content"></div>`;
            storyContent.appendChild(document.createElement('hr'));
            storyContent.appendChild(continuationContainer);
            const liveContent = document.getElementById('live-continuation-content');
            let fullText = "";
            const prompt = `This is a story from a creative writing prompt. Continue the story for another 2-3 paragraphs in the same style and tone. Do not add a title or any introductory text. Here is the story so far:\n\n---\n\n${story.selftext}`;
            try {
                await streamGeminiAPI(prompt, (chunk) => {
                    fullText += chunk;
                    liveContent.innerHTML = renderMarkdown(fullText + '...');
                });
                liveContent.innerHTML = renderMarkdown(fullText);
            } catch (error) {
                 showToast(`Sorry, the story continuation could not be generated. ${error.message}`);
                 continuationContainer.remove();
            } finally {
                button.style.display = 'none';
            }
        }

        async function handleTranslation(story, language) {
            const storyContentWrapper = document.getElementById('story-content-wrapper');
            const translationSelect = document.getElementById('translation-select');
            if (!language) {
                if (originalStoryContent) {
                    storyContentWrapper.innerHTML = originalStoryContent;
                    originalStoryContent = null;
                }
                const summarizeButton = document.getElementById('summarize-button');
                const eli5Button = document.getElementById('eli5-button');
                if(summarizeButton) summarizeButton.textContent = 'Summarize';
                if(eli5Button) eli5Button.textContent = 'ELI5';
                currentStorySummary = null;
                currentStoryELI5 = null;
                return;
            }
            if (currentStoryTranslations[language]) {
                if (!originalStoryContent) originalStoryContent = storyContentWrapper.innerHTML;
                const mediaElementHTML = originalStoryContent.match(/<div class="popup-media">.*?<\/div>/s)?.[0] || '';
                storyContentWrapper.innerHTML = `${mediaElementHTML}<div class="ai-output-box"><h4>Translated to ${language}</h4><div class="markdown-content">${renderMarkdown(currentStoryTranslations[language])}</div></div>`;
                return;
            }
            if (!story.selftext) {
                showToast("This story has no text to translate.");
                translationSelect.value = '';
                return;
            }
            if (!originalStoryContent) originalStoryContent = storyContentWrapper.innerHTML;
            storyContentWrapper.innerHTML = '<div class="spinner"></div>';
            translationSelect.disabled = true;
            try {
                const prompt = `Translate the following Reddit story text to ${language}. Preserve the original tone and formatting as much as possible. Return only the translated text, without any introductory phrases or extra explanations:\n\n---\n\n${story.selftext}`;
                const translation = await callGeminiAPI(prompt);
                currentStoryTranslations[language] = translation;
                const mediaElementHTML = originalStoryContent.match(/<div class="popup-media">.*?<\/div>/s)?.[0] || '';
                storyContentWrapper.innerHTML = `${mediaElementHTML}<div class="ai-output-box"><h4>Translated to ${language}</h4><div class="markdown-content">${renderMarkdown(translation)}</div></div>`;
            } catch (error) {
                if(originalStoryContent) storyContentWrapper.innerHTML = originalStoryContent;
                showToast(`Sorry, the translation could not be generated. ${error.message}`);
            } finally {
                translationSelect.disabled = false;
                if(storyContentWrapper.innerHTML.includes('<div class="spinner">')) translationSelect.value = '';
            }
        }

        function groupTextIntoChunks(text, chunkSize = 1500) {
            const sentences = text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [];
            const chunks = [];
            let currentChunk = "";
            for (const sentence of sentences) {
                if (currentChunk.length + sentence.length > chunkSize) {
                    chunks.push(currentChunk);
                    currentChunk = sentence;
                } else {
                    currentChunk += sentence;
                }
            }
            if (currentChunk) chunks.push(currentChunk);
            return chunks;
        }

        async function fetchAndDecodeAudio(text, audioCtx) {
            try {
                const apiKey = await getGeminiApiKey();
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
                const payload = { contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"] }, model: "gemini-2.5-flash-preview-tts" };
                const response = await fetchWithBackoff(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) {
                    if (response.status === 429) throw new Error('API rate limit exceeded');
                    throw new Error('Failed to generate audio chunk.');
                }
                const result = await response.json();
                const part = result?.candidates?.[0]?.content?.parts?.[0];
                const audioData = part?.inlineData?.data;
                const mimeType = part?.inlineData?.mimeType;
                if (audioData && mimeType?.startsWith("audio/")) {
                    const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)[1], 10);
                    const pcmData = base64ToArrayBuffer(audioData);
                    const pcm16 = new Int16Array(pcmData);
                    const wavBlob = pcmToWav(pcm16, sampleRate);
                    return await audioCtx.decodeAudioData(await wavBlob.arrayBuffer());
                } else {
                    throw new Error("No audio data in API response.");
                }
            } catch (error) {
                console.error("Audio fetch/decode error:", error);
                showToast("Failed to process an audio segment.");
                stopNarration();
                throw error;
            }
        }
        
        function scheduleNextBuffer() {
            if (!isNarrationPlaying || isNarrationPaused || audioBufferQueue.length === 0) {
                if (isNarrationPlaying && audioBufferQueue.length === 0) stopNarration();
                return;
            }
            const audioBuffer = audioBufferQueue.shift();
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            const speed = document.getElementById('narration-speed-select')?.value || 1;
            source.playbackRate.value = parseFloat(speed);
            const now = audioContext.currentTime;
            nextScheduleTime = Math.max(now, nextScheduleTime);
            source.start(nextScheduleTime);
            activeSourceNodes.push(source);
            source.onended = () => {
                activeSourceNodes = activeSourceNodes.filter(s => s !== source);
                scheduleNextBuffer();
            };
            nextScheduleTime += audioBuffer.duration / source.playbackRate.value;
        }
        
        async function handleNarration(story) {
            const narrateButton = document.getElementById('narrate-button');
            const stopButton = document.getElementById('stop-narration-button');
            if (isNarrationPlaying && !isNarrationPaused) {
                if (audioContext) audioContext.suspend();
                isNarrationPaused = true;
                narrateButton.textContent = 'Resume';
                return;
            }
            if (isNarrationPlaying && isNarrationPaused) {
                if (audioContext) audioContext.resume();
                isNarrationPaused = false;
                narrateButton.textContent = 'Pause';
                return;
            }
            if (!story.selftext) {
                showToast("This story has no text to narrate.");
                return;
            }
            narrateButton.disabled = true;
            narrateButton.textContent = 'Generating...';
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                nextScheduleTime = audioContext.currentTime;
                isNarrationPlaying = true;
                isNarrationPaused = false;
                if (narrationAudioCache[story.id]) {
                    audioBufferQueue = [...narrationAudioCache[story.id]];
                } else {
                    const textToNarrate = `Title: ${story.title}. By user ${story.author}. ${story.selftext}`;
                    const chunks = groupTextIntoChunks(textToNarrate, 1500);
                    if (chunks.length === 0) throw new Error("No text found to narrate.");
                    const allBuffers = await Promise.all(chunks.map(chunk => fetchAndDecodeAudio(chunk, audioContext)));
                    audioBufferQueue = allBuffers.filter(b => b);
                    narrationAudioCache[story.id] = [...audioBufferQueue];
                }
                if (audioBufferQueue.length > 0) {
                    narrateButton.disabled = false;
                    narrateButton.textContent = 'Pause';
                    stopButton.style.display = 'inline-block';
                    scheduleNextBuffer();
                } else {
                    throw new Error("Could not generate or find cached audio.");
                }
            } catch (error) {
                console.error("Narration failed to start:", error);
                showToast(`Could not initialize narration: ${error.message}`);
                stopNarration();
            }
        }
        
        function debounce(func, delay) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        }
        
        function base64ToArrayBuffer(base64) {
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
            return bytes.buffer;
        }

        function pcmToWav(pcmData, sampleRate) {
            const buffer = new ArrayBuffer(44 + pcmData.length * 2);
            const view = new DataView(buffer);
            writeString(view, 0, 'RIFF');
            view.setUint32(4, 36 + pcmData.length * 2, true);
            writeString(view, 8, 'WAVE');
            writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, 1, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true);
            view.setUint16(32, 2, true);
            view.setUint16(34, 16, true);
            writeString(view, 36, 'data');
            view.setUint32(40, pcmData.length * 2, true);
            for (let i = 0; i < pcmData.length; i++) view.setInt16(44 + i * 2, pcmData[i], true);
            return new Blob([view], { type: 'audio/wav' });
        }

        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
        }

        async function getCommentSentiment(story) {
            if (!story) return;
            const badge = document.querySelector(`.sentiment-badge[data-story-id="${story.id}"]`);
            if (!badge || badge.textContent) return;
            badge.textContent = '...';
            if (sentimentCache[story.id]) {
                displaySentimentBadge(story.id, sentimentCache[story.id]);
                return;
            }
            sentimentCache[story.id] = 'loading'; 
            try {
                const commentsUrl = `${REDDIT_BASE_URL}r/${story.subreddit}/comments/${story.id}.json?sort=confidence&limit=15`;
                const data = await fetchWithCache(commentsUrl); // Use cache
                const comments = data[1].data.children.filter(c => c.kind === 't1').map(c => c.data.body);
                if (comments.length < 3) {
                    sentimentCache[story.id] = 'neutral';
                    displaySentimentBadge(story.id, 'neutral');
                    return; 
                }
                const commentsText = comments.slice(0, 10).join('\n\n---\n\n');
                const prompt = `Analyze the sentiment of the following Reddit comments. Respond with only a single word from this list: Positive, Negative, Mixed, Debate, or Neutral. Do not add explanations or punctuation.\n\n### Comments:\n\n${commentsText}`;
                let sentiment = await callGeminiAPI(prompt);
                sentiment = sentiment.trim().toLowerCase().replace(/[^a-z]/g, '');
                const validSentiments = ['positive', 'negative', 'mixed', 'debate', 'neutral'];
                if (!validSentiments.includes(sentiment)) sentiment = 'neutral';
                sentimentCache[story.id] = sentiment;
                displaySentimentBadge(story.id, sentiment);
            } catch (error) {
                console.error(`Could not get sentiment for story ${story.id}:`, error);
                delete sentimentCache[story.id];
                if(badge) badge.textContent = '';
            }
        }

        function displaySentimentBadge(storyId, sentiment) {
            const badge = document.querySelector(`.sentiment-badge[data-story-id="${storyId}"]`);
            if (badge) {
                badge.textContent = sentiment;
                badge.className = 'sentiment-badge';
                badge.classList.add(`sentiment-${sentiment}`, 'visible');
            }
        }
    } catch (e) {
        console.error("An error occurred during page initialization:", e);
        document.body.innerHTML = "<h1>A critical error occurred. Please refresh the page.</h1>";
    }
});