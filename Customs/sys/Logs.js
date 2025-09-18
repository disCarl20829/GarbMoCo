async function loadLogs() {
  try {
    const res = await fetch("Customs/dbase/LoadLogs.php");
    const reports = await res.json();

    const container = document.getElementById("logContainer");
    container.innerHTML = "";

    reports.forEach(r => createCard(r, container));
  } catch (err) {
    console.error("Error loading logs:", err);
  }
}

function createCard(report, container) {
  let collected = (Number(report.isCollected) === 1) ? "Yes" : "No";
  let agree = (Number(report.isAgree) === 1) ? "Yes" : "No";

  if (collected === "No" && agree === "No") {
    alert("Warning: Report ID " + report.id + " has both 'Collected' and 'User Agreement' set to 'No'.");
  } else {
    console.log("Report ID " + report.id + " is valid.");
  }

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
    <div><b>User Agreement:</b> ${agree}</div>
  `;

  const mapDiv = document.createElement("div");
  mapDiv.className = "miniMap";
  mapDiv.id = `miniMap-${report.id}`;

  const imgDiv = document.createElement("div");
  imgDiv.className = "logImages";

  /*
  report.image_path.split(",").forEach(src => {
    src = src.trim();
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Report Image";
      img.onerror = () => {
        console.warn("Image failed:", src);
        img.style.display = "none";
      };
      img.onclick = () => openViewer(src);
      imgDiv.appendChild(img);
    }
  });

  */

  report.images.forEach(src => {
    if (src && src.trim() !== "") {
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

  initMiniMap(`miniMap-${report.id}`, report.latitude, report.longitude);
}

function openViewer(src) {
  document.getElementById("viewerImg").src = src;
  document.getElementById("imageViewer").style.display = "flex";
}

function closeViewer() {
  document.getElementById("imageViewer").style.display = "none";
}

function initMiniMap(mapId, lat, lng) {
  const map = L.map(mapId, {
    center: [lat, lng],
    zoom: 15,
    zoomControl: true,
    attributionControl: true,

  });

  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  L.marker([lat, lng]).addTo(map);
}