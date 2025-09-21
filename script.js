document.addEventListener('DOMContentLoaded', () => {
    try {
        // Get DOM elements
        const fetchButton = document.getElementById('fetch-button');
        const subredditInput = document.getElementById('subreddit-input');
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
        // NEW: Load More Button
        const loadMoreButton = document.getElementById('load-more-button');

        // API Constants
        const REDDIT_API_BASE_URL = 'https://www.reddit.com/r/';

        // State for pagination
        let currentAfterToken = null;

        // --- Theme Switcher ---
        function applyTheme(theme) {
            document.body.className = '';
            if (theme !== 'light') {
                document.body.classList.add(theme);
            }
            localStorage.setItem('theme', theme);
            themeSelect.value = theme;
        }

        themeSelect.addEventListener('change', () => {
            applyTheme(themeSelect.value);
        });

        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
        // --- End Theme Switcher ---


        // --- Back to Top Button ---
        window.onscroll = function() {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                backToTopButton.style.display = "flex";
            } else {
                backToTopButton.style.display = "none";
            }
        };

        backToTopButton.addEventListener('click', () => {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        });
        // --- End Back to Top Button ---

        // Helper function to turn URLs into clickable links
        function createClickableLinks(text) {
            const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
            return text.replace(urlRegex, (url) => {
                const href = url.startsWith('http') ? url : `http://${url}`;
                return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
            });
        }
        
        // --- Event listeners ---
        fetchButton.addEventListener('click', () => {
            const subreddit = subredditInput.value.trim();
            const sort = sortSelect.value;
            const timeRange = timeRangeSelect.value;
            if (subreddit) {
                // False indicates this is a new search, not loading more
                fetchStories(subreddit, sort, timeRange, false);
            } else {
                showErrorPopup("Please enter a subreddit name.");
            }
        });

        // NEW: Load More button listener
        loadMoreButton.addEventListener('click', () => {
            const subreddit = subredditInput.value.trim();
            const sort = sortSelect.value;
            const timeRange = timeRangeSelect.value;
            if (subreddit && currentAfterToken) {
                 // True indicates we are loading more stories
                fetchStories(subreddit, sort, timeRange, true);
            }
        });

        sortSelect.addEventListener('change', () => {
            if (sortSelect.value === 'top') {
                timeRangeControls.style.display = 'flex';
            } else {
                timeRangeControls.style.display = 'none';
            }
        });

        closePopupButton.addEventListener('click', () => {
            popupOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                popupOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });

        // Initial fetch on page load
        fetchStories(subredditInput.value, 'hot', 'all', false);

        function showPopup(title, content) {
            const displayContent = content && content.trim().length > 0
                ? content
                : "The full story could not be loaded or is empty.";

            const formattedContent = createClickableLinks(displayContent).replace(/\n/g, '<br>');

            popupTitle.textContent = title;
            popupBody.innerHTML = formattedContent;
            popupOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function showErrorPopup(message) {
            showPopup("Error", message);
        }

        function showLoading(show, isLoadMore) {
            // Use loading indicator for initial load, pulse button for "load more"
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

        async function fetchStories(subreddit, sort, timeRange = 'all', loadMore = false) {
            showLoading(true, loadMore);
            if (!loadMore) {
                storyContainer.innerHTML = '';
                currentAfterToken = null;
            }
            // Hide button while fetching new data
            loadMoreButton.style.display = 'none';

            let redditUrl = `${REDDIT_API_BASE_URL}${subreddit}/${sort}.json?limit=25`;
            if (sort === 'top') {
                redditUrl += `&t=${timeRange}`;
            }
            // Add 'after' token for pagination if we're loading more
            if (loadMore && currentAfterToken) {
                redditUrl += `&after=${currentAfterToken}`;
            }

            try {
                const response = await fetch(redditUrl);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`Subreddit 'r/${subreddit}' not found.`);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const posts = data.data.children;
                // Update the token for the next page
                currentAfterToken = data.data.after;

                if (posts.length === 0 && !loadMore) {
                    storyContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">No stories found. Please try a different subreddit or filter.</p>`;
                } else {
                    displayStories(posts);
                }
            } catch (error) {
                console.error("Failed to fetch stories:", error);
                showErrorPopup(`Could not fetch stories. ${error.message}`);
            } finally {
                showLoading(false, loadMore);
                // Show "Load More" button if there's a token for a next page
                if (currentAfterToken) {
                    loadMoreButton.style.display = 'block';
                }
            }
        }

        async function fetchAndShowComments(title, selftext, storyId, subreddit) {
            popupTitle.textContent = title;
            document.body.style.overflow = 'hidden';
            popupOverlay.classList.add('active');
            popupBody.innerHTML = `<div class="spinner"></div><p class="loading-message">Loading full story and comments...</p>`;

            let finalContent = '';
            if (selftext && selftext.trim().length > 0) {
                finalContent += `<p>${createClickableLinks(selftext).replace(/\n/g, '<br>')}</p>`;
            }

            try {
                const redditUrl = `${REDDIT_API_BASE_URL}${subreddit}/comments/${storyId}.json`;
                const response = await fetch(redditUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const comments = data[1].data.children.slice(0, 10);

                finalContent += `<hr>`;
                if (comments.length > 0) {
                    finalContent += `<h4>Top Comments:</h4>`;
                    comments.forEach(comment => {
                        const commentData = comment.data;
                        if (commentData.body) {
                            finalContent += `<div class="comment-card">
                                <p class="comment-author">u/${commentData.author}</p>
                                <p class="comment-body">${createClickableLinks(commentData.body).replace(/\n/g, '<br>')}</p>
                            </div>`;
                        }
                    });
                } else {
                    finalContent += `<p>No comments found.</p>`;
                }
            } catch (error) {
                console.error("Failed to fetch comments:", error);
                finalContent += `<p class="error-message">Could not load comments.</p>`;
            }
            
            popupBody.innerHTML = finalContent;
        }

        function displayStories(posts) {
            // This function now just appends new stories to the container
            posts.forEach(post => {
                const story = post.data;
                const trimmedSelftext = story.selftext ? story.selftext.trim() : '';
                
                const previewText = trimmedSelftext.length > 0 ? trimmedSelftext : story.title;

                if (story.is_self) {
                    const storyCard = document.createElement('div');
                    storyCard.className = 'story-card';
                    
                    storyCard.innerHTML = `
                        <div class="story-meta">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 12h5v10h10V12h5L12 2z"/></svg>
                                ${story.score.toLocaleString()}
                            </span>
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
                                ${story.num_comments.toLocaleString()}
                            </span>
                        </div>
                        <h3>${story.title}</h3>
                        <p class="author">by u/${story.author}</p>
                        <p class="preview">${previewText}</p>
                        <div class="button-container">
                            <button class="read-button">Read Full Story</button>
                        </div>
                    `;
                    
                    const readButton = storyCard.querySelector('.read-button');
                    
                    readButton.addEventListener('click', () => {
                        fetchAndShowComments(story.title, trimmedSelftext, story.id, story.subreddit);
                    });
                    
                    storyContainer.appendChild(storyCard);
                }
            });
        }
    } catch (e) {
        console.error("An error occurred during page initialization:", e);
        document.body.innerHTML = "<h1>A critical error occurred. Please refresh the page.</h1>";
    }
});

