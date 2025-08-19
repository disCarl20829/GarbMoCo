function showPass() {
  var password = document.getElementById("password");

  if (password.type == "password") {
    password.type = "text"
  } else {
    password.type = "password"
  }
}

function buttonLog() {
 const username = document.getElementById('username');
 const inputUsername = username.value

 const password = document.getElementById('password');
 const inputPassword = password.value

 const getPassword = "abc123"
 const getUsername = "gwapoko123"

 if (inputPassword == getPassword && inputUsername == getUsername) {
  alert("Logging you in\nWelcome " + getUsername + "!")
  window.open("homepage.html", "_self")
  window.close
  window.location.href = 'Home.html';
 } else if (inputUsername !== getUsername) {
  alert("Invalid Username")
 } else {
  alert("Invalid Password. Please try again")
 }
}