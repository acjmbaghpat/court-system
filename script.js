let currentData = [];
// 🚫 Prevent overwrite if data already exists
if (currentData && currentData.length > 0) {
  alert("Data already loaded / scanned.\nDobara upload se pehle data clear ya unlock karo.");
  return;
}
const UPLOAD_LOCK_KEY = "court_upload_locked";
const UPLOAD_PASSWORD = "1234"; // apna password yahan rakho
// =======================
// EXCEL UPLOAD
// =======================
function uploadExcel() {

  const fileInput = document.getElementById("excelFile");

  if (!fileInput.files.length) {
    alert("Select Excel file first");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {

    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!rows || rows.length < 2) {
      alert("Excel file empty or invalid");
      return;
    }

    // Add system columns
    rows[0] = [
      "Sr No",
      "Case No",
      "Party Name",
      "U/S",
      "PS",
      "SENT",
      "RECEIVED",
      "NEXT DATE",
      "RECEIVED DATE",
      "RECEIVED TIME",
      "REMARKS"
    ];

    for (let i = 1; i < rows.length; i++) {
      rows[i][5] = "";
      rows[i][6] = "";
      rows[i][7] = "";
      rows[i][8] = "";
      rows[i][9] = "";
      rows[i][10] = "";
    }

    currentData = rows;

    showPreview(currentData);

    alert("Excel uploaded successfully");
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

  reader.readAsArrayBuffer(fileInput.files[0]);
}
// 🔒 Lock upload after success
localStorage.setItem(UPLOAD_LOCK_KEY, "true");
document.getElementById("uploadBtn").disabled = true;

// =======================
// SHOW TABLE
// =======================
function showPreview(rows) {

  const preview = document.getElementById("preview");
  preview.innerHTML = "";

  for (let i = 1; i < rows.length; i++) {

    preview.innerHTML += `
      <tr>
        <td>${rows[i][0] || ""}</td>
        <td>${rows[i][1] || ""}</td>
        <td>${rows[i][2] || ""}</td>
        <td>${rows[i][3] || ""}</td>
        <td>${rows[i][4] || ""}</td>
        <td>${rows[i][5] || ""}</td>
        <td>${rows[i][6] || ""}</td>
        <td>${rows[i][7] || ""}</td>
        <td>${rows[i][8] || ""}</td>
        <td>${rows[i][9] || ""}</td>
        <td>${rows[i][10] || ""}</td>
      </tr>
    `;
  }
}


// =======================
// SCAN FILE (SEND)
// =======================
function startSendScan() {

  if (!currentData || currentData.length === 0) {
    alert("Pehle Excel upload kro");
    return;
  }

  const scannerDiv = document.getElementById("scanner");
  scannerDiv.innerHTML = "";

  const html5QrCode = new Html5Qrcode("scanner");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },

    (decodedText) => {

      let found = false;

      for (let i = 1; i < currentData.length; i++) {

        if (
          String(currentData[i][1]).trim().toUpperCase() ===
          decodedText.trim().toUpperCase()
        ) {

          currentData[i][5] = "SENT";
          showPreview(currentData);

          alert("FILE SENT");
          found = true;
          break;
        }
      }

      if (!found) {
        alert("ERROR: File not in uploaded list");
      }

      html5QrCode.stop();
      scannerDiv.innerHTML = "";
    }
  );
}
localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
// =======================
// SCAN FILE (RECEIVE)
// =======================
function startReceiveScan() {

  if (!currentData || currentData.length === 0) {
    alert("Pehle Excel upload kro");
    return;
  }

  const scannerDiv = document.getElementById("scanner");
  scannerDiv.innerHTML = "";

  const html5QrCode = new Html5Qrcode("scanner");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },

    (decodedText) => {

      let found = false;

      for (let i = 1; i < currentData.length; i++) {

        // Case No match
        if (
          String(currentData[i][1]).trim().toUpperCase() ===
          decodedText.trim().toUpperCase()
        ) {

          // Check SENT
          if (currentData[i][5] !== "SENT") {
            alert("ERROR: File SENT nahi hai");
            html5QrCode.stop();
            scannerDiv.innerHTML = "";
            return;
          }

          // Mark RECEIVED
          currentData[i][6] = "RECEIVED";

          const now = new Date();
          currentData[i][8] = now.toLocaleDateString();
          currentData[i][9] = now.toLocaleTimeString();

          showPreview(currentData);

          alert("FILE RECEIVED");
localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
          // NEXT DATE input
          askNextDate(i);

          found = true;
          break;
        }
      }

      if (!found) {
        alert("ERROR: File list me nahi hai");
      }

      html5QrCode.stop();
      scannerDiv.innerHTML = "";
    }
  );
}
// =======================
// NEXT DATE INPUT
// =======================
let currentRowForNextDate = null;

