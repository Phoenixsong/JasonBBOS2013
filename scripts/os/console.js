/* ------------
  Console.js
  
  Requires globals.js
  
  The OS Console - stdIn and stdOut by default.
  Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
------------ */

function CLIconsole() {
  // Properties
  this.CurrentFont      = _DefaultFontFamily;
  this.CurrentFontSize  = _DefaultFontSize;
  this.CurrentXPosition = 0;
  this.CurrentYPosition = _DefaultFontSize;
  this.buffer = "";
  this.commandHistory = [];
  this.recallPosition = 0;
  
  // Methods
  this.init = function() {
    this.clearScreen();
    this.resetXY();
  };
  
  this.clearScreen = function() {
    _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
  };
  
  this.resetXY = function() {
    this.CurrentXPosition = 0;
    this.CurrentYPosition = this.CurrentFontSize;
  };
  
  this.handleInput = function() {
    while (_KernelInputQueue.getSize() > 0)
    {
      // Get the next character from the kernel input queue.
      var chr = _KernelInputQueue.dequeue();
      // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
      if (chr == String.fromCharCode(13))  //     Enter key
      {
        // The enter key marks the end of a console command, so ...
        // ... tell the shell ...
        _OsShell.handleInput(this.buffer);
        // ... save command in history ...
        this.commandHistory[this.commandHistory.length] = this.buffer;
        this.recallPosition = 0;
        // ... and reset our buffer.
        this.buffer = "";
      }
      else if (chr == String.fromCharCode(38)){ // up arrow
        this.recall(1);
      }
      else if (chr == String.fromCharCode(40)){ // down arrow
        this.recall(-1);
      }
      else if (chr == String.fromCharCode(8)){ // backspace
        if (this.buffer.length > 0){
          this.backspace();
          this.buffer = this.buffer.substr(0, this.buffer.length - 1);
        }
      }
      // TODO: Write a case for Ctrl-C.
      else
      {
        // This is a "normal" character, so ...
        // ... draw it on the screen...
        this.putText(chr);
        // ... and add it to our buffer.
        this.buffer += chr;
      }
    }
  };
  
  this.putText = function(text) {
    // My first inclination here was to write two functions: putChar() and putString().
    // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
    // between the two.  So rather than be like PHP and write two (or more) functions that
    // do the same thing, thereby encouraging confusion and decreasing readability, I
    // decided to write one function and use the term "text" to connote string or char.
    if (text !== "")
    {
      // Draw the text at the current X and Y coordinates.
      _DrawingContext.drawText(this.CurrentFont, this.CurrentFontSize, this.CurrentXPosition, this.CurrentYPosition, text);
      // Move the current X position.
      var offset = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, text);
      this.CurrentXPosition = this.CurrentXPosition + offset;
    }
  };
  
  this.advanceLine = function() {
    this.CurrentXPosition = 0;
    if (this.CurrentYPosition <= 472){
      this.CurrentYPosition += _DefaultFontSize + _FontHeightMargin;
    }
    else{
      // Handle scrolling.
      var imageData = _DrawingContext.getImageData(0, _DefaultFontSize + _FontHeightMargin, _Canvas.width, _Canvas.height);
      this.clearScreen();
      _DrawingContext.putImageData(imageData, 0, 0);
    }
  };
  
  this.backspace = function(){
    var offset = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, this.buffer.substr(this.buffer.length - 1));
    _DrawingContext.clearRect(this.CurrentXPosition - offset, this.CurrentYPosition - _DefaultFontSize, this.CurrentXPosition, this.CurrentYPosition + _FontHeightMargin);
    this.CurrentXPosition -= offset;
  };
  
  this.clearLine = function(){
    _DrawingContext.clearRect(_DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, _OsShell.promptStr), this.CurrentYPosition - _DefaultFontSize, this.CurrentXPosition, this.CurrentYPosition + _FontHeightMargin);
    this.CurrentXPosition = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, _OsShell.promptStr);
    this.buffer = "";
  };
  
  this.bsod = function(text){
    _DrawingContext.fillStyle = "#1E90FF";
    _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
    this.resetXY();
    this.putText(text);
  };
  
  this.recall = function(i){
    if (this.commandHistory.length - (this.recallPosition + i) >= 0 && this.commandHistory.length - (this.recallPosition + i) < this.commandHistory.length){
      this.recallPosition += i;
    }
    this.clearLine();
    this.putText(this.commandHistory[this.commandHistory.length - this.recallPosition]);
    this.buffer = this.commandHistory[this.commandHistory.length - this.recallPosition];
  };
}
