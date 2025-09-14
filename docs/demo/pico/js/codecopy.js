function enableCopy() {
    document.querySelectorAll('pre:not(.mermaid)').forEach(node => {
      let copyBtn = document.createElement("span");
      copyBtn.classList.add('copybutton');
      copyBtn.classList.add('icon');
      copyBtn.classList.add('icon-copy');
        node.appendChild(copyBtn);
        copyBtn.addEventListener("click", async () => {
          if (navigator.clipboard) {
            let text = node.querySelectorAll('code')[0].innerText;
            await navigator.clipboard.writeText(text);
            copyBtn.classList.add('clicked');
          }
    setTimeout(() => copyBtn.classList.remove('clicked'), 600);
  })   
 })
}
