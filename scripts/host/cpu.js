/* ------------  
  CPU.js
  
  Requires global.js.
  
  Routines for the host CPU simulation, NOT for the OS itself.  
  In this manner, it's A LITTLE BIT like a hypervisor,
  in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
  that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
  JavaScript in both the host and client environments.
  
  This code references page numbers in the text book: 
  Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */

function Cpu() {
  this.PC    = 0;     // Program Counter
  this.Acc   = 0;     // Accumulator
  this.Xreg  = 0;     // X register
  this.Yreg  = 0;     // Y register
  this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
  this.isExecuting = false;
  
  this.init = function() {
    this.PC    = 0;
    this.Acc   = 0;
    this.Xreg  = 0;
    this.Yreg  = 0;
    this.Zflag = 0;      
    this.isExecuting = false;
    cpuTableUpdate(); // defined in control.js
  };
  
  this.cycle = function() {
    krnTrace("CPU cycle");
    // TODO: Accumulate CPU usage and profiling statistics here.
    // Do the real work here. Be sure to set this.isExecuting appropriately.
    this.execute(this.fetch());
    cpuTableUpdate(); // defined in control.js
  };
  
  this.fetch = function(){
    return _MemoryManager.read(this.PC++, _CurrentProcess);
  };
  
  // call the function with the same name as the op code
  // underscore prepended because function names cannot start with numbers
  this.execute = function(opCode){
    try{
      this["_" + opCode]();
    }
    catch(e){
      this._00();
    }
  };
  
  this.getOperand = function(){
    var operand = _MemoryManager.read(this.PC++, _CurrentProcess);
    if (operand != null){
      return operand;
    }
    else{
      hostLog("Terminating process early", "OS");
      this._00();
    }
  };
  
  // addresses span two bytes; grab both and return them concatenated correctly
  this.getAddress = function(){
    // address is out of order in opcode stream
    var address = this.getOperand();
    address = this.getOperand() + address;
    return address;
  }
  
  this._A9 = function(){
    _CPU.Acc = parseInt(this.getOperand(), 16);
  };
  
  this._AD = function(){
    var memoryContent = _MemoryManager.read(this.getAddress(), _CurrentProcess);
    if (memoryContent != null){
      this.Acc = parseInt(memoryContent);
    }
    else{
      hostLog("Terminating process early", "OS");
      this._00();
    }
  };
  
  this._8D = function(){
    var accToBeStored = this.Acc.toString(16).toUpperCase();
    if (accToBeStored.length == 1){
      accToBeStored = "0" + accToBeStored;
    }
    if (!_MemoryManager.write(this.getAddress(), accToBeStored, _CurrentProcess)){
      hostLog("Terminating process early", "OS");
      this._00();
    }
  };
  
  this._6D = function(){
    var memoryContent = _MemoryManager.read(this.getAddress(), _CurrentProcess);
    if (memoryContent != null){
      this.Acc += parseInt(memoryContent, 16);
    }
    else{
      hostLog("Terminating process early", "OS");
      this._00();
    }
  };
  
  this._A2 = function(){
    this.Xreg = parseInt(getOperand(), 16);
  };
  
  this._AE = function(){
    
  };
  
  this._A0 = function(){
    
  };
  
  this._AC = function(){
    
  };
  
  this._EA = function(){
    
  };
  
  this._00 = function(){
    var cpuVars = ["PC", "Acc", "", "Xreg", "Yreg", "Zflag"];
    var pcbVars = ["PC", "Acc", "PID", "X", "Y", "Z", "Base", "Limit"];
    // update the pcb's registers with the cpu's
    for (var i = 0; i < cpuVars.length; i++){
      if (cpuVars[i].length > 0){
        _CurrentProcess[pcbVars[i].toLowerCase()] = this[cpuVars[i]];
      }
    }
    // build and output a log string containing the pcb contents
    var logString = "Finished executing. PCB contents: ";
    var insertDelimiter = false;
    for (var i = 0; i < pcbVars.length; i++){
      if (insertDelimiter){
        logString += ", ";
      }
      if (pcbVars[i] == "PC"){
        var PC = _CurrentProcess[pcbVars[i].toLowerCase()].toString(16).toUpperCase();
        while (PC.length < 3){
          PC = "0" + PC;
        }
        logString += "PC=0x" + PC;
      }
      else{
        logString += pcbVars[i] + "=" + _CurrentProcess[pcbVars[i].toLowerCase()];
      }
      insertDelimiter = true;
    }
    hostLog(logString, "OS");
    // stop the cpu from executing
    _CPU.isExecuting = false;
  };
  
  this._EC = function(){
    
  };
  
  this._D0 = function(){
    
  };
  
  this._EE = function(){
    
  };
  
  this._FF = function(){
    
  };
}
