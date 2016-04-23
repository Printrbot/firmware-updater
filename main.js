'use strict';
var app = require('app');
var BrowserWindow = require('browser-window');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 300, height: 310, x: 20, y:20});
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.setMenu(null);
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit();
});

app.on('open-file', function(event, pathToOpen) {
	event.preventDefault();
	console.log(pathToOpen);
});


app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
