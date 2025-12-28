document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      alert("Click OK to continue logging out :)");
      fetch("Customs/dbase/LogOut.php", {
        method: "POST"
      });
      window.location.href = "index.html";
    });
  }

  const trackBtn = document.querySelector("#gototrack");
  if (trackBtn) {
    trackBtn.addEventListener("click", function () {
      window.location.href = "Logs.html";
    });
  }

  const veriBtn = document.querySelector("#gotoverify");
  if (veriBtn) {
    veriBtn.addEventListener("click", function () {
      window.location.href = "Logs.html";
    });
  }

  const mgmtBtn = document.querySelector("#gotomgmt");
  if (mgmtBtn) {
    mgmtBtn.addEventListener("click", function () {
      window.location.href = "Management.html";
    });
  }

  const aboutButton = document.querySelector("#gotoabout");
  if (aboutButton) {
    aboutButton.addEventListener("click", function () {
      window.location.href = "About.html";
    });
  }
});
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.content');

  sidebar.classList.toggle('hidden');

  if (sidebar.classList.contains('hidden')) {
    content.style.marginLeft = "0";
  } else {
    content.style.marginLeft = "220px";
  }
}