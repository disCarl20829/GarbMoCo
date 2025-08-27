document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      alert("Click OK to continue logging out :)");
      window.location.href = "login.html"; 
    });
  }
});
