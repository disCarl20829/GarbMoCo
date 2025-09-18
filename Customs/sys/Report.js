let locked = false;
let isMarker = false;

function getUser() {
  fetch("Customs/dbase/GetUser.php", {
    method: "GET",
    credentials: "same-origin"
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Network response was not ok: " + res.status);
      }
      return res.json();
    })
    .then(data => {
      if (data && data.id && data.username) {
        document.getElementById("user_id").value = data.id;
        document.getElementById("username").value = data.username;
      } else {
        alert("User  not logged in. Please log in to submit a report.");
        document.getElementById("user_id").value = "Invalid Fetch: " + (data.error || "No user data");
        window.location.href = "Login.html";
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
      alert("An error occurred while fetching user data.");
    });
}


function getPlaceName(lat, lng, callback) {
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
    headers: {
      "User-Agent": "GarbMoCo/1.0 (carl.012908pepito@gmail.com)"
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.display_name) {
        callback(data.display_name);
      } else {
        callback(`Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`);
      }
    })
    .catch(err => {
      console.error("Geocoding error:", err);
      callback(`Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`);
    });
}


function mapOnSet() { //Map Set-up
  var tagumBounds = L.latLngBounds(
    [7.00, 125.50], // southwest
    [7.70, 126.10]  // northeast
  );

  var map = L.map('map', {
    center: [7.4475, 125.8078],
    zoom: 13,
    minZoom: 12,
    maxZoom: 18,
    maxBounds: tagumBounds,
    maxBoundsViscosity: 1.0,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let marker;

  map.on('click', function (e) {
    if (locked) return;

    var lat = e.latlng.lat.toFixed(5);
    var lng = e.latlng.lng.toFixed(5);

    document.getElementById("location").innerText =
      "Latitude: " + lat + ", Longitude: " + lng;

    getPlaceName(lat, lng, function (placeName) {
      document.getElementById("place").value = placeName;
    });

    if (marker) {
      marker.setLatLng([lat, lng])
        .bindPopup("You are here: " + lat + ", " + lng)
        .openPopup();
    } else {
      marker = L.marker([lat, lng]).addTo(map)
        .bindPopup("You are here: " + lat + ", " + lng)
        .openPopup();
    }

    isMarker = true;
  });

  document.getElementById("locatebtn").addEventListener("click", function () {
    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true
    });
  });

  map.on("locationfound", function (e) {
    let lat = e.latlng.lat;
    let lng = e.latlng.lng;

    getPlaceName(lat, lng, function (placeName) {
      document.getElementById("place").value = placeName;
    });

    document.getElementById("location").innerText =
      "Latitude: " + lat.toFixed(5) + ", Longitude: " + lng.toFixed(5);

    if (marker) {
      marker.setLatLng([lat, lng])
        .bindPopup("You are here: " + lat.toFixed(5) + ", " + lng.toFixed(5))
        .openPopup();
    } else {
      marker = L.marker([lat, lng]).addTo(map)
        .bindPopup("You are here: " + lat.toFixed(5) + ", " + lng.toFixed(5))
        .openPopup();
    }

    isMarker = true;
  });

  document.getElementById("locationbtn").addEventListener("click", function () {
    if (locked == false) {
      locked = true;
      document.getElementById("locationbtn").innerText = "Unlock location";
      alert("Location has been locked\nUnlock if necessary");
    } else {
      locked = false;
      document.getElementById("locationbtn").innerText = "Lock location";
      alert("Location has been unlocked\nPlease remark location");
    }
  });
}

function reportForm(e) {
  e.preventDefault();

  if (checkRequirements() === true) {
    alert("Submitting your report...");
    let formData = new FormData();
    formData.append("reportType", document.querySelector('input[name=\"reportType\"]:checked').value);
    formData.append("location", document.getElementById("place").value);
    formData.append("lat", document.getElementById("location").innerText.split(",")[0].split(":")[1].trim());
    formData.append("lng", document.getElementById("location").innerText.split(",")[1].split(":")[1].trim());
    formData.append("agreement", document.getElementById("agreement").checked ? 1 : 0);
    formData.append("description", document.getElementById("reportDetails").value);
    
    let files = document.getElementById("images").files;
    for (let i = 0; i < files.length; i++) {
      formData.append("images[]", files[i]);
    }

    fetch("Customs/dbase/Report.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.text())
      .then(data => {
        console.log("Server response:", data);
        alert(data);
        window.location.href = "Home.html";
      })
      .catch(err => console.error("Error:", err));
  }
}

function checkRequirements() {
  const reportField = document.getElementById("reportDetails");
  const imageProof = document.getElementById("images");
  const reportType = document.querySelector('input[name="reportType"]:checked');
  const location = document.getElementById("location").innerText;

  if (location === "Determine Location" || location === "" || isMarker === false) {
    alert("Please enter a location on the map.");
    return false;
  }
  if (!reportType) {
    alert("Please select a report type.");
    return false;
  }
  if (!reportField.value.trim()) {
    alert("Please provide detailed information for the report.");
    reportField.focus();
    return false;
  }
  if (imageProof.files.length === 0) {
    alert("Please upload at least one image as proof.");
    imageProof.focus();
    return false;
  }
  if (!locked) {
    alert("Please lock your location before submitting the report.");
    return false;
  }

  return true;
}

const proofInput = document.getElementById("proofImages");
if (proofInput) {
  proofInput.addEventListener("change", function () {
    const previewContainer = document.getElementById("imagePreview");
    if (previewContainer) previewContainer.innerHTML = "";

    Array.from(proofInput.files).forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.style.maxWidth = "100px";
          img.style.margin = "5px";
          previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  });
}