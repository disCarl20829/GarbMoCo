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

async function getUser() {
  try {
    const response = await fetch("Customs/dbase/GetUser.php", {
      method: "GET",
      credentials: "same-origin"
    });

    const data = await response.json();

    if (data.status == "success") {
      document.getElementById("user_id").value = data.info.user_id;
      document.getElementById("user_name").value = data.info.user_name;
      document.getElementById("user_contact").value = data.info.user_phone;
    } else if (data.status == "error") {
      showNotification("Session Invalid: " + (data.message || "No user data"), "error", 5000)
      document.getElementById("user_id").value = "Invalid Fetch: " + (data.error || "No user data");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 5000)
    }

  } catch (err) {
    console.error("Error in retrieving user function:", err);
  }
}