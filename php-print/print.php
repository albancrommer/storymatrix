<?php
require __DIR__ . '/vendor/autoload.php';
use Mike42\Escpos\PrintConnectors\FilePrintConnector;
use Mike42\Escpos\Printer;
$connector = new FilePrintConnector("/dev/usb/lp0");
$printer = new Printer($connector);

$fileContent = file("/tmp/buffer");
// fwrite(STDERR, "file: ".print_r($fileContent,1)."\n" );
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



$text = wordwrap( $text, 49, "\n");
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

