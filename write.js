const escpos = require('escpos');

// Select the adapter based on your printer type
const device  = new escpos.USB('0x0416','0x5011');
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');
//const device  = new escpos.Console(function(a){console.log(a.toString())});

const printer = new escpos.Printer(device);
device.open()
const deviceInterface = device.interfaces[0]

let driverAttached = false
if (printerInterface.isKernelDriverActive()) {
   driverAttached = true
   deviceInterface.detachKernelDriver()
}

deviceInterface.claim()

// ... use the device interface

deviceInterface.release(() => {
   if (driverAttached) {
      deviceInterface.attachKernelDriver()
   }

   device.close()
})

device(function(){
  printer
  .font('a')
  .align('ct')
  .style('bu')
  .size(1, 1)
  .text('The quick brown fox jumps over the lazy dog')
  .text('敏捷的棕色狐狸跳过懒狗')
    .cut()
    .close()
});
