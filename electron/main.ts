import { app, BrowserWindow, ipcMain, screen, Notification } from 'electron'
import path from 'node:path'
import Store from 'electron-store'

const isDev = !!process.env.VITE_DEV_SERVER_URL

const store = new Store({
  schema: {
    lastFed: { type: ['number', 'null'], default: null },
    cats: {
      type: 'array',
      default: [
        { id: '1', name: 'Momo', emoji: '🐈' },
        { id: '2', name: 'Loki', emoji: '🐈' },
      ],
    },
    schedule: {
      type: 'object',
      default: { type: 'fixed', times: ['08:00', '18:00'] },
    },
    events: { type: 'array', default: [] },
    windowX: { type: 'number', default: -1 },
    windowY: { type: 'number', default: -1 },
  },
} as Parameters<typeof Store>[0])

let win: BrowserWindow

function createWindow() {
  const { workAreaSize } = screen.getPrimaryDisplay()

  const savedX = store.get('windowX') as number
  const savedY = store.get('windowY') as number

  const x = savedX > 0 ? savedX : workAreaSize.width - 320 - 16
  const y = savedY > 0 ? savedY : workAreaSize.height - 280 - 16

  win = new BrowserWindow({
    width: 320,
    height: 280,
    x,
    y,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.on('moved', () => {
    const [posX, posY] = win.getPosition()
    store.set('windowX', posX)
    store.set('windowY', posY)
  })

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL!)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('store:get', (_event, key: string) => store.get(key))
ipcMain.handle('store:set', (_event, key: string, value: unknown) => store.set(key, value))
ipcMain.handle('store:delete', (_event, key: string) => store.delete(key))
ipcMain.handle('notify', (_event, title: string, body: string) => {
  new Notification({ title, body }).show()
})
ipcMain.handle('window:minimize', () => win.minimize())

app.whenReady().then(() => {
  createWindow()

  if (!isDev) {
    app.setLoginItemSettings({ openAtLogin: true })
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
