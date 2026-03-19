const { app, BrowserWindow, Menu, ipcMain, Notification } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0b1024',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true
    }
  });

  win.webContents.on('did-fail-load', (_event, errorCode, errorDesc, validatedURL, isMainFrame) => {
    if (isMainFrame) {
      console.error('did-fail-load', { errorCode, errorDesc, validatedURL });
    }
  });

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('render-process-gone', details);
  });

  if (isDev) {
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, 'dist/renderer/index.html'));
  }

  if (app.commandLine.hasSwitch('devtools')) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  Menu.setApplicationMenu(null);
}

app.setAppUserModelId('com.calendar.desktop');

ipcMain.handle('notify', (_event, payload) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: payload.title,
      body: payload.body
    });
    notification.show();
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
