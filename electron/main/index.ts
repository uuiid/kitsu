import { app, shell, BrowserWindow, nativeTheme, ipcMain, session, Menu, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { release } from 'node:os'
import { store, config } from './store'
import { URL } from 'url'
import { spawn, exec } from 'child_process'

const colors = require('colors')
const formatUnicorn = require('format-unicorn/safe')
const iconv = require('iconv-lite')
const windowStateKeeper = require('electron-window-state')

const VITE_PUBLIC = join(join(__dirname, ".."), "../public")
config.set('appVersion', app.getVersion())

// enable darkmode for electron at startup
nativeTheme.themeSource = store.get('main.isDarkTheme') ? 'dark' : 'light'
const isDevelopment = import.meta.env.MODE === 'development'

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

function createWindow(): void {

  const filter = { urls: ['https://192.168.20.69/*'] };
  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    console.log("details", details.responseHeaders);
    if (details.responseHeaders && details.responseHeaders['Set-Cookie']) {
      for (let i = 0; i < details.responseHeaders['Set-Cookie'].length; i++)
        details.responseHeaders['Set-Cookie'][i] += ";SameSite=None;Secure";
    }

    callback({ responseHeaders: details.responseHeaders });
  })

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // set custom User-Agent in requestHeaders
    details.requestHeaders['User-Agent'] = `Kitsu publisher ${app.getVersion()}`
    // set custom Authorization header with access_token
    try {
      const url = new URL(store.get('login.server'))
      if (
        details.url.startsWith(String(url)) &&
        store.get('login.access_token') !== ''
      ) {
        details.requestHeaders['Authorization'] = `Bearer ${store.get(
          'login.access_token'
        )}`
      }
    } catch (error) {
      // do nothing
    }

    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })

  let mainWindowState = windowStateKeeper({
    defaultWidth: 1024,
    defaultHeight: 768
  })

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindowState.manage(mainWindow)


  const old_menu = Menu.getApplicationMenu()
  const new_menu = old_menu?.items.filter((item) => item.role !== 'help')
  Menu.setApplicationMenu(Menu.buildFromTemplate(new_menu))
  mainWindow.setAutoHideMenuBar(true)
  mainWindow.menuBarVisible = false


  switch (process.platform) {
    case 'win32':
      mainWindow.setIcon(
        join(VITE_PUBLIC, 'favicon.ico')
      )
      break
    default:
      break
  }



  //open the pages different from the Kitsu server in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const url_server = new URL(store.get('login.server'))
      if (
        url.startsWith(String(url_server)) &&
        store.get('login.access_token') !== ''
      ) {
        return { action: 'allow' }
      }
    } catch (error) {
      // do nothing
    }
    open(url)
    return { action: 'deny' }
  })




  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (isDevelopment) {
      mainWindow.webContents.openDevTools()
    }
  })


  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../../index.html'))
  }


  var codePage = undefined
  if (process.platform === 'win32') {
    exec('chcp', (err, stdout, stderr) => {
      if (stdout) {
        try {
          codePage = Number(stdout.split(':')[1])
        } catch {
          codePage = undefined
        }
      }
    })
  }


  ipcMain.handle('dark-theme:toggle', () => {
    nativeTheme.themeSource = store.get('main.isDarkTheme') ? 'dark' : 'light'
    return store.get('main.isDarkTheme')
  })


  ipcMain.handle('launch-command:post-exports', (event, command, variables) => {
    if (command === '') {
      console.log('No command to launch before importing to Kitsu Publisher.')
      return false
    } else {
      command = formatUnicorn(command, variables)
      const commandOutput = { output: '', command: command, statusCode: 0 }
      const commandSpawn = spawn(command, [], {
        shell: true,
        // encoding: 'buffer',
        windowsHide: true,
        env: { ...process.env, ...variables },
        timeout: 60000 // TODO : make the timeout configurable
      })
      console.log(
        `Launch command "${command}" before importing to Kitsu Publisher.`
      )

      const manageOutputData = (data, isStdout) => {
        var output
        if (process.platform === 'win32' && codePage !== undefined) {
          // get Windows code page
          output = iconv.decode(data, `cp${codePage}`)
        } else {
          output = iconv.decode(data, 'utf8')
        }
        commandOutput.output += isStdout ? output : colors.red(output)
      }

      commandSpawn.stdout.on('data', (data) => {
        manageOutputData(data, true)
      })

      commandSpawn.stderr.on('data', (data) => {
        manageOutputData(data, false)
      })

      commandSpawn.on('close', (statusCode) => {
        console.log('Output :')
        console.log(commandOutput.output)
        console.log(`Command exited with status code ${statusCode}.`)
        commandOutput.statusCode = statusCode
        mainWindow.webContents.send('commandOutput', commandOutput)
      })

      return true
    }
  })

  ipcMain.handle('open-dialog:show', (event, options) => {
    return dialog.showOpenDialogSync(mainWindow, options)
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
