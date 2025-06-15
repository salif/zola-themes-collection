document.addEventListener("DOMContentLoaded", () => {
  const shareLink = document.querySelector('a[href="#share"]');
  if (!shareLink) return;

  shareLink.addEventListener("click", async event => {
    event.preventDefault();

    const shareData = {
      title: document.title,
      text: document.title,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Sharing failed:", err);
      }
    } else {
      console.warn("Sharing is not supported in this browser.");
    }
  });
});