/* ======================
   GLOBAL STATE
====================== */
let courtData = {};            // date -> rows
let currentDate = null;
const STORAGE_KEY = "court_date_wise_register";

/* ======================
   INIT
====================== */
window.onload = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) courtData = JSON.parse(saved);

  const today = new Date().toISOString().slice(0,10);
  document.getElementById("registerDate").value = today;
  selectDate(today);
};

function saveAll() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courtData));
}

/* ======================
   DATE SELECT
====================== */
function selectDate(date) {
  currentDate = date;
  if (!courtData[date]) {
    courtData[date] = [];
  }
  showPreview(courtData[date]);
}

document.getElementById("registerDate")
  .addEventListener("change", e => selectDate(e.target.value));

/* ======================
   EXCEL UPLOAD (APPEND)
====================== */
function uploadExcel() {

  const input = document.getElementById("excelFile");
  if (!input.files.length) {
    alert("Excel select karo");
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {

    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type:"array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    let rows = XLSX.utils.sheet_to_json(sheet, { header:1 });

    // system header
    const header = ["Sr","Case No","Party","U/S","PS",
                    "SENT","RECEIVED","NEXT DATE",
                    "R-DATE","R-TIME","REMARKS"];

    if (courtData[currentDate].length === 0) {
      rows[0] = header;
      for (let i=1;i<rows.length;i++) {
        rows[i].length = 11;
        rows[i].fill("",5);
      }
      courtData[currentDate] = rows;
    } else {
      // append (skip header)
      for (let i=1;i<rows.length;i++) {
        let r = rows[i];
        r.length = 11;
        r.fill("",5);
        courtData[currentDate].push(r);
      }
    }

    saveAll();
    showPreview(courtData[currentDate]);
  };

  reader.readAsArrayBuffer(input.files[0]);
}

/* ======================
   TABLE + CALENDAR
====================== */
function showPreview(data) {
  const p = document.getElementById("preview");
  p.innerHTML = "";

  for (let i=1;i<data.length;i++) {

    let nextDate = data[i][7];
    if (data[i][6]==="RECEIVED" && !data[i][7]) {
      nextDate = `<input type="date"
                   onchange="saveNextDate(${i},this.value)">`;
    }

    p.innerHTML += `
      <tr>
        <td>${data[i][0]||""}</td>
        <td>${data[i][1]||""}</td>
        <td>${data[i][2]||""}</td>
        <td>${data[i][3]||""}</td>
        <td>${data[i][4]||""}</td>
        <td>${data[i][5]||""}</td>
        <td>${data[i][6]||""}</td>
        <td>${nextDate||""}</td>
        <td>${data[i][8]||""}</td>
        <td>${data[i][9]||""}</td>
        <td>${data[i][10]||""}</td>
      </tr>`;
  }
}

function saveNextDate(i,val){
  courtData[currentDate][i][7]=val;
  saveAll();
  showPreview(courtData[currentDate]);
}

/* ======================
   SCAN (BIG VIEW)
====================== */
function startSendScan(){ scan("SENT"); }
function startReceiveScan(){ scan("RECEIVED"); }

function scan(type){

  const box = document.getElementById("scanner");
  box.style.display="block";
  box.innerHTML="";

  const qr = new Html5Qrcode("scanner");
  qr.start({facingMode:"environment"},
           {fps:10,qrbox:280},
           txt => {

    for (let i=1;i<courtData[currentDate].length;i++) {
      if (String(courtData[currentDate][i][1]).trim() === txt.trim()) {

        if (type==="SENT") {
          courtData[currentDate][i][5]="SENT";
        } else {
          if (courtData[currentDate][i][5]!=="SENT") {
            alert("File SENT nahi hai");
            break;
          }
          courtData[currentDate][i][6]="RECEIVED";
          const d=new Date();
          courtData[currentDate][i][8]=d.toLocaleDateString();
          courtData[currentDate][i][9]=d.toLocaleTimeString();
        }
        break;
      }
    }

    saveAll();
    showPreview(courtData[currentDate]);
    qr.stop();
    box.style.display="none";
  });
}

/* ======================
   SEARCH / FILTER
====================== */
function searchData(){
  const k=document.getElementById("searchInput").value.toLowerCase();
  if(!k){ showPreview(courtData[currentDate]); return; }

  const f=[courtData[currentDate][0]];
  for(let i=1;i<courtData[currentDate].length;i++){
    if(courtData[currentDate][i].join(" ").toLowerCase().includes(k)){
      f.push(courtData[currentDate][i]);
    }
  }
  showPreview(f);
}

function showPending(){
  const f=[courtData[currentDate][0]];
  for(let i=1;i<courtData[currentDate].length;i++){
    if(courtData[currentDate][i][5]==="SENT" &&
       courtData[currentDate][i][6]!=="RECEIVED"){
      f.push(courtData[currentDate][i]);
    }
  }
  showPreview(f);
}

function showAll(){ showPreview(courtData[currentDate]); }

/* ======================
   DOWNLOAD
====================== */
function downloadExcel(){
  const ws=XLSX.utils.aoa_to_sheet(courtData[currentDate]);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Register");
  XLSX.writeFile(wb,`court_register_${currentDate}.xlsx`);
}

/* ======================
   CLEAR
====================== */
function clearAllData(){
  if(confirm("⚠️ Poora ALL-DATES data delete ho jayega. Confirm?")){
    courtData={};
    localStorage.removeItem(STORAGE_KEY);
    showPreview([]);
  }
}
