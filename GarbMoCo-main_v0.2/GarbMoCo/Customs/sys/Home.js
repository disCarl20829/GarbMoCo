document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      alert("Click OK to continue logging out :)");
      window.location.href = "login.html"; 
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".sidebarBtnAbout");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      window.location.href = "AboutUs.html"; 
    });
  }
});