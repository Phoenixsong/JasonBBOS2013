/* ------------
  memoryManager.js
  
  See page 356
------------ */

function MemoryManager(){
  // keeps tracks of which blocks are allocated
  this.slots = new Array();
  // initialize slots
  this.init = function(){
    for (var i = 0; i < _MemoryTotalSize / _MemoryBlockSize; i++){
      this.slots[i] = null;
    }
  }
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
        return;
      }
    }
    hostLog("Out of memory", "OS"); // only executes if no space was available
  }
  // writes to memory, adding the relocation register from the pcb to the address
  this.write = function(address, value, pcb){
    
  }
}