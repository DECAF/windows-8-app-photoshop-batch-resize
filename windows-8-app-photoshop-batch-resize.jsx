/**
 * Windows 8 app Photoshop batch resize
 * https://github.com/DECAF/windows-8-app-photoshop-batch-resize/
 * 
 * Photoshop batch script generating all sizes of windows 8 app image assets:
 * http://msdn.microsoft.com/en-us/library/windows/apps/hh846296.aspx
 * 
 *
 * Installation:
 * 1. copy file to /Applications/Adobe Photoshop CS6/Presets/Scripts
 * 2. restart photoshop
 *
 * Usage:
 * 1. Open master file, should be >= 1116 x 540 px (splash screen 180%).
 * 1. Start script with File > Scripts > windows-8-app-photoshop-batch-resize.jsx
 */


// images  [ filename, width, height, required ]
var images = [
    ['store-logo.scale-100',      50,   50, true ],
    ['store-logo.scale-140',      70,   70, false],
    ['store-logo.scale-180',      90,   90, false],
    ['logo.scale-80',            120,  120, false],
    ['logo.scale-100',           150,  150, true ],
    ['logo.scale-140',           210,  210, false],
    ['logo.scale-180',           270,  270, false],
    ['small-logo.scale-80',       24,   24, false],
    ['small-logo.scale-100',      30,   30, true ],
    ['small-logo.scale-140',      42,   42, false],
    ['small-logo.scale-180',      54,   54, false],
    ['splash-screen.scale-100',  620,  300, true ],
    ['splash-screen.scale-140',  868,  420, false],
    ['splash-screen.scale-180', 1116,  540, false],
    ['wide-logo.scale-80',       248,  120, false],
    ['wide-logo.scale-100',      310,  150, false],
    ['wide-logo.scale-140',      434,  210, false],
    ['wide-logo.scale-180',      558,  270, false],
    ['badge-logo.scale-100',      24,   24, false],
    ['badge-logo.scale-140',      33,   33, false],
    ['badge-logo.scale-180',      43,   43, false]
];


// export options
var exportJpg = new ExportOptionsSaveForWeb();
exportJpg.format = SaveDocumentType.JPEG;
exportJpg.quality = 80;
exportJpg.optimized = true;

var exportPng = new ExportOptionsSaveForWeb();
exportPng.format = SaveDocumentType.PNG;
exportPng.PNG8 = false;

var exportOptions = [
    ['jpg', exportJpg],
    ['png', exportPng]
];


// check for open documents
if (app.documents.length) {
    // create a reference to the active document
    var docRef = app.activeDocument;
} else {
    alert ('Use this script on an open document.');
}


// Use folder selection dialogs to set the target location
var targetFolder = Folder.selectDialog('Please choose the target location for the image files.', Folder.myDocuments);
if ( targetFolder !== null ) {

    var counter = 0,
        success = [],
        errors = [];

    for ( var i = 0, maxi = images.length; i < maxi; i+= 1 ) {

        if ( docRef.width >= images[i][1] && docRef.width >= images[i][2] ) {

            for ( var j = 0, maxj = exportOptions.length; j < maxj; j+= 1 ) {

                // duplicate sample image to target file
                var targetFile = docRef.duplicate ( images[i][0] );
                
                // resize target
                if ( docRef.width/docRef.height >= images[i][1]/images[i][2] ) {
                    // resize by height
                    targetFile.resizeImage ( null, images[i][2], 72, ResampleMethod.BICUBIC );
                    // crop left/right
                    targetFile.crop ([Math.floor(targetFile.width-images[i][1])/2, 0, (Math.floor(targetFile.width-images[i][1])/2)+images[i][1], images[i][2]]);
                }
                else {
                    // resize by width
                    targetFile.resizeImage ( images[i][1], null, 72, ResampleMethod.BICUBIC );
                    // crop top/bottom
                    targetFile.crop ([0, Math.floor(targetFile.height-images[i][2])/2, images[i][1], (Math.floor(targetFile.height-images[i][2])/2)+images[i][2]]);
                }
                
                // use unsharp mask
                targetFile.activeLayer.applyUnSharpMask ( 15, 1, 0 );

                // save
                var outputFile = new File (targetFolder.absoluteURI + '/' + targetFile.name + '.' + exportOptions[j][0]);
                targetFile.exportDocument ( outputFile, ExportType.SAVEFORWEB, exportOptions[j][1] );

                // close without saving dialog
                targetFile.close ( SaveOptions.DONOTSAVECHANGES );
            }
            // success
            success.push(images[i][0] + ' (' + images[i][1] + 'x' + images[i][2] + ')');
        }
        else {
            // error
            errors.push(images[i][0] + ' (' + images[i][1] + 'x' + images[i][2] + ')');
        }
        // count up
        counter += 1;
    }

    // show report
    var report = 'I wasn\'t looking for this, and now I\'m done, I\'m done.';

    report += '\r\n\r\nHandled ' + success.length + ' images.';
    if (success.length) {
        report = report.substring(0, report.length-1) + ':\r\n\r\n' + success.join('\r\n');
    }
    report += '\r\n\r\nSkipped ' + errors.length + ' images.';
    if (errors.length) {
        report = report.substring(0, report.length-1) + ':\r\n\r\n' + errors.join('\r\n');
    }
    report += '\r\n\r\nThank you for timing, thank you for finding.\r\n- PCD.';
    alert (report);  
}
