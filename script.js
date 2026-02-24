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
