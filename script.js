let html5QrCode;
let currentData = [];

/* ===== MESSAGE PROMPT ===== */
function showMsg(text, type) {
  let m = document.getElementById("msg");
  m.innerText = text;
  m.className = type;
  m.style.display = "block";
  setTimeout(() => m.style.display = "none", 2500);
}

/* ===== DATE KEY (PHONE STORAGE) ===== */
function storageKey() {
  let d = document.getElementById("workDate").value;
  if (!d) {
    showMsg("पहले तारीख चुनें ❌", "error");
    return null;
  }
  return "court_" + d;
}

/* ===== LOAD DATE DATA ===== */
document.getElementById("workDate").addEventListener("change", () => {
  let k = storageKey();
  if (!k) return;
  currentData = JSON.parse(localStorage.getItem(k)) || [];
  drawTable(currentData);
});

/* ===== EXCEL UPLOAD ===== */
function uploadExcel() {
  let file = document.getElementById("excelFile").files[0];
  if (!file) {
    showMsg("Excel चुनें ❌", "error");
    return;
  }

  let reader = new FileReader();
  reader.onload = e => {
    let wb = XLSX.read(e.target.result, { type: "binary" });
    let sheet = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

    currentData = sheet.map(r => ({
      srno: r.srno || "",
      caseno: r["case no"] || "",
      party: r["party name"] || "",
      section: r.section || "",
      ps: r.ps || "",
      sent: "",
      received: "",
      nextDate: "",
      receivedDate: "",
      remark: ""
    }));

    localStorage.setItem(storageKey(), JSON.stringify(currentData));
    drawTable(currentData);
    showMsg("Excel File Has Been Uploaded ✅", "success");
  };
  reader.readAsBinaryString(file);
}

/* ===== QR SCAN (SEND / RECEIVE) ===== */
function startScan() {
  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    code => {
      let row = currentData.find(x => x.caseno == code);
      if (!row) {
        showMsg("Mismatch Problem ❌", "error");
      } else {
        if (!row.sent) {
          row.sent = "YES";
          showMsg("Sent ✔", "success");
        } else {
          row.received = "YES";
          row.receivedDate = new Date().toLocaleDateString();
          showMsg("File Received ✔", "success");
        }
        localStorage.setItem(storageKey(), JSON.stringify(currentData));
        drawTable(currentData);
      }
      html5QrCode.stop();
    }
  );
}

/* ===== NEXT DATE SAVE ===== */
function saveNextDate() {
  let nd = document.getElementById("nextDate").value;
  if (!nd) {
    showMsg("Next Date चुनें ❌", "error");
    return;
  }
  currentData.forEach(r => r.nextDate = nd);
  localStorage.setItem(storageKey(), JSON.stringify(currentData));
  drawTable(currentData);
  showMsg("Next Date Mentioned ✔", "success");
}

/* ===== SEARCH ===== */
function searchData(val) {
  let f = currentData.filter(r =>
    JSON.stringify(r).toLowerCase().includes(val.toLowerCase())
  );
  drawTable(f);
}

/* ===== TABLE DRAW ===== */
function drawTable(data) {
  let t = document.getElementById("table");
  t.innerHTML = "";
  if (data.length === 0) return;

  let heads = Object.keys(data[0]);
  t.innerHTML = "<tr>" + heads.map(h => `<th>${h}</th>`).join("") + "</tr>";

  data.forEach(r => {
    t.innerHTML += "<tr>" +
      heads.map(h => `<td>${r[h] || ""}</td>`).join("") +
      "</tr>";
  });
}

/* ===== EXCEL DOWNLOAD ===== */
function downloadExcel() {
  let ws = XLSX.utils.json_to_sheet(currentData);
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, "Court_Data.xlsx");
}
