/* ------------
  pcb.js
  
  See page 108
------------ */

function Pcb(){
  this.state = "new"; // new, ready, running, waiting, halted, and so on
  // Properties
  this.pc = 0; // program counter
  this.acc = 0; // accumulator
  this.x = 0; // x register
  this.y = 0; // y register
  this.z = 0; // z register
  this.base = 0; // start address of the block of memory allocated to the process
  this.limit = 0; // the amount of memory allocated to the process
}