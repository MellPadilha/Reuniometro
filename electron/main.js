const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL(process.env.APP_URL || 'http://localhost:9000');
};

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('save-excel-file', async (_event, data) => {
    const docsPath = app.getPath('documents');
    const outputDir = path.join(docsPath, 'MeetingCost');
    const fileName = `reunioes_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const targetFile = path.join(outputDir, fileName);

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(targetFile, Buffer.from(data));

    await dialog.showMessageBox({
      message: `Arquivo exportado com sucesso em:\n${targetFile}`,
      buttons: ['OK']
    });

    return targetFile;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
