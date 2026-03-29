const { app, BrowserWindow } = require('electron');

function createWindow() {
  console.log("Creating window...");

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  win.loadURL('http://localhost:3000');

  win.webContents.openDevTools(); // 👈 force DevTools to see errors
}

app.whenReady()
  .then(() => {
    console.log("App ready");
    createWindow();
  })
  .catch(err => console.error(err));

app.on('window-all-closed', () => {
  app.quit();
});