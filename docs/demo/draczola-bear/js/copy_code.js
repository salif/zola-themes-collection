// Simple copy-to-clipboard for code blocks
// Copied from: https://picostitch.com/blog/2025/05/allow2copy/
document.querySelectorAll('pre code').forEach($el =>
  $el.addEventListener('click', async ($el) => {
    const $node = $el.target;
    const content = $node.textContent;
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error(error.message);
    }
    $node.parentNode.classList.add('copied');
    setTimeout(($n => () => $n.classList.remove('copied'))($node.parentNode), 1000);
  })
);