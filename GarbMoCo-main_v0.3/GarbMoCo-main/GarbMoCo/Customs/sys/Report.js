function setMarker(lat, lng) {
  return "You are here: " + lat + ", " + lng;
} //Set marker (Global purpose)

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
  let locked = false;

  map.on('click', function (e) {
    if (locked) return; //Do nothing if locked

    var lat = e.latlng.lat.toFixed(5);
    var lng = e.latlng.lng.toFixed(5);

    document.getElementById("location").innerText =
      "Latitude: " + lat + ", Longitude: " + lng;

    if (marker) {
      marker.setLatLng([lat, lng])
        .bindPopup("You are here: " + lat + ", " + lng)
        .openPopup();
    } else {
      marker = L.marker([lat, lng]).addTo(map)
        .bindPopup("You are here: " + lat + ", " + lng)
        .openPopup();
    }
  });

  document.getElementById("locatebtn").addEventListener("click", function () {
    var userCircle;

    map.locate({
      watch: true,
      setView: true,
      maxZoom: 12,
      enableHighAccuracy: true,
    });
  });

  map.on("locationfound", function (e) {
    let lat = e.latlng.lat;
    let lng = e.latlng.lng;

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

document.addEventListener("DOMContentLoaded", function () {
  const submitBut = document.getElementById("submitReport");

  if (submitBut) {
    submitBut.addEventListener("click", function () {
      alert("Thank you for submitting a report :)");
      window.location.href = "Home.html"; 
    });
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
});