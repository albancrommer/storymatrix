<?php

require __DIR__ . '/vendor/autoload.php';
use Mike42\Escpos\PrintConnectors\FilePrintConnector;
use Mike42\Escpos\Printer;
$conf_file = __DIR__."/config.php";
if( !is_file($conf_file)){
  die( "Missing $conf_file. Exiting.");
}
require( $conf_file );
function panic( $msg){ echo "$msg\n"; exit(2); }
if( ! $device ) {
   panic( "Please provide a device.");
}
$devtype = filetype( $device);
if( false === $devtype )  {
    panic("Device $device does not exist.");
}
if( "char" != $devtype )  {
    panic("Device $device has invalid type : $devtype");
}

$connector = new FilePrintConnector($device);
$printer = new Printer($connector);

$fileContent = file("/tmp/buffer");

$options_string = array_shift( $fileContent);
$text = implode("\n",$fileContent );
$options = json_decode( $options_string, true);
if( ! $options ){
    $options = array();
}

$isBold = array_key_exists( 'bold', $options );
$doCut =  array_key_exists( 'cut', $options );
$align = array_key_exists( 'alignRight', $options ) ? Printer::JUSTIFY_RIGHT : Printer::JUSTIFY_LEFT;
$feedAfter = array_key_exists( 'feedAfter', $options ) ? $options['feedAfter'] : 0;
$feedBefore = array_key_exists( 'feedBefore', $options ) ? $options['feedBefore'] : 0;



$text = wordwrap( $text, 48, "\n");
$paragraphList = explode(  "\n", $text );

$printer->setJustification( $align );

if( $isBold ) {
    $printer->setEmphasis(true);
}
foreach( $paragraphList as $p ){
    if( $p == "" ){
        continue;
    }

    $printer -> text($p."\n");
   }
if( $feedAfter ){
    //fwrite(STDERR," $feedAfter lines after\n");
    $printer->feed($feedAfter);
}
if( $doCut ){
    // fwrite(STDERR," cut\n");
    $printer->cut();
}
$printer -> close();

function _convert($content) { 
    if(!mb_check_encoding($content, 'UTF-8') 
        OR !($content === mb_convert_encoding(mb_convert_encoding($content, 'UTF-32', 'UTF-8' ), 'UTF-8', 'UTF-32'))) {

        $content = mb_convert_encoding($content, 'UTF-8'); 

        if (mb_check_encoding($content, 'UTF-8')) { 
            // log('Converted to UTF-8'); 
        } else { 
            // log('Could not converted to UTF-8'); 
        } 
    } 
    return $content; 
} 
