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
  this.write = fsWrite;
  this.del = fsDelete;
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
  if (getSlotWithFilename(filename) !== false){
    var block = getSlotWithFilename(filename);
    var blocks = getLinkedBlocks(getAddressFromBlock(block));
    var file = "";
    for (var i = 0; i < blocks.length; i++){
      file += getDataFromBlock(blocks[i]);
    }
    return file;
  }
  else{
    return false;
  }
}

function fsWrite(filename, data){
  if (getSlotWithFilename(filename) !== false){
    clearFile(filename);
    var lastBlock = "";
    for (var i = 0; i < Math.ceil(data.length / 60); i++){
      var newBlock = getFirstUnusedBlock();
      if (lastBlock != ""){
        setAddressOfBlock(lastBlock, newBlock);
      }
      fillBlock(newBlock, "---", data.substr(i * 60, 60));
      lastBlock = newBlock;
    }
    return true;
  }
  else{
    return false;
  }
}

function fsDelete(filename){
  if (getSlotWithFilename(filename) !== false){
    clearFile(filename);
    clearBlock(getSlotWithFilename(filename));
    return true;
  }
  else{
    return false;
  }
}

function fillBlock(block, nextAddress, contents){
  localStorage[block] = generateBlock("1" + nextAddress + contents);
  updateFirstUnusedSlot();
  updateFirstUnusedBlock();
  diskTableUpdate("000", localStorage["000"]);
  diskTableUpdate(block, localStorage[block]);
}
  
function getFirstUnusedSlot(){
  return localStorage["000"].substr(0, 3);
}

function getFirstUnusedBlock(){
  return localStorage["000"].substr(3, 3);
}

function updateFirstUnusedSlot(){
  for (var s = 0; s < _MaxSectors; s++){
    for (var b = 0; b < _MaxBlocks; b++){
      var key = "0" + s + b;
      if (key != "000" && getBlockStatus(key) == "empty"){
        localStorage["000"] = generateBlock(key + localStorage["000"].substr(3, 3));
        return;
      }
    }
  }
}

function updateFirstUnusedBlock(){
  for (var t = 1; t < _MaxTracks; t++){
    for (var s = 0; s < _MaxSectors; s++){
      for (var b = 0; b < _MaxBlocks; b++){
        var key = "" + t + s + b;
        if (getBlockStatus(key) == "empty"){
          localStorage["000"] = generateBlock(localStorage["000"].substr(0, 3) + key);
          return;
        }
      }
    }
  }
}

function getSlotWithFilename(filename){
  for (var s = 0; s < _MaxSectors; s++){
    for (var b = 0; b < _MaxBlocks; b++){
      var key = "0" + s + b;
      if (key != "000" && localStorage[key].indexOf(filename) !== -1){
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
  var i = localStorage[block].substr(4).indexOf("-");
  if (i !== -1){
    return localStorage[block].substr(4, (localStorage[block].substr(4).indexOf("-")));
  }
  else{
    return localStorage[block].substr(4);
  }
}

function getAddressFromBlock(block){
  return localStorage[block].substr(1, 3);
}

function setAddressOfBlock(block, address){
  localStorage[block] = "1" + address + localStorage[block].substr(4);
  diskTableUpdate(block, localStorage[block]);
}

function clearBlock(block){
  localStorage[block] = generateBlock("0---");
  diskTableUpdate(block, localStorage[block]);
  updateFirstUnusedSlot();
  updateFirstUnusedBlock();
  diskTableUpdate("000", localStorage["000"]);
}

function clearFile(filename){
  var block = getSlotWithFilename(filename);
  var blocks = getLinkedBlocks(getAddressFromBlock(block));
  for (var i = 0; i < blocks.length; i++){
    clearBlock(blocks[i]);
  }
}

function generateBlock(str){
  while (str.length < 64){
    str += "-";
  }
  return str;
}
