if (window.location.pathname.endsWith("Management.html")) {
  document.addEventListener("DOMContentLoaded", function () {
    const optionSelector = document.getElementById("role");

    optionSelector.addEventListener("change", function () {
      const selectedRole = this.value;
      const specialGroup = document.getElementById("special");

      specialGroup.innerHTML = "";

      // Remove old proof wrapper if exists
      const oldProofWrapper = document.getElementById("proofIdWrapper");
      if (oldProofWrapper) oldProofWrapper.remove();

      if (selectedRole === "admin") {
        const label = document.createElement("label");
        label.htmlFor = "email";
        label.textContent = "Enter Email";
        specialGroup.appendChild(label);

        const input = document.createElement("input");
        input.type = "email";
        input.placeholder = " ";
        input.name = "email";
        input.id = "email";
        input.required = true;
        specialGroup.appendChild(input);

      } else if (selectedRole === "user") {
        const label = document.createElement("label");
        label.htmlFor = "mobilenum";
        label.textContent = "Enter Mobile Number";
        specialGroup.appendChild(label);

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = " ";
        input.name = "mobilenum";
        input.id = "mobilenum";
        input.required = true;
        input.maxLength = 13;
        specialGroup.appendChild(input);

        const proofWrapper = document.createElement("div");
        proofWrapper.id = "proofIdWrapper";
        proofWrapper.classList.add("input-group");
        proofWrapper.style.marginTop = "10px";

        const proofLabel = document.createElement("label");
        proofLabel.htmlFor = "proofId";
        proofLabel.textContent = "Please insert a Valid ID for verification purposes";
        proofWrapper.appendChild(proofLabel);

        const proofInput = document.createElement("input");
        proofInput.type = "file";
        proofInput.name = "proofId";
        proofInput.id = "proofId";
        proofInput.accept = "image/*";
        proofInput.required = true;
        proofWrapper.appendChild(proofInput);

        specialGroup.appendChild(proofWrapper);
      }

      const getInputs = document.querySelectorAll("#login-form input, #login-form select");
      getInputs.forEach(input => {
        input.disabled = false;
      })

    });
  });
}

function showPass() {
  var password = document.getElementById("password");
  const confPass = document.getElementById("c-password");

  if (password.type == "password" || confPass.type == "password") {
    password.type = "text"
    confPass.type = "text"
    document.querySelector(".showpass button").innerText = "Hide Password"
  } else {
    password.type = "password"
    confPass.type = "password"
    document.querySelector(".showpass button").innerText = "Show Password"
  }
}

async function createAccount(e) {
  e.preventDefault();

  if (checkInput() == false) { return; }

  document.getElementById("login").style.display = "none";
  document.getElementById("loading").style.display = "block";

  setTimeout(async () => {
    let roleValue = document.getElementById('role').value.toLowerCase() === "admin" ? 2 : 1;

    let formData = new FormData();
    formData.append("user_name", document.getElementById('username').value);
    formData.append("user_password", document.getElementById('password').value);
    formData.append("user_role", document.getElementById('role').value === "admin" || document.getElementById('role').value === "Admin" ? 2 : 1);
    formData.append("user_contact", document.getElementById('role').value === "admin" || document.getElementById('role').value === "Admin" ? document.getElementById('email').value : document.getElementById('mobilenum').value);

    let proofId = document.getElementById("proofId").files;
    if (proofId.length > 0) {
      const selectedFile = proofId[0];
      if (selectedFile.type.startsWith("image/")) {
        formData.append("proofId", selectedFile);
      }
    }

    try {
      const response = await fetch("Customs/dbase/CreateAcc.php", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      document.getElementById("loading").style.display = "none";
      document.getElementById("completed").style.display = "block";

      alert(data.message);
      window.location.href = "index.html";
    } catch (err) {
      console.error("Error:", err);
    }
  }, 3000);
}

function checkInput() {
  const username = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const confPass = document.getElementById("c-password").value;
  const role = document.getElementById("role").value;

  if (username.length < 5) {
    alert("Username must be at least 5 characters long.");
    return false;
  }

  if (pass != confPass) {
    alert("Password does not match");
    return false;
  }

  if (pass.length < 8) {
    alert("Password must contain at least 8 characters")
    return false;
  }
}