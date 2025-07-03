const init = () => {
  document.querySelectorAll('pre:not(.copy-wrapped)').forEach(pre => {
    pre.classList.add('copy-wrapped');
    const container = pre.parentNode.insertBefore(document.createElement('div'), pre);
    container.className = 'code-container';
    container.innerHTML = `<button class="copy-btn"><svg class="clipboard-icon" viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg><svg class="check-icon" viewBox="0 0 24 24" style="display:none"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg></button>`;
    container.appendChild(pre);
  });
};

document.addEventListener('click', async e => {
  const b = e.target.closest('.copy-btn');
  if (!b) return;
  
  const pre = b.nextElementSibling;
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
  
  const c = b.querySelector('.clipboard-icon');
  const k = b.querySelector('.check-icon');
  c.style.display = 'none';
  k.style.display = 'block';
  b.classList.add('copied');
  setTimeout(() => {
    c.style.display = 'block';
    k.style.display = 'none';
    b.classList.remove('copied');
  }, 2000);
});

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();

new MutationObserver(init).observe(document.body,{childList:true,subtree:true});