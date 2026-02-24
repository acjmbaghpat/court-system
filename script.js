let currentData = [];
const STORAGE_KEY = "court_register";

// ================= LOAD SAVED =================
window.onload = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    currentData = JSON.parse(saved);
    showPreview(currentData);
  }
};

// ================= EXCEL UPLOAD =================
function uploadExcel() {

  const input = document.getElementById("excelFile");
  if (!input.files.length) {
    alert("Excel select karo");
    return;
  }

  // 🚫 overwrite protection
  for (let i = 1; i < currentData.length; i++) {
    if (currentData[i][5] === "SENT" || currentData[i][6] === "RECEIVED") {
      alert("Files already scanned. Clear data first.");
      return;
    }
  }

  const reader = new FileReader();
  reader.onload = e => {

    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    let rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    rows[0] = ["Sr","Case No","Party","U/S","PS","SENT","RECEIVED","NEXT DATE","R-DATE","R-TIME","REMARKS"];

    for (let i=1;i<rows.length;i++){
      rows[i][5]=rows[i][6]=rows[i][7]=rows[i][8]=rows[i][9]=rows[i][10]="";
    }

    currentData = rows;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
    showPreview(currentData);
  };

  reader.readAsArrayBuffer(input.files[0]);
}

// ================= SHOW TABLE + CALENDAR =================
function showPreview(data) {
  const p = document.getElementById("preview");
  p.innerHTML = "";

  for (let i=1;i<data.length;i++) {

    let nextDate = data[i][7];
    if (data[i][6] === "RECEIVED" && !data[i][7]) {
      nextDate = `<input type="date" onchange="saveNextDate(${i}, this.value)">`;
    }

    p.innerHTML += `
      <tr>
        <td>${data[i][0]}</td>
        <td>${data[i][1]}</td>
        <td>${data[i][2]}</td>
        <td>${data[i][3]}</td>
        <td>${data[i][4]}</td>
        <td>${data[i][5]}</td>
        <td>${data[i][6]}</td>
        <td>${nextDate}</td>
        <td>${data[i][8]}</td>
        <td>${data[i][9]}</td>
        <td>${data[i][10]}</td>
      </tr>`;
  }
}

function saveNextDate(i,val){
  currentData[i][7]=val;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
  showPreview(currentData);
}

// ================= SCAN =================
function startSendScan(){ scan("SENT"); }
function startReceiveScan(){ scan("RECEIVED"); }

function scan(type){
  const qr = new Html5Qrcode("scanner");
  qr.start({facingMode:"environment"},{fps:10,qrbox:250}, txt=>{
    for(let i=1;i<currentData.length;i++){
      if(String(currentData[i][1]).trim()===txt.trim()){
        if(type==="SENT") currentData[i][5]="SENT";
        else {
          if(currentData[i][5]!=="SENT"){ alert("Not SENT"); break; }
          currentData[i][6]="RECEIVED";
          const d=new Date();
          currentData[i][8]=d.toLocaleDateString();
          currentData[i][9]=d.toLocaleTimeString();
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
        showPreview(currentData);
        break;
      }
    }
    qr.stop();
  });
}

// ================= SEARCH =================
function searchData(){
  const k=document.getElementById("searchInput").value.toLowerCase();
  if(!k){ showPreview(currentData); return; }
  const f=[currentData[0]];
  for(let i=1;i<currentData.length;i++){
    if(currentData[i].join(" ").toLowerCase().includes(k)){
      f.push(currentData[i]);
    }
  }
  showPreview(f);
}

// ================= FILTER =================
function showPending(){
  const f=[currentData[0]];
  for(let i=1;i<currentData.length;i++){
    if(currentData[i][5]==="SENT" && currentData[i][6]!=="RECEIVED") f.push(currentData[i]);
  }
  showPreview(f);
}
function showAll(){ showPreview(currentData); }

// ================= DOWNLOAD =================
function downloadExcel(){
  const ws=XLSX.utils.aoa_to_sheet(currentData);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Register");
  XLSX.writeFile(wb,"court_register.xlsx");
}

// ================= CLEAR =================
function clearAllData(){
  if(confirm("Clear all data?")){
    currentData=[];
    localStorage.removeItem(STORAGE_KEY);
    showPreview([]);
  }
}
