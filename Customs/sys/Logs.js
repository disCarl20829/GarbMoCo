let mainMap;
let mainMarker;
let allReports = [];

// Load logs from backend
async function loadLogs() {
  try {
    const res = await fetch("Customs/dbase/LoadLogs.php");
    const reports = await res.json();
    allReports = Array.isArray(reports) ? reports : [];
    allReports.sort((a, b) => Number(b.id) - Number(a.id));
    displayFilteredLogs(allReports);
  } catch (err) {
    console.error("Error loading logs:", err);
    allReports = [];
    displayFilteredLogs([]);
  }
}

// Display log cards
function displayFilteredLogs(reports) {
  const container = document.getElementById("logContainer");
  container.innerHTML = "";

  if (!reports || reports.length === 0) {
    container.innerHTML = "<p>No matching logs found.</p>";
    return;
  }

  reports.forEach((r) => createCard(r, container));
}

// Create individual log card
function createCard(report, container) {
  const collected = Number(report.isCollected) === 1 ? "Yes" : "No";
  const agree1 = Number(report.isAgree1) === 1 ? "Yes" : "No";
  const agree2 = Number(report.isAgree2) === 1 ? "Yes" : "No";

  const log = document.createElement("div");
  log.className = "logCard";

  const infoDiv = document.createElement("div");
  infoDiv.className = "logInfo";
  infoDiv.innerHTML = `
    <div><b>Log ID:</b> ${report.id}</div>
    <div><b>User ID:</b> ${report.user_id}</div>
    <div><b>Type:</b> ${report.type}</div>
    <div><b>Location:</b> ${report.location}</div>
    <div><b>Latitude:</b> ${report.latitude}</div>
    <div><b>Longitude:</b> ${report.longitude}</div>
    <div><b>Description:</b> ${report.description}</div>
    <div><b>Timestamp:</b> ${report.created_at}</div>
    <div><b>Collected:</b> ${collected}</div>
    <div><b>Misinformation Agreement:</b> ${agree1}</div>
    <div><b>User Data Agreement:</b> ${agree2}</div>
  `;

  const mapDiv = document.createElement("div");
  mapDiv.className = "miniMap";
  mapDiv.id = `miniMap-${report.id}`;

  const imgDiv = document.createElement("div");
  imgDiv.className = "logImages";

  (report.images || []).forEach(src => {
    if (src.trim()) {
      const img = document.createElement("img");
      img.src = encodeURI(src);
      img.alt = "Report Image";
      img.loading = "lazy";
      img.onclick = () => openViewer(src);
      imgDiv.appendChild(img);
    }
  });

  log.appendChild(mapDiv);
  log.appendChild(infoDiv);
  log.appendChild(imgDiv);
  container.appendChild(log);

  const lat = Number(report.latitude);
  const lng = Number(report.longitude);
  if (!isNaN(lat) && !isNaN(lng)) initMiniMap(mapDiv.id, lat, lng);
  else mapDiv.innerHTML = "<div style='padding:12px;font-size:12px;color:#666;'>No coordinates</div>";

  log.addEventListener("click", () => displayLogInfo(report));
}

