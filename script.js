document.addEventListener('DOMContentLoaded', () => {
    try {
        // --- DOM Elements ---
        const fetchButton = document.getElementById('fetch-button');
        const randomButton = document.getElementById('random-button');
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
        const controlsSection = document.querySelector('.controls');
        const clearSavedButton = document.getElementById('clear-saved-button');
        const exportSavedButton = document.getElementById('export-saved-button');
        const importSavedButton = document.getElementById('import-saved-button');
        const importFileInput = document.getElementById('import-file-input');
        const clearSavedContainer = document.getElementById('clear-saved-container');
        const flairFilterInput = document.getElementById('flair-filter-input');
        const filterSection = document.getElementById('filter-section');
        const savedSortSection = document.getElementById('saved-sort-section');
        const savedSortSelect = document.getElementById('saved-sort-select');
        const historySortSection = document.getElementById('history-sort-section');
        const historySortSelect = document.getElementById('history-sort-select');
        const clearHistoryContainer = document.getElementById('clear-history-container');
        const clearHistoryButton = document.getElementById('clear-history-button');
        const toastNotification = document.getElementById('toast-notification');
        const layoutToggleButton = document.getElementById('layout-toggle-button');
        const galleryToggleButton = document.getElementById('gallery-toggle-button');
        const layoutIconGrid = document.getElementById('layout-icon-grid');
        const layoutIconList = document.getElementById('layout-icon-list');
        const nsfwToggle = document.getElementById('nsfw-toggle');
        const infiniteScrollLoader = document.getElementById('infinite-scroll-loader');

        // --- Constants & State ---
        const REDDIT_API_BASE_URL = 'https://www.reddit.com/r/';
        const SAVED_STORIES_KEY = 'redditStorytellerSaved';
        const READ_HISTORY_KEY = 'redditStorytellerHistory';
        const SUBREDDIT_HISTORY_KEY = 'redditSubredditHistory';
        const LAYOUT_PREFERENCE_KEY = 'redditStorytellerLayout';
        const GALLERY_PREFERENCE_KEY = 'redditStorytellerGallery';
        const NSFW_PREFERENCE_KEY = 'redditStorytellerNSFW';
        const READING_SETTINGS_KEY = 'redditStorytellerReading';
        const RANDOM_SUBREDDITS = ['nosleep', 'LetsNotMeet', 'glitch_in_the_matrix', 'tifu', 'confession', 'maliciouscompliance', 'talesfromtechsupport', 'WritingPrompts', 'shortscarystories', 'UnresolvedMysteries'];
        
        let currentView = 'browsing'; // browsing, saved, history
        let currentAfterToken = null;
        let allFetchedPosts = [];
        let currentSearchQuery = '';
        let isLoadingMore = false;
        let currentStoryId = null;

        // --- Initialization ---
        const savedTheme = localStorage.getItem('theme') || 'light';
        const savedLayout = localStorage.getItem(LAYOUT_PREFERENCE_KEY) || 'grid';
        const savedNSFWPreference = localStorage.getItem(NSFW_PREFERENCE_KEY) === 'true';
        
        applyTheme(savedTheme);
        applyLayout(savedLayout);
        applyNSFWPreference(savedNSFWPreference);
        applyReadingSettings();
        populateSubredditHistory();
        
        const initialSubreddit = RANDOM_SUBREDDITS[Math.floor(Math.random() * RANDOM_SUBREDDITS.length)];
        subredditInput.value = initialSubreddit;
        fetchStories(initialSubreddit, 'hot', 'all', false);

        // --- Event Listeners ---
        themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
        layoutToggleButton.addEventListener('click', handleLayoutToggle);
        galleryToggleButton.addEventListener('click', handleGalleryToggle);
        nsfwToggle.addEventListener('change', () => applyNSFWPreference(nsfwToggle.checked, true));
        fetchButton.addEventListener('click', () => switchToView('browsing', { refresh: true }));
        randomButton.addEventListener('click', handleRandomClick);
        sortSelect.addEventListener('change', handleSortChange);
        viewSavedButton.addEventListener('click', () => switchToView('saved'));
        viewHistoryButton.addEventListener('click', () => switchToView('history'));
        clearSavedButton.addEventListener('click', handleClearSaved);
        clearHistoryButton.addEventListener('click', handleClearHistory);
        exportSavedButton.addEventListener('click', handleExportSaved);
        importSavedButton.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', handleImportFile);
        savedSortSelect.addEventListener('change', displaySavedStories);
        historySortSelect.addEventListener('change', displayHistory);
        flairFilterInput.addEventListener('input', () => renderFilteredStories());
        closePopupButton.addEventListener('click', closePopup);
        popupOverlay.addEventListener('click', (e) => e.target === popupOverlay && closePopup());
        window.addEventListener('scroll', handleScroll);
        backToTopButton.addEventListener('click', scrollToTop);
        document.addEventListener('keydown', handleKeyboardNav);
        popupBody.addEventListener('click', handlePopupBodyClick);

        // --- Main View Controller ---
        function switchToView(view, options = {}) {
            if (view === currentView && view !== 'browsing') {
                switchToView('browsing', { refresh: true });
                return;
            }

            currentView = view;
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Hide all view-specific sections
            [controlsSection, filterSection, savedSortSection, clearSavedContainer, historySortSection, clearHistoryContainer].forEach(el => el.style.display = 'none');
            [viewSavedButton, viewHistoryButton].forEach(btn => btn.classList.remove('active'));

            if (view === 'browsing') {
                controlsSection.style.display = 'flex';
                viewSavedButton.textContent = 'Saved Stories';
                viewHistoryButton.textContent = 'History';
                if (options.refresh) {
                    const subreddit = subredditInput.value.trim();
                    const sort = sortSelect.value;
                    const timeRange = timeRangeSelect.value;
                    currentSearchQuery = searchInput.value.trim();
                    if (subreddit) {
                        fetchStories(subreddit, sort, timeRange, false, currentSearchQuery);
                    } else {
                        showErrorPopup("Please enter a subreddit name.");
                    }
                }
            } else if (view === 'saved') {
                savedSortSection.style.display = 'flex';
                viewSavedButton.textContent = 'Back to Browsing';
                viewSavedButton.classList.add('active');
                viewHistoryButton.textContent = 'History';
                displaySavedStories();
            } else if (view === 'history') {
                historySortSection.style.display = 'flex';
                viewHistoryButton.textContent = 'Back to Browsing';
                viewHistoryButton.classList.add('active');
                viewSavedButton.textContent = 'Saved Stories';
                displayHistory();
            }
        }

        // --- Functions ---
        function applyTheme(theme) {
            document.body.className = '';
            if (theme !== 'light') document.body.classList.add(theme);
            localStorage.setItem('theme', theme);
            themeSelect.value = theme;
        }
        
        function applyLayout(layout) {
            storyContainer.classList.remove('list-view', 'gallery-view');
            
            if (layout === 'list') {
                storyContainer.classList.add('list-view');
                layoutIconGrid.style.display = 'none';
                layoutIconList.style.display = 'block';
            } else { // Grid is default
                storyContainer.classList.remove('list-view');
                layoutIconGrid.style.display = 'block';
                layoutIconList.style.display = 'none';
            }
             localStorage.setItem(LAYOUT_PREFERENCE_KEY, layout);
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
            if (shouldRender) {
                renderFilteredStories();
            }
        }
        
        function handleLayoutToggle() {
            const isListView = storyContainer.classList.contains('list-view');
            applyLayout(isListView ? 'grid' : 'list');
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
            switchToView('browsing', { refresh: true });
        }

        function handleLoadMore() {
            const subreddit = subredditInput.value.trim();
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

        function closePopup() {
            window.speechSynthesis.cancel();
            popupOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            const video = popupBody.querySelector('video');
            if (video) video.pause();
        }

        function handleScroll() {
            const shouldShow = document.body.scrollTop > 100 || document.documentElement.scrollTop > 100;
            backToTopButton.style.display = shouldShow ? "flex" : "none";
            
            if (!isLoadingMore && currentView === 'browsing' && currentAfterToken) {
                 if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                    handleLoadMore();
                }
            }
        }

        function scrollToTop() {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
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

        async function fetchStories(subreddit, sort, timeRange = 'all', loadMore = false, query = '') {
            if (isLoadingMore) return;
            isLoadingMore = true;

            if (!loadMore) {
                if (!subreddit.includes('+') && !query.toLowerCase().startsWith('author:')) saveSubredditToHistory(subreddit);
                allFetchedPosts = [];
                currentAfterToken = null;
                flairFilterInput.value = '';
                storyContainer.innerHTML = '';
            }
            
            showLoading(true, loadMore);
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
            currentStoryId = story.id;
            addStoryToHistory(story);
            const storyCard = storyContainer.querySelector(`.story-card[data-story-id="${story.id}"]`);
            if(storyCard) storyCard.classList.add('read');

            popupTitle.textContent = story.title;
            const header = popupTitle.parentElement;
            
            popupControls.innerHTML = `
                <div class="popup-actions-left">
                    <button id="read-aloud-button" class="action-button secondary">Read Aloud</button>
                    <button id="stop-reading-button" class="action-button" style="display:none;">Stop</button>
                </div>
                <div class="popup-actions-right">
                     <div class="reading-controls">
                        <span>Font Size:</span>
                        <button id="font-size-down" class="icon-button" title="Decrease Font Size">A-</button>
                        <button id="font-size-up" class="icon-button" title="Increase Font Size">A+</button>
                    </div>
                    <div class="reading-controls">
                        <span>Line Height:</span>
                        <button id="line-height-down" class="icon-button" title="Decrease Line Height"> Less</button>
                        <button id="line-height-up" class="icon-button" title="Increase Line Height">More</button>
                    </div>
                     <div class="comment-sort-controls">
                        <label for="comment-sort-select">Sort Comments:</label>
                        <select id="comment-sort-select" class="dropdown-input">
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
            
            let headerActions = header.querySelector('.popup-header-actions');
            if (!headerActions) {
                headerActions = document.createElement('div');
                headerActions.className = 'popup-header-actions';
                header.insertBefore(headerActions, closePopupButton);
            }
            headerActions.innerHTML = '';
            
            const redditLink = `https://www.reddit.com${story.permalink}`;
            
            const shareBtn = document.createElement('button');
            shareBtn.className = 'icon-button';
            shareBtn.title = 'Copy Link';
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
            linkEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
            headerActions.appendChild(linkEl);

            document.body.style.overflow = 'hidden';
            popupOverlay.classList.add('active');
            
            let storyText = story.selftext || '';
            if (currentSearchQuery) {
                storyText = highlightKeywords(storyText, currentSearchQuery);
            }

            let finalContent = createMediaElement(story, true);

            if (story.crosspost_parent_list && story.crosspost_parent_list.length > 0) {
                 finalContent += `<div class="crosspost-info">Cross-posted from <a href="#" onclick="event.preventDefault(); window.open('https://reddit.com/r/${story.crosspost_parent_list[0].subreddit}', '_blank')">r/${story.crosspost_parent_list[0].subreddit}</a></div>`;
            }

            if (storyText) {
                finalContent += `<div class="markdown-content">${renderMarkdown(storyText)}</div>`;
            }
            
            finalContent += `<hr><div id="comment-section" data-op-author="${story.author}"></div>`;
            popupBody.innerHTML = finalContent;
            
            fetchCommentsForCurrentStory('confidence');
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

            try {
                const commentsUrl = `${REDDIT_API_BASE_URL}${story.subreddit}/comments/${story.id}.json?sort=${sort}`;
                const response = await fetch(commentsUrl);
                if (!response.ok) {
                    let errorText = `HTTP error! status: ${response.status}`;
                    if (response.status === 403) {
                        errorText = "Comments for this post are unavailable (possibly due to being from a private or quarantined subreddit)."
                    }
                    throw new Error(errorText);
                }
                const data = await response.json();
                const comments = data[1].data.children;
                
                const currentCommentSection = document.getElementById('comment-section');
                currentCommentSection.innerHTML = `<h4>Comments:</h4>`;
                appendComments(story.name, comments);
            } catch (error) {
                console.error(`Failed to fetch comments sorted by ${sort}:`, error);
                 const currentCommentSection = document.getElementById('comment-section');
                currentCommentSection.innerHTML = `<p>${error.message}</p>`;
            }
        }


        function appendComments(postName, commentData) {
            const commentSection = document.getElementById('comment-section');
            if (!commentSection) return;
            const opAuthor = commentSection.dataset.opAuthor;

            const moreCommentsObject = commentData.find(c => c.kind === 'more');
            const actualComments = commentData.filter(c => c.kind === 't1');

            if (actualComments.length > 0) {
                 const commentsHTML = actualComments.map(c => c.data).filter(c => c.body).map(c => {
                    let commentBody = c.body;
                    if (currentSearchQuery) {
                       commentBody = highlightKeywords(commentBody, currentSearchQuery);
                    }
                    const isOp = c.author === opAuthor;
                    const opClass = isOp ? 'op-comment' : '';
                    const opLabel = isOp ? '<span class="op-label">OP</span>' : '';

                    return `
                    <div class="comment-card ${opClass}" data-comment-author="${c.author}">
                        <p class="comment-author"><span class="collapse-comment">[–]</span>u/${c.author} ${opLabel}</p>
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
                const url = `https://api.reddit.com/api/morechildren.json?api_type=json&link_id=${postName}&children=${ids}`;
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
            const readStories = getHistory().map(h => h.id);

            storyContainer.querySelectorAll('.story-card').forEach(card => {
                const storyId = card.dataset.storyId;
                const story = allFetchedPosts.find(p => p.id === storyId);
                
                if (!story) return;

                const flairMatch = !flairFilter || (story.link_flair_text && story.link_flair_text.toLowerCase().includes(flairFilter));
                card.style.display = flairMatch ? 'flex' : 'none';

                if (readStories.includes(storyId)) {
                    card.classList.add('read');
                } else {
                    card.classList.remove('read');
                }
            });
            
            const isImageHeavy = allFetchedPosts.filter(p => p.post_hint === 'image').length / allFetchedPosts.length > 0.5;
            galleryToggleButton.style.display = isImageHeavy ? 'flex' : 'none';
        }


        function displayStories(stories, options = {}) {
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
                const redditLink = `https://www.reddit.com${story.permalink}`;
                const readingTime = calculateReadingTime(story.selftext);
                const timeAgo = formatTimeAgo(story.created_utc);
                const isSensitive = story.over_18 || story.spoiler;
                
                let readAtTimeHTML = '';
                if (options.isHistoryView && story.readAt) {
                    readAtTimeHTML = `<p class="read-at-time">Read ${formatTimeAgo(new Date(story.readAt).getTime() / 1000)}</p>`;
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

                storyCard.innerHTML += `
                    ${createMediaElement(story, false)}
                    <div class="story-card-content">
                        ${crosspostHTML}
                        <div class="story-meta">
                            <span><svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 12h5v10h10V12h5L12 2z"/></svg>${(story.score || 0).toLocaleString()}</span>
                            <span><svg width="24" height="24" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>${(story.num_comments || 0).toLocaleString()}</span>
                            <span><svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>${timeAgo}</span>
                            ${story.link_flair_text ? `<span class="story-flair">${story.link_flair_text}</span>` : ''}
                        </div>
                        <h3><a href="${redditLink}" target="_blank" rel="noopener noreferrer">${story.title}</a></h3>
                        <p class="author" title="Find all posts by this author">by u/${story.author}</p>
                        ${readAtTimeHTML}
                        <p class="reading-time">${readingTime}</p>
                        <p class="preview">${story.selftext ? story.selftext.substring(0, 150) + '...' : ''}</p>
                        <div class="story-card-actions">
                            <button class="read-button">Read Story</button>
                            <div class="action-buttons">
                                <button class="icon-button share-button" title="Copy Link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                                </button>
                                <a href="${redditLink}" target="_blank" rel="noopener noreferrer" class="icon-button" title="View on Reddit">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </a>
                                <button class="save-button ${isSaved ? 'saved' : ''}">${isSaved ? 'Saved' : 'Save'}</button>
                            </div>
                        </div>
                    </div>`;
                
                storyCard.addEventListener('click', (e) => {
                    if (e.target.closest('button, a, .author, .crosspost-info a')) {
                        return;
                    }
                    fetchAndShowComments(story);
                });

                storyCard.querySelector('.read-button').addEventListener('click', (e) => {
                    e.stopPropagation();
                    fetchAndShowComments(story);
                });

                const authorEl = storyCard.querySelector('.author');
                if(authorEl) {
                    authorEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        handleAuthorClick(story.author);
                    });
                }
                
                const crosspostLink = storyCard.querySelector('.crosspost-info a');
                if (crosspostLink) {
                    crosspostLink.addEventListener('click', (e) => {
                        e.stopPropagation();
                        subredditInput.value = e.target.dataset.subreddit;
                        switchToView('browsing', { refresh: true });
                    });
                }
                
                storyCard.querySelector('.save-button').addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleSaveStory(e, story)
                });
                storyCard.querySelector('.share-button').addEventListener('click', (e) => {
                     e.stopPropagation();
                    navigator.clipboard.writeText(redditLink);
                    showToast('Link copied to clipboard!');
                });
                
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
            return marked.parse(text, { breaks: true });
        }

        // --- Saved & History Functions ---
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
            history = history.slice(0, 200); // Keep history to a reasonable size
            localStorage.setItem(READ_HISTORY_KEY, JSON.stringify(history));
        }

        function isStoryRead(storyId) {
            return getHistory().some(s => s.id === storyId);
        }

        function displayHistory() {
            storyContainer.innerHTML = '';
            
            let history = getHistory();
            const sortMethod = historySortSelect.value;
            
            switch (sortMethod) {
                case 'date-desc':
                    history.sort((a, b) => new Date(b.readAt) - new Date(a.readAt));
                    break;
                case 'date-asc':
                    history.sort((a, b) => new Date(a.readAt) - new Date(b.readAt));
                    break;
                case 'score-desc':
                    history.sort((a, b) => (b.score || 0) - (a.score || 0));
                    break;
                case 'subreddit-az':
                    history.sort((a, b) => a.subreddit.localeCompare(b.subreddit));
                    break;
            }

            storiesHeading.textContent = `You have read ${history.length} stor${history.length === 1 ? 'y' : 'ies'}`;
            
            if (history.length > 0) {
                clearHistoryContainer.style.display = 'flex';
                displayStories(history, { isHistoryView: true });
            } else {
                clearHistoryContainer.style.display = 'none';
                storyContainer.innerHTML = `<p class="empty-state">You haven't read any stories yet.</p>`;
            }
        }
        
        function handleClearHistory() {
            if (confirm("Are you sure you want to clear your reading history? This cannot be undone.")) {
                localStorage.removeItem(READ_HISTORY_KEY);
                displayHistory();
                renderFilteredStories();
            }
        }
        
         function handleClearSaved() {
            if (confirm("Are you sure you want to delete all saved stories? This cannot be undone.")) {
                localStorage.removeItem(SAVED_STORIES_KEY);
                displaySavedStories();
            }
        }

        function toggleSaveStory(event, story) {
            const button = event.target;
            const savedStories = getSavedStories();
            const storyIndex = savedStories.findIndex(s => s.id === story.id);

            if (storyIndex > -1) {
                savedStories.splice(storyIndex, 1);
                button.textContent = 'Save';
                button.classList.remove('saved');
            } else {
                const storyToSave = { ...story, dateSaved: new Date().toISOString() };
                savedStories.push(storyToSave);
                button.textContent = 'Saved';
                button.classList.add('saved');
            }
            localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(savedStories));
            if (currentView === 'saved') displaySavedStories();
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

            storiesHeading.textContent = `You have ${savedStories.length} saved stor${savedStories.length === 1 ? 'y' : 'ies'}`;
            
            if (savedStories.length > 0) {
                clearSavedContainer.style.display = 'flex';
                displayStories(savedStories);
            } else {
                clearSavedContainer.style.display = 'none';
                storyContainer.innerHTML = `<p class="empty-state">You haven't saved any stories yet.</p>`;
            }
        }
        
        function handleExportSaved() {
            const savedStories = getSavedStories();
            if (savedStories.length === 0) {
                showToast("No saved stories to export.");
                return;
            }
            const dataStr = JSON.stringify(savedStories, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
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
                    const importedStories = JSON.parse(e.target.result);
                    if (!Array.isArray(importedStories)) throw new Error("Invalid format.");

                    const existingStories = getSavedStories();
                    const existingIds = new Set(existingStories.map(s => s.id));
                    let newStoriesCount = 0;

                    importedStories.forEach(story => {
                        if (story.id && !existingIds.has(story.id)) {
                            existingStories.push(story);
                            newStoriesCount++;
                        }
                    });

                    localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(existingStories));
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
        
        // --- Reading Controls & Keyboard Nav ---
        function getReadingSettings() {
            return JSON.parse(localStorage.getItem(READING_SETTINGS_KEY)) || { fontSize: 1.1, lineHeight: 1.6 };
        }

        function saveReadingSettings(settings) {
            localStorage.setItem(READING_SETTINGS_KEY, JSON.stringify(settings));
        }

        function applyReadingSettings() {
            const settings = getReadingSettings();
            document.documentElement.style.setProperty('--popup-font-size', `${settings.fontSize}em`);
            document.documentElement.style.setProperty('--popup-line-height', settings.lineHeight);
        }
        
        function setupReadingControls(story) {
            const readAloudButton = document.getElementById('read-aloud-button');
            const stopReadingButton = document.getElementById('stop-reading-button');
            const fontSizeUp = document.getElementById('font-size-up');
            const fontSizeDown = document.getElementById('font-size-down');
            const lineHeightUp = document.getElementById('line-height-up');
            const lineHeightDown = document.getElementById('line-height-down');
            
            readAloudButton.addEventListener('click', () => handleReadAloud(story));
            stopReadingButton.addEventListener('click', () => {
                window.speechSynthesis.cancel();
                readAloudButton.style.display = 'inline-block';
                stopReadingButton.style.display = 'none';
            });

            fontSizeUp.addEventListener('click', () => updateReadingSetting('fontSize', 0.1));
            fontSizeDown.addEventListener('click', () => updateReadingSetting('fontSize', -0.1));
            lineHeightUp.addEventListener('click', () => updateReadingSetting('lineHeight', 0.1));
            lineHeightDown.addEventListener('click', () => updateReadingSetting('lineHeight', -0.1));
        }

        function handleReadAloud(story) {
            const readAloudButton = document.getElementById('read-aloud-button');
            const stopReadingButton = document.getElementById('stop-reading-button');
            window.speechSynthesis.cancel();
            let textToRead = `Title: ${story.title}. By user ${story.author}. ${story.selftext}. `;
            const comments = popupBody.querySelectorAll('.comment-card');
            if (comments.length > 0) {
                textToRead += " Now for the top comments. ";
                comments.forEach(comment => {
                    const author = comment.dataset.commentAuthor;
                    const body = comment.querySelector('.comment-body').textContent;
                    textToRead += `Comment from user ${author}. ${body}. `;
                });
            }
            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.onstart = () => {
                readAloudButton.style.display = 'none';
                stopReadingButton.style.display = 'inline-block';
            };
            utterance.onend = () => {
                readAloudButton.style.display = 'inline-block';
                stopReadingButton.style.display = 'none';
            };
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                showToast('Sorry, text-to-speech is not available.');
                readAloudButton.style.display = 'inline-block';
                stopReadingButton.style.display = 'none';
            };
            window.speechSynthesis.speak(utterance);
        }

        function updateReadingSetting(setting, change) {
            const settings = getReadingSettings();
            if (setting === 'fontSize') {
                settings.fontSize = Math.max(0.5, settings.fontSize + change); // Min font size 0.5em
            } else if (setting === 'lineHeight') {
                settings.lineHeight = Math.max(1, settings.lineHeight + change); // Min line height 1
            }
            saveReadingSettings(settings);
            applyReadingSettings();
        }

        function handleKeyboardNav(e) {
            const isPopupActive = popupOverlay.classList.contains('active');
            const isTyping = document.activeElement.tagName === 'INPUT';

            if (isTyping && !isPopupActive) return;

            const cards = [...storyContainer.querySelectorAll('.story-card')];
            let activeCard = storyContainer.querySelector('.active-card');
            let currentIndex = activeCard ? cards.indexOf(activeCard) : -1;
            
            switch (e.key) {
                case 'Escape':
                    if (isPopupActive) closePopup();
                    break;
                case 'j':
                    if (!isPopupActive) {
                        e.preventDefault();
                        if (currentIndex < cards.length - 1) {
                            currentIndex++;
                            setActiveCard(cards[currentIndex]);
                        }
                    }
                    break;
                case 'k':
                     if (!isPopupActive) {
                        e.preventDefault();
                        if (currentIndex > 0) {
                            currentIndex--;
                            setActiveCard(cards[currentIndex]);
                        }
                    }
                    break;
                case 'o':
                case 'Enter':
                     if (!isPopupActive && activeCard) {
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
        }


    } catch (e) {
        console.error("An error occurred during page initialization:", e);
        document.body.innerHTML = "<h1>A critical error occurred. Please refresh the page.</h1>";
    }
});

