document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      alert("Click OK to continue logging out :)");
      fetch("Customs/dbase/LogOut.php", {
        method: "POST"
      })
      window.location.href = "Login.html"; 
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".sidebarBtnAbout");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      window.location.href = "About.html"; 
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".sidebarBtnReport");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      window.location.href = "Report.html"; 
    });
  }
});