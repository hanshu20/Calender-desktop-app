const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function createWindow() {

  const win = new BrowserWindow({
    width: 900,
    height: 700
  });

  win.loadFile("index.html");

  Menu.setApplicationMenu(null); // removes top menu
}

app.whenReady().then(createWindow);