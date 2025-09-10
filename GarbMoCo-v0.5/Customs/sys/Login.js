function showPass() {
  var password = document.getElementById("password");

  if (password.type == "password") {
    password.type = "text"
  } else {
    password.type = "password"
  }
}

function buttonLog() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const getPasswordUser = "user123";
  const getUsernameUser = "User";

  const getPasswordAdmin = "admin123";
  const getUsernameAdmin = "Admin";

  if (username === getUsernameUser && password === getPasswordUser) {
    alert("Logging you in\nWelcome " + getUsernameUser + "!");
    window.location.href = 'Home.html';
  } else if (username === getUsernameAdmin && password === getPasswordAdmin) {
    alert("Logging you in\nWelcome " + getUsernameAdmin + "!");
    window.location.href = 'Admin.html';
  } else if (username !== getUsernameUser && username !== getUsernameAdmin) {
    alert("Invalid Username. Please try again");
    usernameField.value = "";
  } else {
    alert("Invalid Password. Please try again");
    passwordField.value = "";
  }
}