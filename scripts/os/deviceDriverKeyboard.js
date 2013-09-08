/* ----------------------------------
   DeviceDriverKeyboard.js
   
   Requires deviceDriver.js
   
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverKeyboard()                     // Add or override specific attributes and method pointers.
{
    // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    // Override the base method pointers.
    this.driverEntry = krnKbdDriverEntry;
    this.isr = krnKbdDispatchKeyPress;
    // "Constructor" code.
}

function krnKbdDriverEntry()
{
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "loaded";
    // More?
}

function krnKbdDispatchKeyPress(params)
{
    // Parse the params.    TODO: Check that they are valid and osTrapError if not.
    var keyCode = params[0];
    var isShifted = params[1];
    krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
    var chr = "";
    // Check to see if we even want to deal with the key that was pressed.
    if ( ((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
         ((keyCode >= 97) && (keyCode <= 123)) )   // a..z
    {
        // Determine the character we want to display.  
        // Assume it's lowercase...
        chr = String.fromCharCode(keyCode + 32);
        // ... then check the shift key and re-adjust if necessary.
        if (isShifted)
        {
            chr = String.fromCharCode(keyCode);
        }
        // TODO: Check for caps-lock and handle as shifted if so.
        _KernelInputQueue.enqueue(chr);        
    }    
    else if ( ((keyCode >= 48) && (keyCode <= 57)) ||   // digits 
               (keyCode == 32)                     ||   // space
               (keyCode == 13) )                        // enter
    {
		if (isShifted){
			if (keyCode == 49){
				chr = "!";
			}
			else if (keyCode == 50){
				chr = "@";
			}
			else if (keyCode == 51){
				chr = "#";
			}
			else if (keyCode == 52){
				chr = "$";
			}
			else if (keyCode == 53){
				chr = "%";
			}
			else if (keyCode == 54){
				chr = "^";
			}
			else if (keyCode == 55){
				chr = "&";
			}
			else if (keyCode == 56){
				chr = "*";
			}
			else if (keyCode == 57){
				chr = "(";
			}
			else if (keyCode == 48){
				chr = ")";
			}
			else{
				chr = String.fromCharCode(keyCode);
			}
		}
		else{
			chr = String.fromCharCode(keyCode);
		}
        _KernelInputQueue.enqueue(chr); 
    }
	else if ((keyCode >= 186 && keyCode <= 192) || (keyCode >= 219 && keyCode <= 222)){
		if (isShifted){
			if (keyCode == 186){
				chr = ":";
			}
			else if (keyCode == 187){
				chr = "+";
			}
			else if (keyCode == 188){
				chr = "<";
			}
			else if (keyCode == 189){
				chr = "_";
			}
			else if (keyCode == 190){
				chr = ">";
			}
			else if (keyCode == 191){
				chr = "?";
			}
			else if (keyCode == 192){
				chr = "~";
			}
			else if (keyCode == 219){
				chr = "{";
			}
			else if (keyCode == 220){
				chr = "|";
			}
			else if (keyCode == 221){
				chr = "}";
			}
			else if (keyCode == 222){
				chr = '"';
			}
		}
		else{
			if (keyCode == 186){
				chr = ";";
			}
			else if (keyCode == 187){
				chr = "=";
			}
			else if (keyCode == 188){
				chr = ",";
			}
			else if (keyCode == 189){
				chr = "-";
			}
			else if (keyCode == 190){
				chr = ".";
			}
			else if (keyCode == 191){
				chr = "/";
			}
			else if (keyCode == 192){
				chr = "`";
			}
			else if (keyCode == 219){
				chr = "[";
			}
			else if (keyCode == 220){
				chr = "\\";
			}
			else if (keyCode == 221){
				chr = "]";
			}
			else if (keyCode == 222){
				chr = "'";
			}
		}
        _KernelInputQueue.enqueue(chr); 
	}
}
