/* ------------
  memoryManager.js
  
  See page 356
------------ */

function MemoryManager(){
  // keeps tracks of which blocks are allocated
  this.slots = new Array();
  
  this.init = function(){
    // initialize slots array
    for (var i = 0; i < _MemoryTotalSize / _MemoryBlockSize; i++){
      this.slots[i] = null;
    }
    memoryTableInit(); // defined in control.js
  };
  
  this.canFitIntoPartition = function(size){
    return size < _MemoryBlockSize;
  };
  
  // sets pcb's memory values and places it in slots
  this.allocate = function(pcb){
    for (var i = 0; i < this.slots.length; i++){
      if (this.slots[i] == null){
        this.slots[i] = pcb;
        if (i == 0){
          pcb.base = 0;
        }
        else{
          pcb.base = i * _MemoryBlockSize;
        }
        pcb.limit = _MemoryBlockSize;
        return true;
      }
    }
    hostLog("Out of memory", "OS"); // only executes if no space was available
    return false;
  };
  
  // writes to memory, adding the relocation register from the pcb to the address
  // assume that addresses passed in as a string are hex and convert them to dec
  this.write = function(address, value, pcb){
    if (typeof address === "string" || address instanceof String){
      address = parseInt(address, 16);
    }
    if (address < pcb.limit){
      _Memory[address + pcb.base] = value;
      memoryTableUpdate(address + pcb.base, value); // defined in control.js
      return true;
    }
    else{
      hostLog("Invalid memory access", "OS");
      return false;
    }
  };
  
  // reads from memory, adding the relocation register from the pcb to the address
  // assume that addresses passed in as a string are hex and convert them to dec
  this.read = function(address, pcb){
    if (pcb.state == "disk"){
      this.rollIn(pcb.pid);
    }
    if (typeof address === "string" || address instanceof String){
      address = parseInt(address, 16);
    }
    if (address < pcb.limit){
      return _Memory[address + pcb.base];
    }
    hostLog("Invalid memory access", "OS");
    return null;
  };
  
  this.clear = function(pcb){
    // reset memory
    for (var i = pcb.base; i < pcb.base + pcb.limit; i++){
      _Memory[i] = "00";
      memoryTableUpdate(i, "00");
    }
    // clear slot
    for (var i = 0; i < this.slots.length; i++){
      if (this.slots[i] !== null && this.slots[i].pid == pcb.pid){
        this.slots[i] = null;
        break;
      }
    }
  };
  
  this.rollOut = function(pid){
    var pcb = _Processes[pid];
    if (pcb == null){
      hostLog("Roll-out failed", "OS");
      return;
    }
    var filename = "process-" + pcb.pid;
    var data = "";
    for (var i = pcb.base; i < pcb.base + pcb.limit; i++){
      data += _Memory[i];
    }
    if (krnFileSystemDriver.create(filename)){
      if (krnFileSystemDriver.write(filename, data)){
        pcb.state = "disk";
        this.clear(pcb);
        pcb.base = -1;
        hostLog("Rolled out PID " + pcb.pid, "OS");
      }
      else{
        hostLog("Roll-out failed", "OS");
      }
    }
    else{
      hostLog("Roll-out failed", "OS");
    }
  };
  
  this.rollIn = function(pid){
    var pcb = _Processes[pid];
    if (pcb == null){
      hostLog("Roll-in failed", "OS");
      return;
    }
    // roll out a random process if no empty slots
    if (this.slots.indexOf(null) == -1){
      var slot = Math.floor(Math.random()*(_MemoryTotalSize/_MemoryBlockSize));
      this.rollOut(this.slots[slot].pid);
    }
    this.allocate(pcb);
    var data = krnFileSystemDriver.read("process-" + pid);
    if (data !== false){
      if (krnFileSystemDriver.del("process-" + pid)){
        for (var i = 0; i < data.length / 2; i++){
          _Memory[pcb.base + i] = data.substr(i*2, 2);
          memoryTableUpdate(pcb.base + i, data.substr(i*2, 2));
        }
        pcb.state = "ready";
        hostLog("Rolled in PID " + pcb.pid, "OS");
      }
      else{
        hostLog("Roll-in failed", "OS");
        this.clear(pcb);
      }
    }
    else{
      hostLog("Roll-in failed", "OS");
      this.clear(pcb);
    }
  };
}