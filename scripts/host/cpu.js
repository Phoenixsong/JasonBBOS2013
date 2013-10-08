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
  };
  
  this.cycle = function() {
    krnTrace("CPU cycle");
    // TODO: Accumulate CPU usage and profiling statistics here.
    // Do the real work here. Be sure to set this.isExecuting appropriately.
    this.execute(this.fetch());
  };
  
  this.fetch = function(){
    return _MemoryManager.read(this.PC, _CurrentProcess);
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
  }
  
  this._A9 = function(){
    
  };
  
  this._AD = function(){
    
  };
  
  this._8D = function(){
    
  };
  
  this._6D = function(){
    
  };
  
  this._A2 = function(){
    
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
