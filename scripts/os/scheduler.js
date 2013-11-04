/* ------------
  scheduler.js
------------ */

function Scheduler(){
  this.killProcess = function(pid){
    if (pid < _Processes.length){
      _Processes[pid].state = "terminated";
      if (_CurrentProcess.pid == pid){
        this.changeProcess();
      }
    }
    else{
      _StdIn.putText("No process with PID " + pid + " exists.");
    }
  };
  
  // replaces the current process with the next one in the ready queue
  // or stops CPU execution if the ready queue is empty
  this.changeProcess = function(){
    if (_ReadyQueue.getSize() != 0){
      do{
        _CurrentProcess = _ReadyQueue.dequeue();
      } while (_CurrentProcess != null && _CurrentProcess.state == "terminated");
      if (_CurrentProcess != null){ // found a valid process in the ready queue, load cpu with pcb values and run
        _CurrentProcess.state = "running";
        var cpuVars = ["PC", "Acc", "Xreg", "Yreg", "Zflag"];
        var pcbVars = ["pc", "acc", "x", "y", "z"];
        for (var i = 0; i < cpuVars.length; i++){
          _CPU[cpuVars[i]] = _CurrentProcess[pcbVars[i]];
        }
        _CPU.isExecuting = true;
        return true;
      }
      else{ // no valid processes in the ready queue, halt cpu
        _CPU.isExecuting = false;
        return false;
      }
    }
    else{
      _CPU.isExecuting = false;
      return false;
    }
  };
  
  this.cycleCpu = function(){
    if (_CycleCounter < _Quantum){
      _CycleCounter++;
      console.log(_CycleCounter);
      _CPU.cycle();
    }
    else{
      _CycleCounter = 0;
      if (_ReadyQueue.getSize() != 0){
        _KernelInterruptQueue.enqueue( new Interrupt(SOFTWARE_SWITCH_IRQ, 0) );
      }
    }
  };
  
  this.contextSwitch = function(){
    hostLog("Context switching", "OS");
    _CurrentProcess["state"] = "waiting";
    var cpuVars = ["PC", "Acc", "Xreg", "Yreg", "Zflag"];
    var pcbVars = ["pc", "acc", "x", "y", "z"];
    for (var i = 0; i < cpuVars.length; i++){
      _CurrentProcess[pcbVars[i]] = _CPU[cpuVars[i]];
    }
    _ReadyQueue.enqueue(_CurrentProcess);
    this.changeProcess();
  };
}