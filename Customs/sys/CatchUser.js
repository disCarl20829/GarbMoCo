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
      alert("Session Invalid: " + (data.message || "No user data"));
      document.getElementById("user_id").value = "Invalid Fetch: " + (data.error || "No user data");
      window.location.href = "Index.html";
    }

  } catch (err) {
    console.error("Error in retrieving user function:", err);
  }
}