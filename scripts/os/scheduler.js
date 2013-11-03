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
      if (_CurrentProcess != null){ // found a valid process in the ready queue, reset cpu and run
        _CurrentProcess.state = "running";
        _CPU.init();
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
}