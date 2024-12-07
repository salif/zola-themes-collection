const allLoadings = document.querySelectorAll(".loading");

window.addEventListener("load", () => {
  setInterval(() => {
    allLoadings.forEach((item) => {
      item.classList.remove("loading");
    });
  }, 2000);
});
