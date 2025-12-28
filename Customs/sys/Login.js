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
    alert(data.message);

    if (data.user_role == "Admin") {
      window.location.href = "Admin.html";
    } else if (data.user_role == "User") {
      window.location.href = "Home.html";
    }
  } catch (err) {
    console.error("Error: ", err)
  }
}