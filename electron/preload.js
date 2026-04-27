const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('meetingCost', {
  saveExcelFile: (data) => ipcRenderer.invoke('save-excel-file', data)
});
