document.addEventListener('DOMContentLoaded', function() {
    let searchIdx;
    let searchDocs = {};
    const searchInput = document.getElementById('search-input');
    const searchModal = document.getElementById('search-modal');
    const searchPreview = document.getElementById('search-preview');
    const resultsContainer = document.getElementById('search-results');
    const closeButton = document.getElementById('close-search');

    // Load the search index
    const searchIndexPath = document.querySelector('meta[name="search-index"]').getAttribute('content');
    fetch(searchIndexPath)
        .then(response => response.text())
        .then(data => {
            // Create a new script element and append the search index data
            const script = document.createElement('script');
            script.textContent = data;
            document.head.appendChild(script);

            // Initialize elasticlunr index from the loaded data
            if (window.searchIndex) {
                searchIdx = elasticlunr.Index.load(window.searchIndex);
                // Store documents for quick lookup
                Object.entries(window.searchIndex.documentStore.docs).forEach(([key, doc]) => {
                    searchDocs[key] = {
                        ...doc,
                        url: key,
                        title: doc.title || key.split('/').pop().split('-').slice(1).join(' ')
                            .replace(/(^|\s)\S/g, letter => letter.toUpperCase())
                    };
                });
                console.log('Search index loaded and initialized successfully');
            } else {
                throw new Error('Search index not found');
            }
        })
        .catch(error => {
            console.error('Error loading search index:', error);
            resultsContainer.innerHTML = '<p class="p-4 text-red-500">Failed to load search index</p>';
        });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search-input') && !e.target.closest('#search-preview') && !e.target.closest('#search-modal')) {
            searchModal.classList.add('hidden');
            searchPreview.classList.add('hidden');
            searchInput.value = '';
            resultsContainer.innerHTML = '';
        }
    });

    // Real-time search as user types
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        
        // Always hide preview and modal if query is too short
        if (query.length < 2) {
            searchModal.classList.add('hidden');
            searchPreview.classList.add('hidden');
            resultsContainer.innerHTML = '';
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (searchIdx) {
                performSearch(query);
                searchModal.classList.remove('hidden');
                searchPreview.classList.add('hidden');
            }
        }, 300); // Debounce for better performance
    });

    // Close modal when pressing Escape or clicking close button
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchModal.classList.add('hidden');
            searchInput.value = '';
            resultsContainer.innerHTML = '';
        }
    });

    closeButton.addEventListener('click', () => {
        searchModal.classList.add('hidden');
        searchInput.value = '';
        resultsContainer.innerHTML = '';
    });

    // Only show modal when typing starts, not on focus
    searchInput.addEventListener('focus', () => {
        // Don't show modal on focus, wait for typing
        if (searchInput.value.trim().length === 0) {
            searchModal.classList.add('hidden');
            searchPreview.classList.add('hidden');
        }
    });

    // Show search modal with smooth animation
    function showSearchModal() {
        searchModal.style.opacity = '0';
        searchModal.classList.remove('hidden');
        setTimeout(() => {
            searchModal.style.opacity = '1';
        }, 10);
    }

    // Perform search and display results
    function performSearch(query) {
        if (!searchIdx) {
            resultsContainer.innerHTML = '<p class="p-4">Search index is still loading...</p>';
            return;
        }
        showSearchModal();

        try {
            const results = searchIdx.search(query);
            if (results.length === 0) {
                resultsContainer.innerHTML = '<p class="p-4 text-gray-500 dark:text-gray-400">No results found</p>';
                return;
            }

            const resultsHtml = results.map(result => {
                const doc = searchDocs[result.ref];
                if (!doc) return '';
                
                const searchTerms = query.toLowerCase().split(/\s+/);
                let snippet = '';
                let matchFound = false;

                // First check if search terms are in the title
                const titleMatches = doc.title && searchTerms.some(term => 
                    doc.title.toLowerCase().includes(term)
                );

                if (doc.body) {
                    const cleanBody = doc.body.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
                    const lowerBody = cleanBody.toLowerCase();
                    const windowSize = 200; // Increased window size for more context
                    
                    // Find best position containing search terms
                    let bestPos = -1;
                    let maxMatches = 0;
                    
                    // Prioritize exact matches first
                    searchTerms.forEach(term => {
                        const pos = lowerBody.indexOf(term);
                        if (pos !== -1) {
                            bestPos = pos;
                            matchFound = true;
                        }
                    });

                    // If no exact match found, look for partial matches
                    if (!matchFound) {
                        for (let i = 0; i < cleanBody.length - windowSize; i += 20) {
                            let matches = 0;
                            const window = cleanBody.substr(i, windowSize).toLowerCase();
                            searchTerms.forEach(term => {
                                if (window.includes(term)) matches++;
                            });
                            if (matches > maxMatches) {
                                maxMatches = matches;
                                bestPos = i;
                                matchFound = true;
                            }
                        }
                    }
                    
                    if (matchFound) {
                        // Start a bit before the match if possible
                        const start = Math.max(0, bestPos - 50);
                        snippet = cleanBody.substr(start, windowSize);
                        
                        // Highlight search terms
                        searchTerms.forEach(term => {
                            const regex = new RegExp(`(${term})`, 'gi');
                            snippet = snippet.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
                        });
                        
                        if (start > 0) snippet = '...' + snippet;
                        if (start + windowSize < cleanBody.length) snippet += '...';
                    } else {
                        // If no match found in body, use beginning of content
                        snippet = cleanBody.slice(0, windowSize) + '...';
                    }
                }
                
                // Determine result type for styling
                const resultType = titleMatches ? 'primary' : (matchFound ? 'secondary' : 'tertiary');
                
                // Format the title based on the URL and document type
                const formatTitle = (doc) => {
                    if (doc.title) return doc.title;
                    if (doc.url === '/about/') return 'About Me - Developer Profile';
                    return doc.url.split('/').pop().split('-').slice(1).join(' ')
                        .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
                };

                // Format the content preview
                const formatPreview = (doc, snippet) => {
                    if (snippet) return snippet;
                    if (doc.body) {
                        const cleanBody = doc.body.replace(/\s+/g, ' ').trim();
                        return cleanBody.length > 200 ? cleanBody.slice(0, 200) + '...' : cleanBody;
                    }
                    return 'No preview available';
                };

                return `<div class="search-result ${resultType} mb-4">
                    <a href="${doc.url}" class="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition duration-150">
                        <h3 class="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2">
                            ${formatTitle(doc)}
                        </h3>
                        <div class="space-y-2">
                            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                ${formatPreview(doc, snippet)}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-500">
                                ${doc.url.replace(/^\/|\/$/g, '') || 'Home'}
                            </p>
                        </div>
                    </a>
                </div>`;
            }).join('');

            resultsContainer.innerHTML = resultsHtml;
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = '<p class="p-4 text-red-500">An error occurred while searching</p>';
        }
    }
});
