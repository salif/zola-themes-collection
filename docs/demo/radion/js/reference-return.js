document.addEventListener("DOMContentLoaded", function () {
  const footnotes = document.querySelectorAll(".footnote-definition");
  footnotes.forEach((fn) => {
    const footnoteId = fn.id;
    const referrerLink = document.querySelector(`a[href="#${footnoteId}"]`);
    if (!referrerLink) return;

    // add ID to the referring anchor tag if needed
    let refId = referrerLink.id;
    if (!refId) {
      refId = `fnref-${footnoteId}`;
      referrerLink.id = refId;
    }

    const returnLink = document.createElement("a");
    returnLink.href = `#${refId}`;
    returnLink.classList = "footnote-return";
    returnLink.textContent = " ↩";
    fn.appendChild(returnLink);
  });
});
