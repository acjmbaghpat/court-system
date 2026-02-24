alert("script.js loaded");
let currentData = [];

// =======================
// EXCEL UPLOAD FUNCTION
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

    if (rows[0].length < 5) {
      alert("Excel must have 5 columns");
      return;
    }

    // Add system headers
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

    currentData = rows;   // VERY IMPORTANT

    showPreview(currentData);

    alert("Excel uploaded successfully");
  };

  reader.readAsArrayBuffer(fileInput.files[0]);
}


// =======================
// SHOW PREVIEW
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
// SCAN SEND
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
