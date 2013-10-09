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
  
  // sets pcb's memory values and places it in slots
  this.allocate = function(pcb){
    for (var i = 0; i < this.slots.length; i++){
      if (this.slots[i] == null){
        this.slots[i] = pcb;
        if (i == 0){
          pcb.base = 0;
        }
        else{
          pcb.base = i * _MemoryBlockSize - 1; // since the memory array is 0 based
        }
        pcb.limit = _MemoryBlockSize;
        return true;
      }
    }
    hostLog("Out of memory", "OS"); // only executes if no space was available
    return false;
  };
  
  // writes to memory, adding the relocation register from the pcb to the address
  this.write = function(address, value, pcb){
    if (address < pcb.limit){
      _Memory[address + pcb.base] = value;
      memoryTableUpdate(address + pcb.base, value); // defined in control.js
    }
    else{
      hostLog("Invalid memory access", "OS");
    }
  };
  
  // reads from memory, adding the relocation register from the pcb to the address
  this.read = function(address, pcb){
    if (address < pcb.limit){
      return _Memory[address + pcb.base];
    }
    hostLog("Invalid memory access", "OS");
    return "00";
  };
}