/* ===== MESSAGE BOX ===== */
function showMsg(text,type){
  let m=document.getElementById("msg");
  m.innerText=text;
  m.className=type;
  m.style.display="block";
  setTimeout(()=>m.style.display="none",2500);
}

/* ===== DATE KEY ===== */
function todayKey(){
  return "court_"+new Date().toISOString().split("T")[0];
}

/* ===== RECEIVE FILE ===== */
function receiveFile(){
 try{
  let key=todayKey();
  let data=JSON.parse(localStorage.getItem(key))||[];

  data.push({
    diary:document.getElementById("diary").value,
    party:document.getElementById("party").value,
    section:document.getElementById("section").value,
    ps:document.getElementById("ps").value,
    status:"Received",
    time:new Date().toLocaleTimeString()
  });

  localStorage.setItem(key,JSON.stringify(data));
  showMsg("File Received & Saved ✅","success");
 }catch(e){
  showMsg("Receive Error ❌","error");
 }
}

/* ===== SEND FILE ===== */
function sendFile(){
 try{
  let key=todayKey();
  let data=JSON.parse(localStorage.getItem(key))||[];

  data.push({
    diary:document.getElementById("diary").value,
    status:"Sent",
    time:new Date().toLocaleTimeString()
  });

  localStorage.setItem(key,JSON.stringify(data));
  showMsg("File Sent & Saved ✅","success");
 }catch(e){
  showMsg("Sent Error ❌","error");
 }
}

/* ===== BARCODE SCAN ===== */
let html5QrCode;
function startScan(){
 html5QrCode = new Html5Qrcode("reader");
 html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  code => {
    document.getElementById("diary").value=code;
    showMsg("Barcode Scanned ✔","success");
    html5QrCode.stop();
  },
  err => {}
 );
}

/* ===== EXCEL UPLOAD ===== */
function uploadExcel(){
 let file=document.getElementById("excel").files[0];
 if(!file){
   showMsg("No Excel Selected ❌","error");
   return;
 }

 let reader=new FileReader();
 reader.onload=e=>{
  let wb=XLSX.read(e.target.result,{type:"binary"});
  let sheet=wb.Sheets[wb.SheetNames[0]];
  let excelData=XLSX.utils.sheet_to_json(sheet);

  localStorage.setItem(todayKey(),JSON.stringify(excelData));
  showMsg("Excel Uploaded Successfully 📁","success");
 };
 reader.readAsBinaryString(file);
}

/* ===== EXCEL DOWNLOAD ===== */
function downloadExcel(){
 let data=JSON.parse(localStorage.getItem(todayKey()))||[];
 if(data.length===0){
   showMsg("No Data For Today ❌","error");
   return;
 }

 let ws=XLSX.utils.json_to_sheet(data);
 let wb=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb,ws,"Today");
 XLSX.writeFile(wb,"Court_"+todayKey()+".xlsx");

 showMsg("Excel Downloaded ✔","success");
}
