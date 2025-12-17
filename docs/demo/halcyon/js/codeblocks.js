const init = () => {
  document.querySelectorAll('pre:not(.copy-wrapped)').forEach(pre => {
    pre.classList.add('copy-wrapped');
    const container = pre.parentNode.insertBefore(document.createElement('div'), pre);
    container.className = 'code-container';

    // Detect language from data-lang attribute or class
    let language = pre.getAttribute('data-lang');
    if (!language) {
      const langClass = Array.from(pre.classList).find(cls => cls.startsWith('language-'));
      language = langClass ? langClass.replace('language-', '') : null;
    }

    const header = document.createElement('div');
    header.className = 'code-header';

    const languageLabel = language ? `<span class="code-language">${language}</span>` : '';
    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.setAttribute('aria-label', 'Copy code to clipboard');

    if (languageLabel) {
      header.innerHTML = languageLabel;
    }
    header.appendChild(button);

    container.appendChild(header);
    container.appendChild(pre);
  });
};

document.addEventListener('click', async e => {
  const b = e.target.closest('.copy-btn');
  if (!b) return;

  const container = b.closest('.code-container');
  const pre = container.querySelector('pre');
  const t = pre.textContent;
  
  try {
    await navigator.clipboard.writeText(t);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), {
      value: t,
      style: 'position:fixed;opacity:0;top:0;left:0'
    });
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  
  b.classList.add('copied');
  setTimeout(() => {
    b.classList.remove('copied');
  }, 2000);
});

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();