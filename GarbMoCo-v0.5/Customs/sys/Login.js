function showPass() {
  var password = document.getElementById("password");

  if (password.type == "password") {
    password.type = "text"
  } else {
    password.type = "password"
  }
}

function buttonLog() {
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
    } else if (data.includes("user")) {
      window.location.href = "User.html";
    } else {
      alert("Invalid username or password. Please try again. :P")
    }
  }); 
}