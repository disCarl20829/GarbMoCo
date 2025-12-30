function showNotification(message, type = "info", duration = 3000) {
  const container = document.getElementById("notification-container");

  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  container.appendChild(notif);

  setTimeout(() => notif.classList.add("show"), 50);

  setTimeout(() => {
    notif.classList.remove("show");
    setTimeout(() => notif.remove(), 500);
  }, duration);
}

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("Customs/dbase/GetUser.php", {
      method: "GET",
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }

    const data = await response.json();

    if (data.info.user_role !== "User") {
      window.location.href = "index.html";
    }
  } catch (err) {
    console.errror("Error retrieving user info: ", err);
  }

  const logoutButton = document.querySelector(".logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      showNotification("Successfully logged out!", "success")
      fetch("Customs/dbase/LogOut.php", {
        method: "POST"
      });

      setTimeout(() => {
        window.location.href = "index.html";
      }, 5000)
    });
  }

  const trackBtn = document.querySelector("#gototrack");
  if (trackBtn) {
    trackBtn.addEventListener("click", function () {
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