let locked = false;
let locationSelected = false;
let isMarker = false;

let otpSent = false;
let otpReceived = false;

const statusList = [
  "Uncollected on Schedule",
  "Overflowing Bin",
  "Scattered Waste",
  "Illegal Dumping",
  "Flooding Risk",
  "Other"
]

const garbageTypes = [
  "Unspecified",
  "Biodegradable",
  "Non-biodegradable",
  "Recyclable",
  "Residual",
  "Special Waste",
  "Mixed",
];

// Default to step 1 if none
window.addEventListener("popstate", (event) => {
  const step = event.state?.step || 1;
  console.log('Back/forward navigation detected -> step', step);

  document.querySelectorAll('.frame').forEach(frame => {
    frame.classList.remove('active');
  });

  const target = document.getElementById("step" + step);
  if (target) target.classList.add("active");
});

// Open correct step if user refreshes or shares a link
window.addEventListener("DOMContentLoaded", () => {
  const otpInput = document.getElementById("otpInput");
  const otpButton = document.getElementById("otp");

  const step = 1;

  document.querySelectorAll('.frame').forEach(f => f.classList.remove('active'));
  const target = document.getElementById("step" + step);
  if (target) target.classList.add("active");

  window.history.replaceState({}, "", window.location.pathname);

  const step2Inputs = document.querySelectorAll('#step2 input, #step2 textarea');
  step2Inputs.forEach(input => {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        return false;
      }
    });
  });

  const reportTypeContainer = document.getElementById("reportType");
  if (reportTypeContainer) {
    garbageTypes.forEach((type, index) => {
      const radioId = type.toLowerCase().replace(/\s+/g, '-');

      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.id = radioId;
      radioInput.name = "reportType";
      radioInput.value = index + 1;

      const radioLabel = document.createElement("label");
      radioLabel.htmlFor = radioId;
      radioLabel.textContent = type;

      reportTypeContainer.appendChild(radioInput);
      reportTypeContainer.appendChild(radioLabel);
      reportTypeContainer.appendChild(document.createElement("br"));
    });
  }

  const garbageStatusSelect = document.getElementById("garbage-status");
  if (garbageStatusSelect) {
    statusList.forEach((status, index) => {
      const option = document.createElement("option");
      option.value = index + 1;
      option.textContent = status;
      garbageStatusSelect.appendChild(option);
    });
  }
});

function nextStep(step) {
  console.log('nextStep requested ->', step);

  if (step == 2) {
    if (!reportRequirement()) {
      console.log('Validation failed. Staying on current step.');
      return;
    }
  }

  if (step === 3) {
    if (!verificationRequirement()) {
      console.log("Validation failed. Staying on current step.")
      return;
    }
  }

  document.querySelectorAll('.frame').forEach((frame) => {
    frame.classList.remove('active');
  });

  const target = document.getElementById("step" + step);
  if (target) {
    target.classList.add("active");
  } else {
    console.error("nextStep: target not found", "step" + step);
  }

  window.history.pushState({ step: step }, "", `?step=${step}`);
}

