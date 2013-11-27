/* ----------------------------------
  DeviceDriverFileSystem.js
  
  Requires deviceDriver.js
  
  The File System Device Driver.
---------------------------------- */

DeviceDriverFileSystem.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverFileSystem()                     // Add or override specific attributes and method pointers.
{
  // "subclass"-specific attributes.
  // this.buffer = "";    // TODO: Do we need this?
  // Override the base method pointers.
  this.driverEntry = krnFSDriverEntry;
  this.isr = null;
  // "Constructor" code.
  this.format = fsFormat;
}

function krnFSDriverEntry()
{
  // Initialization routine for this, the kernel-mode Keyboard Device Driver.
  fsFormat();
  diskTableInit();
  this.status = "loaded";
}

function fsFormat(){
  try{
    localStorage.clear();
    for (var t = 0; t < _MaxTracks; t++){
      for (var s = 0; s < _MaxSectors; s++){
        for (var b = 0; b < _MaxBlocks; b++){
          var key = "" + t + s + b;
          if (key == "000"){
            localStorage[key] = generateBlock("001100");
          }
          else{
            localStorage[key] = generateBlock("0---");
          }
        }
      }
    }
    return true;
  }
  catch(e){
    return false;
  }
}

function generateBlock(str){
  while (str.length < 64){
    str += "-";
  }
  return str;
}
