/* ------------
  memory.js
------------ */

function Memory(){
  var a = new Array();
  for (var i = 0; i < _MemoryTotalSize; i++){
    a[i] = "00";
  }
  return a;
}