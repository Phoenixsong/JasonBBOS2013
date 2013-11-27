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
}

function krnFSDriverEntry()
{
  // Initialization routine for this, the kernel-mode Keyboard Device Driver.
  this.status = "loaded";
  // More?
}
