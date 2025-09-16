function showPass() {
  var password = document.getElementById("password");

  if (password.type == "password") {
    password.type = "text"
  } else {
    password.type = "password"
  }
}

function loginForm() {
  let isLogged = false;

  if (isLogged == false) {
    let formData = new FormData();
    formData.append("username", document.getElementById("username").value);
    formData.append("password", document.getElementById("password").value);

    fetch("Customs/dbase/Login.php", {
      method: "POST",
      body: formData
    })
      .then(response => response.text())
      .then(data => {
        console.log(data);
        if (data.includes("admin")) {
          window.location.href = "Admin.html";
          alert("Welcome Admin! :)")
        } else if (data.includes("user")) {
          window.location.href = "Home.html";
          alert("Welcome User! :)")
        } else {
          alert(data + " Please try again.");
        }
      });
      isLogged = true;
  } else {
    alert("You are already logged in.");
  }
}