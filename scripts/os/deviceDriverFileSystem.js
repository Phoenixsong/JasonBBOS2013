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
  this.create = fsCreate;
  this.read = fsRead;
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

function fsCreate(filename){
  var slot = getFirstUnusedSlot();
  var block = getFirstUnusedBlock();
  if (getSlotWithFilename(filename) !== false){
    _StdIn.putText("A file already exists with that name.  ");
    return false;
  }
  if (slot !== false && block !== false){
    fillBlock(slot, block, filename);
    fillBlock(block, "---", "");
    return true;
  }
  else{
    return false;
  }
}

function fsRead(filename){
  var block = getSlotWithFilename(filename);
  var blocks = getLinkedBlocks(getAddressFromBlock(block));
  var file = "";
  for (var i = 0; i < blocks.length; i++){
    file += getDataFromBlock(blocks[i]);
  }
  return file;
}

function fillBlock(block, nextAddress, contents){
  localStorage[block] = generateBlock("1" + nextAddress + contents);
  diskTableUpdate(block, localStorage[block]);
}
  
function getFirstUnusedSlot(){
  for (var s = 0; s < _MaxSectors; s++){
    for (var b = 0; b < _MaxBlocks; b++){
      var key = "0" + s + b;
      if (key != "000" && getBlockStatus(key) == "empty"){
        return key;
      }
    }
  }
  return false;
}

function getFirstUnusedBlock(){
  for (var t = 1; t < _MaxTracks; t++){
    for (var s = 0; s < _MaxSectors; s++){
      for (var b = 0; b < _MaxBlocks; b++){
        var key = "" + t + s + b;
        if (getBlockStatus(key) == "empty"){
          return key;
        }
      }
    }
  }
}

function getSlotWithFilename(filename){
  var re = new RegExp(filename + "-*?");
  for (var s = 0; s < _MaxSectors; s++){
    for (var b = 0; b < _MaxBlocks; b++){
      var key = "0" + s + b;
      if (key != "000" && re.test(localStorage[key])){
        return key;
      }
    }
  }
  return false;
}

function getLinkedBlocks(block){
  var blocks = [block];
  while (localStorage[block].substr(1, 3) != "---"){
    block = localStorage[block].substr(1, 3);
    blocks.push(block);
  }
  return blocks;
}
      
function getBlockStatus(block){
  switch(localStorage[block].substr(0, 1)){
    case "0":
      return "empty";
    case "1":
      return "filled";
  }
}

function getDataFromBlock(block){
  return localStorage[block].substr(4, (localStorage[block].substr(4).indexOf("-")));
}

function getAddressFromBlock(block){
  return localStorage[block].substr(1, 3);
}

function generateBlock(str){
  while (str.length < 64){
    str += "-";
  }
  return str;
}
