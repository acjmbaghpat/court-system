let currentData = null;
function uploadExcel() {

  const date = document.getElementById("workDate").value;
  const fileInput = document.getElementById("excelFile");

  if (!date) {
    alert("Select date first");
    return;
  }

  if (!fileInput.files.length) {
    alert("Select Excel file");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

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
        </tr>
      `;
    }

    document.getElementById("msg").innerText =
      "Excel uploaded for date: " + date;
  };

  reader.readAsArrayBuffer(fileInput.files[0]);
}
function showPreview(rows) {
  currentData = rows;
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
function startSendScan() {

  const date = document.getElementById("workDate").value;
  if (!date) {
    alert("Select date first");
    return;
  }

 const data = window.currentDateData;
  if (!data) {
  alert("Please select date again");
  return;
}
  if (!data) {
    alert("No data for selected date");
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

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][1]).trim() === decodedText.trim()) {

          data[i][5] = "SENT"; // SENT column
          localStorage.setItem("date_" + date, JSON.stringify(data));
          showPreview(data);

          alert("FILE SENT");
          found = true;
          break;
        }
      }

      if (!found) {
        alert("ERROR: File not in today's list");
      }

      html5QrCode.stop();
      scannerDiv.innerHTML = "";
    }
  );
}
document.getElementById("workDate").addEventListener("change", function () {

  const date = this.value;
  const saved = localStorage.getItem("date_" + date);

  if (saved) {
    const data = JSON.parse(saved);
    showPreview(data);
    document.getElementById("msg").innerText =
      "Loaded saved data for " + date;
  } else {
    document.getElementById("preview").innerHTML = "";
    document.getElementById("msg").innerText =
      "No data saved for this date";
  }

});
// AUTO LOAD DATA WHEN DATE IS SELECTED
document.getElementById("workDate").addEventListener("change", function () {

  const date = this.value;
  const savedData = localStorage.getItem("date_" + date);

  if (!savedData) {
    alert("Is date ke liye koi Excel upload nahi hai");
    return;
  }

  window.currentDateData = JSON.parse(savedData);
  showPreview(window.currentDateData);
});
function startSendScan() {

  if (!currentData) {
    alert("Pehle Excel upload karo");
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
        if (String(currentData[i][1]).trim() === decodedText.trim()) {

          currentData[i][5] = "SENT"; // SENT column
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
