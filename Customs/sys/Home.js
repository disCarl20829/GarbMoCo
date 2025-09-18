document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.querySelector(".logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      alert("Click OK to continue logging out :)");
      fetch("Customs/dbase/LogOut.php", {
        method: "POST"
      });
      window.location.href = "Login.html"; 
    });
  }

  const reportButton = document.querySelector("#gotoreports");
  if (reportButton) {
    reportButton.addEventListener("click", function () {
      window.location.href = "Report.html"; 
    });
  }

  const logsButton = document.querySelector("#gotologs");
  if (logsButton) {
    logsButton.addEventListener("click", function () {
      window.location.href = "Logs.html"; 
    });
  }

  const aboutButton = document.querySelector("#gotoabout");
  if (aboutButton) {
    aboutButton.addEventListener("click", function () {
      window.location.href = "About.html"; 
    });
  }
});
