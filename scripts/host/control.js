/* ------------  
  Control.js
  
  Requires global.js.
  
  Routines for the hardware simulation, NOT for our client OS itself. In this manner, it's A LITTLE BIT like a hypervisor,
  in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code that
  hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using JavaScript in 
  both the host and client environments.
  
  This (and other host/simulation scripts) is the only place that we should see "web" code, like 
  DOM manipulation and JavaScript event handling, and so on.  (Index.html is the only place for markup.)
  
  This code references page numbers in the text book: 
  Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */


//
// Control Services
//
function hostInit()
{
	// Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
	_Canvas  = document.getElementById('display');
  
	// Get a global reference to the drawing context.
	_DrawingContext = _Canvas.getContext('2d');
  
	// Enable the added-in canvas text functions (see canvastext.js for provenance and details).
	CanvasTextFunctions.enable(_DrawingContext);   // TODO: Text functionality is now built in to the HTML5 canvas. Consider using that instead.
  
	// Clear the log text box.
	document.getElementById("taLog").value="";
  
	// Set focus on the start button.
  document.getElementById("btnStartOS").focus();
  
  // Check for our testing and enrichment core.
  if (typeof Glados === "function") {
    _GLaDOS = new Glados();
    _GLaDOS.init();
  };
  
}

function hostLog(msg, source)
{
  // Check the source.
  if (!source) {
    source = "?";
  }
  
  // Note the OS CLOCK.
  var clock = _OSclock;
  
  // Note the REAL clock in milliseconds since January 1, 1970.
  var now = new Date().getTime();
  
  // Build the log string.   
  var str = "[" + clock + "~" + now + "][" + source + "]:" + msg + "\n";
  
  // Update the log console.
  var taLog = document.getElementById("taLog");
  // stack idle messages
  if (msg == "Idle"){
    // results in array with index 0: entire idle line, index 1: bracketed repeat number, index 2: repeat number without brackets
    var latestMessageIdle = taLog.value.match(/^\[[0-9~]*?\]\[OS\]:Idle( \[(\d*?)\])?/);
    // check if the last message was an idle message
    if (latestMessageIdle != null){
      // if it was, check to see if it was a stack of idle messages (i.e. it had a repeat number, e.g. Idle [2])
      if (latestMessageIdle[2] == null){
        // last idle message wasn't a stack; the new idle message will turn it into a stack of 2
        taLog.value = str.substring(0, str.length - 1) + " [2]" + taLog.value.substring(latestMessageIdle[0].length);
      }
      else{
        // last idle message was a stack; the new idle message will make the stack one message higher
        taLog.value = str.substring(0, str.length - 1) + " [" + (parseInt(latestMessageIdle[2]) + 1) + "]" + taLog.value.substring(latestMessageIdle[0].length);
      }
    }
    else{
      taLog.value = str + taLog.value;
    }
  }
  else{
    taLog.value = str + taLog.value;
  }
  
  // Optionally update a log database or some streaming service.
  var statusBar = document.getElementById("divTaskbar");
  var d = new Date();
  divTaskbar.innerHTML = "Date: " + d.toString() + " ~ Status: " + _Status;
}

function memoryTableInit(){
  // initialize the memory display
  var tableString = "";
  for (var i = 0; i < _Memory.length; i++){
    if (i % 8 == 0){
      if (tableString.length == 0){
        tableString += "<tr>";
      }
      else{
        tableString += "</tr><tr>";
      }
      tableString += "<th>0x";
      // pad the memory number with leading zeroes
      for (var j = i.toString(16).length; j < 3; j++){
        tableString += "0";
      }
      tableString += i.toString(16).toUpperCase();
      tableString += "</th>";
    }
    tableString += "<td>00</td>";
  }
  tableString += "</tr>";
  $("#tableMemory").html(tableString);
}

function memoryTableUpdate(index, value){
  var tr = Math.floor(index / 8);
  var td = index % 8;
  $("#tableMemory tr").eq(tr).children("td").eq(td).html(value);
}

function cpuTableUpdate(){
  var cells = ["PC", "Acc", "Xreg", "Yreg", "Zflag"];
  for (var i = 0; i < cells.length; i++){
    if (cells[i] == "PC"){
      var PC = _CPU[cells[i]].toString(16).toUpperCase();
      while (PC.length < 3){
        PC = "0" + PC;
      }
      PC = "0x" + PC;
      $("#tableCpu tr td").eq(i).html(PC);
    }
    else{
      $("#tableCpu tr td").eq(i).html(_CPU[cells[i]]);
    }
  }
}

function rqTableUpdate(){
  var cells = ["pid", "state", "pc", "acc", "x", "y", "z", "base", "limit"];
  $("#tableReadyQueue tr").slice(1).remove(); // remove existing pcb rows
  for (var i = 0; i < _ReadyQueue.getSize(); i++){
    $("#tableReadyQueue").append("<tr></tr>");
    var newRow = $("#tableReadyQueue tr").eq(1);
    for (var j = 0; j < cells.length; j++){
      if (cells[j] == "pc"){
        var PC = _CurrentProcess[cells[j]].toString(16).toUpperCase();
        while (PC.length < 3){
          PC = "0" + PC;
        }
        PC = "0x" + PC;
        newRow.append("<td>" + PC + "</td>");
      }
      else{
        newRow.append("<td>" + _CurrentProcess[cells[j]] + "</td>");
      }
    }
  }
}

//
// Control Events
//
function hostBtnStartOS_click(btn)
{
  // Disable the start button...
  btn.disabled = true;
  
  // .. enable the Halt and Reset buttons ...
  document.getElementById("btnHaltOS").disabled = false;
  document.getElementById("btnReset").disabled = false;
  
  // .. set focus on the OS console display ... 
  document.getElementById("display").focus();
  
  // ... Create and initialize the CPU ...
  _CPU = new Cpu();
  _CPU.init();
  
  _Memory = new Memory();
  
  _MemoryManager = new MemoryManager();
  _MemoryManager.init();
  
  _Processes = new Array();
  
  _ReadyQueue = new Queue();
  
  // ... then set the host clock pulse ...
  _hardwareClockID = setInterval(hostClockPulse, CPU_CLOCK_INTERVAL);
  // .. and call the OS Kernel Bootstrap routine.
  krnBootstrap();
}

function hostBtnHaltOS_click(btn)
{
  hostLog("emergency halt", "host");
  hostLog("Attempting Kernel shutdown.", "host");
  // Call the OS shutdown routine.
  krnShutdown();
  // Stop the JavaScript interval that's simulating our clock pulse.
  clearInterval(_hardwareClockID);
  // TODO: Is there anything else we need to do here?
}

function hostBtnReset_click(btn)
{
  // The easiest and most thorough way to do this is to reload (not refresh) the document.
  location.reload(true);  
  // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
  // be reloaded from the server. If it is false or not specified, the browser may reload the 
  // page from its cache, which is not what we want.
}
