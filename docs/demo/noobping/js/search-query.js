document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') ?? '';
    const search = document.getElementById('search')
    search.value = q;
    search.style.display = 'block';
});