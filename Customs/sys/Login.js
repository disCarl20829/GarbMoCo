document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("Customs/dbase/GetUser.php", {
      method: "GET",
    });

    if (response.status === 401) {
      return;
    }

    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }

    const data = await response.json();

    if (data.info.user_role === "Admin") {
      window.location.href = "Admin.html";
    } else {
      window.location.href = "Home.html";
    }
  } catch (err) {
    console.error("Error retrieving user info: ", err);
  }
})

function showNotification(message, type = "info", duration = 3000) {
  const container = document.getElementById("notification-container");
  container.innerHTML = "";

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

function showPass() {
  var password = document.getElementById("password");

  if (password.type == "password") {
    password.type = "text"
    document.querySelector(".showpass button").innerText = "Hide Password"
  } else {
    password.type = "password"
    document.querySelector(".showpass button").innerText = "Show Password"
  }
}

async function loginForm() {
  let formData = new FormData();
  formData.append("user_name", document.getElementById("username").value);
  formData.append("user_password", document.getElementById("password").value);

  try {
    const response = await fetch("Customs/dbase/Login.php", {
      method: "POST",
      body: formData
    })

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    showNotification(data.message, "success");

    setTimeout(() => {
      if (data.user_role == "Admin") {
        window.location.href = "Admin.html";
      } else if (data.user_role == "User") {
        window.location.href = "Home.html";
      }
    }, 5000)
  } catch (err) {
    console.error("Error: ", err)
  }
}