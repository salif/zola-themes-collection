document.addEventListener('DOMContentLoaded', () => {
    const targetId = "#pagefind-search";
    const searchContainer = document.getElementById('search-container');
    const searchToggle = document.getElementById('search-toggle');

    // 1. 初始化 Pagefind
    if (typeof PagefindUI !== 'undefined') {
        const ui = new PagefindUI({
            element: targetId,
            showSubResults: true,
            showImages: false,
            translations: {
                placeholder: document.querySelector(targetId)?.getAttribute('data-placeholder') || "Search"
            }
        });

        // ⚡️ 补丁：给生成的 input 加上原来的 id，让 label 生效
        const tryAttachId = setInterval(() => {
            const input = document.querySelector(`${targetId} input`);
            if (input) {
                input.id = "search-bar"; // 还原 id="search-bar"
                input.setAttribute('autocomplete', 'off'); // 关掉浏览器自动填充，避免挡住结果
                clearInterval(tryAttachId);
            }
        }, 100);
    }

    // 2. 开关逻辑 (核心修复)
    function toggleSearch() {
        // 切换 .active 类，触发 CSS 的 opacity/transform 动画
        const isActive = searchContainer.classList.toggle("active");

        if (isActive) {
            // 打开时：聚焦输入框
            setTimeout(() => {
                const input = searchContainer.querySelector('input');
                if (input) input.focus();
            }, 100); // 延时等待 CSS 动画开始
        } else {
            // 关闭时：失焦
            const input = searchContainer.querySelector('input');
            if (input) input.blur();
        }
    }

    // 3. 事件绑定
    if (searchToggle) {
        searchToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止冒泡触发 document click
            e.preventDefault();
            toggleSearch();
        });
    }

    // 点击外部关闭
    document.addEventListener('click', (e) => {
        if (searchContainer.classList.contains('active') &&
            !searchContainer.contains(e.target) &&
            e.target !== searchToggle) {
            toggleSearch(); // 关闭
        }
    });

    // 键盘快捷键 (ESC 和 /)
    document.addEventListener('keydown', (e) => {
        // ESC 关闭
        if (e.key === "Escape" && searchContainer.classList.contains('active')) {
            toggleSearch();
        }
        // "/" 开启
        if (e.key === "/" && !searchContainer.classList.contains('active') && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
            e.preventDefault();
            toggleSearch();
        }
    });
});