function prevStep(step) {
  nextStep(step);
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

    let lat = e.latlng.lat.toFixed(5);
    let lng = e.latlng.lng.toFixed(5);

    document.getElementById("location").innerText =
      `Latitude: ${lat}, Longitude: ${lng}`;

    getPlaceName(lat, lng, function (placeName) {
      document.getElementById("place").value = placeName;
      locationSelected = true; // ✅ SET HERE
    });

    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
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

    document.getElementById("location").innerText =
      `Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`;

    getPlaceName(lat, lng, function (placeName) {
      document.getElementById("place").value = placeName;
      locationSelected = true;
    });

    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker(e.latlng).addTo(map);
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

async function reportForm(e) {
  e.preventDefault();

  if (!reportRequirement() || !verificationRequirement()) {
    alert("Please fill in every required form")
    return false;
  }

  document.getElementById("step3").style.display = "none";
  document.getElementById("loading").style.display = "block";

  let formData = new FormData();
  formData.append("garbage_type", document.querySelector('input[name=\"reportType\"]:checked').value);
  formData.append("garbage_status", document.querySelector('select').value);
  formData.append("location", document.getElementById("place").value);
  formData.append("latitude", document.getElementById("location").innerText.split(",")[0].split(":")[1].trim());
  formData.append("longitude", document.getElementById("location").innerText.split(",")[1].split(":")[1].trim());
  formData.append("description", document.getElementById("reportDetails").value);

  let images = document.getElementById("images").files;
  for (let i = 0; i < images.length; i++) {
    formData.append("images[]", images[i]);
  }

  let video = document.getElementById("video").files;
  if (video.length > 0) {
    const selectedFile = video[0];
    if (selectedFile.type.startsWith("video/")) {
      formData.append("video", selectedFile);
    }
  }

  setTimeout(async () => {
    try {
      const reportResponse = await fetch("Customs/dbase/Report.php", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      if (!reportResponse.ok) {
        throw new Error("Network response was not ok: " + reportResponse.status);
      }

      const mailResponse = await fetch("Customs/api/SendMail.php", {
        method: "POST",
        body: formData,
      });

      if (!mailResponse.ok) {
        throw new Error("Network response was not ok: " + mailResponse.status);
      }

      const reportData = await reportResponse.json();
      const mailData = await mailResponse.json();

      if (reportData.status !== "success") {
        throw new Error("Report submission failed: " + (reportData.message || "Unknown error"));
      }

      alert(reportData.message || "Report submitted successfully.");
      console.log("Mail response:", mailData);
      document.getElementById("loading").style.display = "none";
      document.getElementById("completed").style.display = "block";
      window.location.href = "Home.html";
    } catch (err) {
      console.error("Error in report submission:", err);
    }
  }, 5000);
}

async function requestCode() {
  const otpInput = document.getElementById("otpInput");
  const otpButton = document.getElementById("otp");

  let number = document.getElementById("user_contact").value.trim();

  if (otpSent) {
    const response = await fetch("Customs/api/SMSVerify.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ otp: otpInput.value })
    });

    const data = await response.json();

    if (data.status === "success") {
      alert("OTP verified ✅");
      otpButton.disabled = true;
      otpReceived = true;
    } else {
      alert(data.message);
    }
    return;
  }

  otpButton.disabled = true;
  otpButton.innerText = "Verify OTP";
  otpInput.disabled = false;

  try {
    const response = await fetch("Customs/api/SMSCode.php", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      credentials: "same-origin",
      body: JSON.stringify({ number: number })
    });

    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.status);
    }
    const data = await response.json();

    if (data.status !== "success") {
      throw new Error("Failed to send OTP: " + (data.response || "Unknown error"));
    }

    alert("OTP has been sent to your mobile number. " + data.response.message);
    otpSent = true;
    otpButton.disabled = false;
  } catch (err) {
    console.error("Error fetching user contact:", err);
    alert("Failed to fetch user contact.");
    return;
  }
}

function reportRequirement() {
  const reportField = document.getElementById("reportDetails");
  const imageProof = document.getElementById("images");
  const reportType = document.querySelector('input[name="reportType"]:checked');
  const reportStatus = document.getElementById("garbage-status").value;

  if (!locationSelected) {
    alert("Please enter a location on the map.");
    return false;
  }
  if (!reportType) {
    alert("Please select a report type.");
    return false;
  }
  if (reportStatus === "") {
    alert("Please select the garbage status.");
    return false;
  }
  if (!reportField.value.trim()) {
    alert("Please provide detailed information for the report.");
    reportField.focus();
    return false;
  }
  if (imageProof.files.length === 0) {
    alert("Please upload three images as proof.");
    imageProof.focus();
    return false;
  }
  if (imageProof.files.length < 3) {
    alert("Please upload at least three images as proof.");
    imageProof.focus();
    return false;
  }
  if (!locked) {
    alert("Please lock your location before submitting the report.");
    return false;
  }

  return true;
}

function verificationRequirement() {
  const otpInput = document.getElementById("otpInput").value.trim();

  const agreement1 = document.getElementById("agree1").checked;
  const agreement2 = document.getElementById("agree2").checked;

  if (!otpReceived) {
    alert("Please verify the OTP sent to your mobile number.");
    return false;
  }
  if (otpInput === "") {
    alert("Please enter the OTP sent to your mobile number.");
    return false;
  }
  if (!agreement1 || !agreement2) {
    alert("You must agree to the terms and conditions.");
    return false;
  }

  return true;
}