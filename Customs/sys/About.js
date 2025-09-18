document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.querySelector(".backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      history.back();
    });
  }
});