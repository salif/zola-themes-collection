document.addEventListener('DOMContentLoaded', async () => {
  const repoElements = document.querySelectorAll('[data-owner][data-repo]');
  if (!repoElements.length) return;

  const getCache = (key) => {
    try {
      const data = localStorage.getItem(key);
      const time = localStorage.getItem(`${key}-time`);
      return data && time && (Date.now() - +time) < 86400000 ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const setCache = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${key}-time`, Date.now());
    } catch {
      // Silently fail if localStorage is not available
    }
  };

  const fetchRepoData = async (owner, repo) => {
    const [repoRes, tagsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`),
      fetch(`https://api.github.com/repos/${owner}/${repo}/tags`)
    ]);
    
    if (!repoRes.ok) throw new Error('Repo not found');
    
    return {
      repo: await repoRes.json(),
      tags: tagsRes.ok ? await tagsRes.json() : []
    };
  };

  const updateElement = (element, { repo, tags }) => {
    const q = (sel) => element.querySelector(sel);
    
    q('.stars .count').textContent = repo.stargazers_count || 0;
    q('.forks .count').textContent = repo.forks_count || 0;
    
    if (repo.description) q('.repo-description').innerHTML = `<p>${repo.description}</p>`;
    if (tags?.length) q('.repo-tags').innerHTML = `Tags: ${tags.slice(0, 5).map(t => t.name).join(', ')}`;
  };

  await Promise.all([...repoElements].map(async (element) => {
    const { owner, repo } = element.dataset;
    const cacheKey = `github-${owner}-${repo}`;

    try {
      let data = getCache(cacheKey);

      if (!data) {
        data = await fetchRepoData(owner, repo);
        setCache(cacheKey, data);
      }

      updateElement(element, data);
    } catch (error) {
      console.error(`Error fetching ${owner}/${repo}:`, error);
      element.querySelector('.repo-stats').innerHTML = '<span>Failed to load</span>';
    }
  }));

  // Make entire card clickable
  repoElements.forEach(element => {
    const link = element.querySelector('.repo-link');
    if (link) {
      element.addEventListener('click', (e) => {
        // Don't trigger if clicking directly on the link (to preserve normal link behavior)
        if (e.target.closest('.repo-link')) return;

        // Open link in new tab, matching the original link behavior
        window.open(link.href, '_blank', 'noopener');
      });
    }
  });
});