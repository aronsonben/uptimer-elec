const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path');
const fs = require('fs');
const { updateElectronApp } = require('update-electron-app');

updateElectronApp(); // additional configuration options available

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Fetch existing log data (ben)
  // let data = readLogData();
  // console.log(data);
  // mainWindow.webContents.send('fetchLogs', readLogData());
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);
app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')
  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle('fs:readLogData', readLogData)
  ipcMain.handle('saveData', saveLogData)
  ipcMain.handle('fetchLogs', readLogData)
  createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
console.log("we made it boi");


// === Custom Functions === \\

const USER_DATA_PATH = '/Users/benito/Documents/docs/proj/uptimer/uptimer/user_data.json';

async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (!canceled) {
    return filePaths[0]
  }
}

// Reads log data from the user_data.json file
function readLogData() {
  try {
    const data = fs.readFileSync(USER_DATA_PATH, 'utf-8');
    return data;
  } catch(error) {
    console.log('Error retrieving user data', error);  
    // you may want to propagate the error, up to you
    return null;
  }
}

// Saves new log data to the user_data.json file
async function saveLogData(event, logData) {
  try {
    // read file first to get existing JSON obj
    let existingData = fs.readFileSync(USER_DATA_PATH, 'utf-8');
    let existingJson = JSON.parse(existingData);

    // append new data to existing data
    existingJson.taskLog.push(logData);
    let newJson = JSON.stringify(existingJson);

    const save = fs.writeFileSync(USER_DATA_PATH, newJson)

    return save;
  } catch ( error ) {
    console.log('Error retrieving user data', error);  
    // should change this
    return null;
  }
}

//\\ === [END] Custom Functions === //\\