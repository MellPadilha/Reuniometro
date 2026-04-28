import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('reuniometro', {
  saveExcel: (payload) => ipcRenderer.invoke('save-excel', payload)
})