// Display selected log info in the main panel
function displayLogInfo(log) {
  document.getElementById("logId").textContent = log.id;
  document.getElementById("userId").textContent = log.user_id;
  document.getElementById("type").textContent = log.type;
  document.getElementById("location").textContent = log.location;
  document.getElementById("lat").textContent = log.latitude;
  document.getElementById("lng").textContent = log.longitude;
  document.getElementById("desc").textContent = log.description;
  document.getElementById("timestamp").textContent = log.created_at;
  document.getElementById("collected").textContent = Number(log.isCollected) === 1 ? "Yes" : "No";
  document.getElementById("agree1").textContent = Number(log.isAgree1) === 1 ? "Yes" : "No";
  document.getElementById("agree2").textContent = Number(log.isAgree1) === 1 ? "Yes" : "No";

  // Display images
  const imgsContainer = document.getElementById("logImages");
  imgsContainer.innerHTML = "";
  (log.images || []).forEach(src => {
    if (src.trim()) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Report image";
      img.onclick = () => openViewer(src);
      imgsContainer.appendChild(img);
    }
  });

  // Display videos
  const vidsContainer = document.getElementById("logVideos");
  vidsContainer.innerHTML = "";
  (log.videos || []).forEach(src => {
    if (src.trim()) {
      const vid = document.createElement("video");
      vid.src = src;
      vid.controls = true;
      vid.width = 200;
      vid.style.borderRadius = "10px";
      vid.style.marginTop = "8px";
      vidsContainer.appendChild(vid);
    }
  });

  // Display main map
  const lat = Number(log.latitude);
  const lng = Number(log.longitude);
  if (!isNaN(lat) && !isNaN(lng)) {
    if (!mainMap) {
      mainMap = L.map("mainmap").setView([lat, lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mainMap);
      mainMarker = L.marker([lat, lng]).addTo(mainMap);
    } else {
      mainMap.setView([lat, lng], 13);
      mainMarker.setLatLng([lat, lng]);
    }
    mainMap.dragging.disable();
    mainMap.touchZoom.disable();
    mainMap.doubleClickZoom.disable();
  }
  // Handle "Mark as Collected" button
  const btnContainer = document.getElementById("collectBtnContainer");
  btnContainer.innerHTML = ""; // clear any previous button

  fetch("Customs/dbase/LogsChecker.php")
    .then(res => res.text())
    .then(role => {
      const isAdmin = role.trim().toLowerCase() === "admin";
      const isCollected = Number(log.isCollected) === 1;

      if (isAdmin && !isCollected) {
        const btn = document.createElement("button");
        btn.textContent = "Mark as Collected";
        btn.className = "collect-btn";
        btn.style.marginTop = "10px";
        btn.style.padding = "6px 12px";
        btn.style.border = "none";
        btn.style.backgroundColor = "#4CAF50";
        btn.style.color = "#fff";
        btn.style.borderRadius = "4px";
        btn.style.cursor = "pointer";

        btn.onclick = async () => {
          if (!confirm("Mark this log as collected?")) return;

          try {
            const res = await fetch("Customs/dbase/UpdateCollected.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: log.id })
            });

            const text = await res.text();
            let result;

            try {
              result = JSON.parse(text);
            } catch {
              throw new Error("Invalid JSON response: " + text);
            }

            if (result.status === "success") {
              alert(result.message);
              log.isCollected = 1;
              displayLogInfo(log); // refresh the right-side panel
              loadLogs(); // refresh the list below
            } else {
              alert("Failed to update report: " + result.message);
            }
          } catch (err) {
            console.error("Error:", err);
            alert("An unexpected error occurred. Please check the console.");
          }
        };

        btnContainer.appendChild(btn);
      }
    })
    .catch(err => console.error("Error checking role:", err));
}
// Initialize mini map
function initMiniMap(mapId, lat, lng) {
  const el = document.getElementById(mapId);
  if (!el || el.dataset.mapInitialized) return;
  const map = L.map(mapId, { center: [lat, lng], zoom: 13, zoomControl: false, attributionControl: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  L.marker([lat, lng]).addTo(map);
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  el.dataset.mapInitialized = "1";
}

// Filters
function applyFilters() {
  let filtered = [...allReports];
  const typeValue = document.getElementById("typeFilter").value;
  const dateValue = document.getElementById("dateFilter").value;
  const idValue = document.getElementById("idFilter")?.value.trim();

  if (typeValue === "Collected") filtered = filtered.filter(r => Number(r.isCollected) === 1);
  else if (typeValue === "Uncollected") filtered = filtered.filter(r => Number(r.isCollected) === 0);
  else if (typeValue === "ID" && idValue) filtered = filtered.filter(r => String(r.id) === idValue);

  if (dateValue) filtered = filtered.filter(r => r.created_at && new Date(r.created_at).toISOString().split("T")[0] === dateValue);

  displayFilteredLogs(filtered);
}

function resetFilters() {
  document.getElementById("typeFilter").value = "all";
  document.getElementById("idFilter").value = "";
  document.getElementById("dateFilter").value = "";
  document.getElementById("idFilterContainer").style.display = "none";
  displayFilteredLogs(allReports);
}

function handleTypeChange() {
  const type = document.getElementById("typeFilter").value;
  const idContainer = document.getElementById("idFilterContainer");
  const idInput = document.getElementById("idFilter");
  if (type === "ID") {
    idContainer.style.display = "inline-block";
    idInput.focus();
  } else {
    idContainer.style.display = "none";
    idInput.value = "";
  }
  applyFilters();
}

// Image viewer
function openViewer(src) {
  const viewer = document.getElementById("imageViewer");
  const img = document.getElementById("viewerImg");
  if (viewer && img) {
    img.src = src;
    viewer.style.display = "flex";
  }
}

function closeViewer() {
  const viewer = document.getElementById("imageViewer");
  if (viewer) viewer.style.display = "none";
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadLogs();
  handleTypeChange();
  document.getElementById("searchBtn").addEventListener("click", applyFilters);
  document.getElementById("resetBtn").addEventListener("click", resetFilters);
  document.getElementById("typeFilter").addEventListener("change", handleTypeChange);
});