// Show calendar box
function askNextDate(rowIndex) {

  currentRowForNextDate = rowIndex;

  document.getElementById("calendarDate").value = "";
  document.getElementById("manualDate").value = "";

  document.getElementById("nextDateBox").style.display = "block";
}

// Save next date
function saveNextDate() {

  if (currentRowForNextDate === null) return;

  const calendarValue = document.getElementById("calendarDate").value;
  const manualValue = document.getElementById("manualDate").value;

  const finalDate = calendarValue || manualValue;

  if (!finalDate) {
    alert("Next date enter karo");
    return;
  }

  currentData[currentRowForNextDate][7] = finalDate;

  showPreview(currentData);

  document.getElementById("nextDateBox").style.display = "none";
  currentRowForNextDate = null;

  alert("Next Date Saved");
}
localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
// =======================
// DOWNLOAD EXCEL
// =======================
// =======================
// OPTION 1 : DOWNLOAD EXCEL (FINAL)
// =======================
function downloadExcel() {

  if (!currentData || currentData.length === 0) {
    alert("No data to download");
    return;
  }

  // Clean copy (remove HTML inputs)
  const cleanData = [];

  for (let i = 0; i < currentData.length; i++) {
    cleanData.push([
      currentData[i][0] || "",
      currentData[i][1] || "",
      currentData[i][2] || "",
      currentData[i][3] || "",
      currentData[i][4] || "",
      currentData[i][5] || "",
      currentData[i][6] || "",
      currentData[i][7] || "",
      currentData[i][8] || "",
      currentData[i][9] || "",
      currentData[i][10] || ""
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(cleanData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Court Register");

  XLSX.writeFile(wb, "court_register.xlsx");
}
// =======================
// OPTION 2 : SHOW PENDING FILES (FINAL)
// =======================
function showPending() {

  if (!currentData || currentData.length === 0) {
    alert("No data loaded");
    return;
  }

  const pending = [];
  pending.push(currentData[0]); // header

  for (let i = 1; i < currentData.length; i++) {
    if (
      currentData[i][5] === "SENT" &&
      currentData[i][6] !== "RECEIVED"
    ) {
      pending.push(currentData[i]);
    }
  }

  showPreview(pending);
}

function showAll() {
  showPreview(currentData);
}
// =======================
// SEARCH (FINAL STABLE)
// =======================
function searchData() {

  if (!currentData || currentData.length === 0) {
    return;
  }

  const keyword = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  // Agar empty hai to full list dikhao
  if (!keyword) {
    showPreview(currentData);
    return;
  }

  const filtered = [];

  // Header manually add karo
  filtered.push([
    "Sr No",
    "Case No",
    "Party Name",
    "U/S",
    "PS",
    "SENT",
    "RECEIVED",
    "NEXT DATE",
    "RECEIVED DATE",
    "RECEIVED TIME",
    "REMARKS"
  ]);

  for (let i = 1; i < currentData.length; i++) {

    const caseNo = String(currentData[i][1] || "").toLowerCase();
    const party  = String(currentData[i][2] || "").toLowerCase();
    const section= String(currentData[i][3] || "").toLowerCase();
    const ps     = String(currentData[i][4] || "").toLowerCase();

    if (
      caseNo.includes(keyword) ||
      party.includes(keyword) ||
      section.includes(keyword) ||
      ps.includes(keyword)
    ) {
      filtered.push(currentData[i]);
    }
  }

  showPreview(filtered);
}
window.onload = function () {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    currentData = JSON.parse(saved);
    showPreview(currentData);
  }
  document.getElementById("uploadBtn").disabled = currentData.length > 0;
};
// =======================
// UNLOCK UPLOAD

function unlockUpload() {

  const pwd = prompt("Upload unlock password dalo");

  if (pwd === UPLOAD_PASSWORD) {
    localStorage.removeItem(UPLOAD_LOCK_KEY);
    document.getElementById("uploadBtn").disabled = false;
    alert("Upload unlocked");
  } else {
    alert("Wrong password");
  }
}
window.addEventListener("load", function () {

  const locked = localStorage.getItem(UPLOAD_LOCK_KEY);

  if (locked === "true") {
    const btn = document.getElementById("uploadBtn");
    if (btn) btn.disabled = true;
  }
});
