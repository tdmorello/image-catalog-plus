/// <reference types="types-for-adobe/Indesign/2018"/>
// 
// ImageCatalogPlus.jsx
// An InDesign Javascript

// This script was heavily inspired and based on the ImageCatalog.jsx
// script that ships with Adobe Indesign. I modified it to fit my needs
// and to be what I think is a little more readable.
// 
// Author: Tim Morello
// github username: tdmorello
// 
// 14 May 2020
// COVID-19 Pandemic Project!
//
// TODO:
// * Add an options dialog for customization
// * Select multiple folders and fill by rows side by side
// * Todos sprinkled throughout the script

// TODO
PAGE_TITLE = "TITLE\n" + "DESCRIPTION";
COLUMN_LABELS = ["Column 1", "Column 2", "Column 3"];

main();

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// MAIN()
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

function main() {
  var imageFiles = getFiles();
  if (imageFiles.length > 0) {
    var sortedImageFiles = sortByFilename(imageFiles);
    makeImageCatalog(sortedImageFiles);
  }
  alert("Done");
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// FILE HANDLING FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

/**
 * Opens a dialog to choose a folder.
 * The return value is an array of files.
 * @return {Array<File>} A list of files.
 */
function getFiles() {
  var imageFolder = chooseFolder();
  var imageFiles = imageFolder.getFiles(filterFile);
  return imageFiles;
}

/**
 * Opens a dialog to choose the folder containing the image files.
 * @return {Folder}
 */
function chooseFolder() {
  var folder = Folder.selectDialog(
    "Select the folder containing the images",
    ""
  );
  return folder;
}

/**
 * Returns true if file looks like an image file.
 * Extensions: .jpg, .jpeg, .tif, .tiff, .psd, .ai, .png
 * @param {File} file
 */
function filterFile(file) {
  var imageExtensions = [
    ".jpg",
    ".jpeg",
    ".tif",
    ".tiff",
    ".psd",
    ".ai",
    ".png",
  ];
  // See if the file contains any of the acceptable extensions
  for (var i = 0; i < imageExtensions.length; i++) {
    if (file.name.indexOf(imageExtensions[i]) > -1) {
      return true;
    }
  }
  return false;
}

/**
 * Sorts input file array by filename.
 * @param {Array<File>} files
 */
function sortByFilename(files) {
  return files.sort();
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// CREATE THE IMAGE CATALOG
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

/**
 * Generates the image catalog.
 * @param {Array<File>} imageFiles
 */
function makeImageCatalog(imageFiles) {
  // Create a new document
  var document = app.documents.add();
  // Make each spread a single page
  document.documentPreferences.facingPages = false;
  var masterSpread = makeMasterSpread();
  var filledDocument = fillDocument(imageFiles);
  return;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// MASTER SPREAD FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

function makeMasterSpread() {
  // TODO: make master spread a single page instead of facing pages
  // Note: you can create a new master spread with
  // document.masterSpreads.add(NUMBER_OF_PAGES_PER_SPREAD)
  var masterSpread = document.masterSpreads.item(0);
  var pageWidth = document.documentPreferences.pageWidth;
  var pageHeight = document.documentPreferences.pageHeight;
  var margin = 3;

  // CONTENT AREA BOUNDS
  // Basically manually calculated right now...
  var headerBoundLimits = [margin, margin, margin + 3, pageWidth - margin];
  var footerBoundLimits = [
    pageHeight - margin - 3,
    margin,
    pageHeight - margin,
    pageWidth - margin,
  ];
  var columnLabelBoundLimits = [6, 3, 9, pageWidth - margin];
  var imageFramesBoundLimits = [
    9,
    3,
    pageHeight - margin - 3,
    pageWidth - margin,
  ];
  // Start putting things together
  placeHeader(masterSpread, headerBoundLimits);
  placeFooter(masterSpread, footerBoundLimits);
  placeColumnLabels(masterSpread, columnLabelBoundLimits);
  placeImageFrames(masterSpread, imageFramesBoundLimits);
  // placeRowLabels(masterSpread);
  return;
}

/**
 * Places a header on the spread at the given coordinates.
 * @param {MasterSpread} spread - the Spread object to add the header to
 * @param {Array<Number>} bounds - [Y1, X1, Y2, X2] limit bounds of the box
 */
function placeHeader(spread, bounds) {
  // Y1 is upper left Y coordinate
  // X1 is upper left X coordinate
  // Y2 is lower right Y coordinate
  // X2 is lower right X coordinate
  // geometricBounds = [Y1, X1, Y2, X2]
  var Y1 = bounds[0];
  var X1 = bounds[1];
  var Y2 = bounds[2];
  var X2 = bounds[3];
  var header = spread.textFrames.add({
    geometricBounds: [Y1, X1, Y2, X2],
    contents: PAGE_TITLE,
    allowOverrides: false,
    textFramePreferences: {
      verticalJustification: VerticalJustification.CENTER_ALIGN,
    },
  });
  return header;
}

/**
 * Places a footer on the spread at the given coordinates.
 * @param {MasterSpread} spread - the Spread object to add the header to
 * @param {Array<Number>} bounds - [Y1, X1, Y2, X2] limit bounds of the box
 */
function placeFooter(spread, bounds) {
  // Y1 is upper left Y coordinate
  // X1 is upper left X coordinate
  // Y2 is lower right Y coordinate
  // X2 is lower right X coordinate
  // geometricBounds = [Y1, X1, Y2, X2]
  var Y1 = bounds[0];
  var X1 = bounds[1];
  var Y2 = bounds[2];
  var X2 = bounds[3];
  var footer = spread.textFrames.add({
    geometricBounds: [Y1, X1, Y2, X2],
    contents: String.fromCharCode(24), // HTML code &#24; for the Page Number special character
    allowOverrides: false,
    textFramePreferences: {
      verticalJustification: VerticalJustification.CENTER_ALIGN,
    },
  });
  footer.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
  return footer;
}

function placeColumnLabels(spread, bounds) {
  var columnLabels = placeBoxGrid(spread, bounds, 1, 3);
  // TODO: More elegant way to fill in columns?
  for (var i = 0; i < columnLabels.length; i++) {
    var columnLabel = columnLabels.reverse()[i];
    columnLabel.contents = COLUMN_LABELS[i];
    columnLabel.allowOverrides = false;
    columnLabel.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    columnLabel.label = "columnLabel";
  }
}

function placeImageFrames(spread, bounds) {
  var frames = placeLabeledFrames(spread, bounds, 3, 3, "Image Frame");
  for (var i = 0; i < frames.length; i++) {
    var frame = frames[i];
    frame.allowOverrides = true;
  }
}

// TODO
function placeRowLabels() {}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
// MAIN CONTENT FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

/**
 * Overrides all overrideable master items in the document
 */
function overrideMasterItems() {
  // For each page
  for (var i = 0; i < document.pages.length; i++) {
    var page = document.pages.item(i);
    // For each master page item on that page
    var masterPageItems = page.masterPageItems;
    for (var j = 0; j < masterPageItems.length; j++) {
      if (masterPageItems[j].allowOverrides == true) {
        masterPageItems[j].override(page);
      }
    }
  }
  return;
}

/**
 * Creates pages and fills image frames and image labels.
 * There are 9 images per page in a 3x3 grid.
 * @param {Array<File>} imageFiles
 */
function fillDocument(imageFiles) {
  // TODO: The following should not be hard coded
  var numberOfImagesPerPage = 9;
  var numberOfImages = imageFiles.length;
  var numberOfPages = Math.ceil(numberOfImages / numberOfImagesPerPage);
  addPages(numberOfPages);
  overrideMasterItems();
  var imageFrames = findItemsByLabel("imageFrame");
  var labelFrames = findItemsByLabel("imageLabel");
  placeImages(imageFrames, imageFiles);
  placeLabels(labelFrames, imageFiles);
  return;
}

/**
 * Returns an array of objects from allPageItems with
 * a label matching <label>
 * @param {String} label
 */
function findItemsByLabel(label) {
  var filteredItems = [];
  var allPageItems = document.allPageItems;
  for (var i = 0; i < allPageItems.length; i++) {
    var item = allPageItems[i];
    if (item.label == label) {
      filteredItems.push(item);
    }
  }
  return filteredItems;
}

/**
 * Adds pages to the document and gives each spread a single page (no facing pages).
 * @param {Number} numberOfPages
 */
function addPages(numberOfPages) {
  document.documentPreferences.pagesPerDocument = numberOfPages;
  document.documentPreferences.facingPages = false;
  return;
}

/**
 * Places images in frames.
 * imageFiles and imageFrames should be arrays of equal length.
 * @param {Array<Rectangle>} imageFrames
 * @param {Array<File>} imageFiles
 */
function placeImages(imageFrames, imageFiles) {
  for (var i = 0; i < imageFiles.length; i++) {
    var imageFile = imageFiles[i];
    var imageFrame = imageFrames[i];
    imageFrame.select();
    imageFrame.place(File(imageFile));
    imageFrame.fit(FitOptions.PROPORTIONALLY);
    imageFrame.label = imageFile.fsName.toString();
  }
  return;
}

/**
 * Places labels in frames.
 * @param {Array<Rectangle>} labelFrames
 * @param {Array<File>} imageFiles
 */
function placeLabels(labelFrames, imageFiles) {
  for (var i = 0; i < imageFiles.length; i++) {
    var imageFile = imageFiles[i];
    var labelFrame = labelFrames[i];
    // TODO: Find a better way of getting base name of image
    var imageName = imageFile.fsName.split("/").reverse()[0].split(".")[0];
    labelFrame.contents = imageName;
    labelFrame.fit(FitOptions.PROPORTIONALLY);
    labelFrame.label = imageFile.fsName.toString();
  }
  return;
}

// TODO
function groupImagesAndLabels(imageFrames, imageLabels) {}

// TODO: Find a way to abstract this function and the above function into one function.
// Maybe by creating a class called ObjectCollection and putting an ObjectCollection Object into the grid...
// TODO: Add images and labels to their own layers?
/**
 * Creates a grid of evenly spaced elements.
 * @param {MasterSpread} spread - the Spread object to add the header to
 * @param {Array<Number>} bounds - [Y1, X1, Y2, X2]
 * @param {Number} numRows - Number of rows in the grid
 * @param {Number} numCols - Number of columns in the grid
 */
function placeBoxGrid(spread, bounds, numRows, numCols) {
  // The for-loop looks weird so that we can get the items ordered like this:
  // ___  ___  ___
  // |0|  |1|  |2|
  // ___  ___  ___
  // |3|  |4|  |5|
  // ___  ___  ___
  // |6|  |7|  |8|
  //
  var rectangleArray = [];
  var spacing = 1;
  var gridWidth = bounds[3] - bounds[1];
  var gridHeight = bounds[2] - bounds[0];
  var boxWidth = (gridWidth - (numCols - 1) * spacing) / numCols;
  var boxHeight = (gridHeight - (numRows - 1) * spacing) / numRows;
  // See note above about this for-loop.
  for (var row = numRows - 1; row >= 0; row--) {
    for (var col = numCols - 1; col >= 0; col--) {
      Y1 = bounds[0] + row * (boxHeight + spacing);
      X1 = bounds[1] + col * (boxWidth + spacing);
      Y2 = Y1 + boxHeight;
      X2 = X1 + boxWidth;
      var newRectangle = spread.textFrames.add({
        geometricBounds: [Y1, X1, Y2, X2],
        textFramePreferences: {
          verticalJustification: VerticalJustification.CENTER_ALIGN,
        },
      });
      rectangleArray.push(newRectangle);
    }
  }
  return rectangleArray;
}

function placeLabeledFrames(spread, bounds, numRows, numCols) {
  var frameArray = [];
  var labelArray = [];
  var spacing = 1;
  var gridHeight = bounds[2] - bounds[0];
  var gridWidth = bounds[3] - bounds[1];
  var cellHeight = (gridHeight - (numRows - 1) * spacing) / numRows;
  var cellWidth = (gridWidth - (numCols - 1) * spacing) / numCols;
  var labelHeight = 2;
  var labelWidth = cellWidth;
  var boxHeight = cellHeight - labelHeight;
  var boxWidth = cellWidth;
  for (var row = numRows - 1; row >= 0; row--) {
    for (var col = numCols - 1; col >= 0; col--) {
      // Place the frame rectangle
      Y1 = bounds[0] + row * (boxHeight + spacing + labelHeight);
      X1 = bounds[1] + col * (boxWidth + spacing);
      Y2 = Y1 + boxHeight;
      X2 = X1 + boxWidth;
      var newFrame = spread.rectangles.add({
        geometricBounds: [Y1, X1, Y2, X2],
        label: "imageFrame",
      });
      frameArray.push(newFrame);
      // Place the label textFrame
      Y3 = Y2;
      X3 = X1;
      Y4 = Y3 + labelHeight;
      X4 = X3 + labelWidth;
      var newLabel = spread.textFrames.add({
        geometricBounds: [Y3, X3, Y4, X4],
        label: "imageLabel",
        textFramePreferences: {
          verticalJustification: VerticalJustification.CENTER_ALIGN,
        },
      });
      labelArray.push(newLabel);
    }
  }
  return frameArray, labelArray;
}
