import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

const currentDir = fileURLToPath(new URL('.', import.meta.url))

let mainWindow

async function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 900,
    minHeight: 620,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.resolve(currentDir, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL)
  } else {
    await mainWindow.loadFile('index.html')
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.handle('save-excel', async (_, payload) => {
  const outputDir = path.join(app.getPath('documents'), 'MeetingCost')
  const filePath = path.join(outputDir, payload.fileName)

  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(filePath, Buffer.from(payload.bytes))

  return {
    filePath
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
