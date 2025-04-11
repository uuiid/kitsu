import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { DoodleWorkBase, doodleWorkStore } from '@/store/modules/doodlework'
import productions from '@/store/modules/productions.js'
import Queue from 'yocto-queue'
import { v4 as uuid } from 'uuid'
import user from '@/store/modules/user.js'
import doodlework from '@/store/api/doodlework.js'

class DoodleWorkUpdateTaskFiles extends DoodleWorkBase {
  constructor() {
    super()
    this.name = 'check_maya'
    this.productions = productions.state.openProductions
    this.task_data_filed.set('kframe_check', {
      id: 'kframe_check',
      name: '是否检查K帧',
      checked: true,
      type: Boolean
    })
    this.task_data_filed.set('history_check', {
      id: 'history_check',
      name: '是否检查历史',
      checked: true,
      type: Boolean
    })
    this.task_data_filed.set('name_length_check', {
      id: 'name_length_check',
      name: '是否检查名称长度',
      checked: true,
      type: Boolean
    })
    this.tableHeaderFiled['update_progress'] = {
      name: '上传进度',
      type: 'progress'
    }
  }

  validateString(file) {
    return true
  }

  formatDataState(data) {
    for (const [key, value] of this.task_data_filed) {
      data.task_data[key] = value.checked
    }
  }

  formatData(file) {
    return {
      id: uuid(),
      name: file.name,
      file: file,
      status: 'waiting',
      source_computer: '本机',
      submitter: user.state.user?.id || 'CB3b915c-2F16-cE9d-c2cE-b45B5ebb583a',
      run_computer_id: 'CB3b915c-2F16-cE9d-c2cE-b45B5ebb583C',
      task_data: {
        path: file.path,
        category: 'model_maya'
      },
      type: this.name
    }
  }

  addFilesData(files) {
    files.forEach(file => {
      if (
        this.productions.filter(
          production => production.code === file.name.split('_')[0]
        ) &&
        this.validateString(file.name)
      ) {
        const data = this.formatData(file)
        data.updateType = updateTaskFilesStore().state.currentUpdateType
        this.uncommittedWorkList.set(data.id, data)
      }
    })
  }

  formatResolution() {
    return {
      width: 1920,
      height: 1080
    }
  }
}

function initState() {
  return {
    isChecking: false,
    isShowCheckModal: false,
    isShowUpdatePanel: false,
    isShowUpdateModal: false,
    selectedTask: null,
    allFiles: new Map(),
    updateTaskQueue: new Queue(),
    checkedTasks: new Map(),
    loadingNum: 0,
    localHttpPath: '',
    currentUpdateType: 0
  }
}

export const updateTaskFilesStore = defineStore(
  'updateTaskFilesStorage',
  () => {
    const state = ref(initState())

    const doodleWork = doodleWorkStore()
    const doodleWorkCheckFiles = new DoodleWorkUpdateTaskFiles()
    doodleWork.doodleWorkStateMap.set('check_maya', doodleWorkCheckFiles)
    const isShowUpdatePanel = computed(() => {
      return (
        state.value.selectedTask.task.task_type_id ===
        '3e20ff2b-13e6-4dce-8bf2-37341b5c1f34'
      )
    })

    const actions = {
      checkEntity: entity => {
        let message = ''
        if (!entity.data.bian_hao) message += '编号 '
        if (!entity.data.pin_yin_ming_cheng) message += '拼音名称 '
        if (!entity.data.gui_dang) message += '归档 '
        if (!entity.data.kai_shi_ji_shu) message += '开始集数'
        return message
      },
      walkDir: async (dir, files) => {
        const fs = require('fs')
        const path = require('path')
        for (const file of fs.readdirSync(dir)) {
          const file_path = path.join(dir, file)
          if (fs.lstatSync(file_path).isDirectory()) {
            await actions.walkDir(file_path, files)
          } else {
            files.push(file_path)
          }
        }
      },
      updateTaskFile: async task => {
        try {
          if (task.updateType === 3) {
            await actions.updateDir(task)
          } else if (task.updateType === 2) {
            await actions.updateFile(task.file.path, task, 'image')
          } else {
            await actions.updateFile(task.file.path, task)
          }
          task.status = 'updated'
          task.end_time = new Date().toISOString()
          state.value.loadingNum -= 1
        } catch (e) {
          task.status = 'failed'
          task.last_line_log = e.message
        }
        task.end_time = new Date().toISOString()
      },
      updateDir: async task => {
        const fs = require('fs/promises')
        const path = require('path')
        const root_path = path.dirname(task.file.path)
        const files = []
        const config_dir = path.join(root_path, 'Config')
        const content_dir = path.join(root_path, 'Content')
        await actions.walkDir(config_dir, files)
        await actions.walkDir(content_dir, files)
        files.push(task.file.path)
        let totalSize = 0
        for (const file of files) {
          try {
            const stats = await fs.stat(file) // 获取文件信息
            totalSize += stats.size // 累加文件大小
          } catch (err) {
            console.error(`无法获取文件 ${file} 的大小:`, err)
          }
        }
        task.totalSize = totalSize
        let updated_size = 0
        for (const file of files) {
          await actions.updateFile(file, task, 'ue')
          const stats = await fs.stat(file)
          updated_size += stats.size
          task.progress = updated_size / totalSize
        }
      },

      updateFile: async (file_path, task, type = 'maya') => {
        const data = await actions.getFileFromPath(file_path)
        const path = require('path')
        const file_data = {
          filetype: 'application/octet-stream',
          disposition: path.basename(file_path),
          data: data
        }
        task.task_id = state.value.selectedTask.task.id
        if (type === 'maya' || type === 'image')
          return await doodlework.updateFile(
            task,
            file_data,
            type,
            (loaded, total) => {
              task.progress = loaded / total
            }
          )
        else {
          file_data.disposition = file_path.replace(
            path.dirname(task.task_data.path) + `\\`,
            ''
          )
          await doodlework.updateFile(task, file_data, type, () => {})
        }
      },
      isReloadDoodleWork() {
        const temp = [...state.value.allFiles.values()].filter(item => {
          return ['submitted', 'assigned', 'running', 'updating'].includes(
            item.status
          )
        })
        doodleWork.currentDoodleWorkState.isReload = temp.length !== 0
      },
      getFileFromPath(filePath) {
        const fs = require('fs')
        return new Promise((resolve, reject) => {
          fs.readFile(filePath, (err, data) => {
            if (err) {
              console.log(err)
              return reject(err)
            }
            return resolve(data)
          })
        })
      },

      submitLocalDoodleWork: async () => {
        const port = window.api.DoodleExePort()
        if (port) state.value.localHttpPath = `http://127.0.0.1:${port}`
        // await fetch(state.value.localHttpPath + `/api/doodle/local_setting`, {
        //   mode: 'no-cors'
        // })
        for (const item of [
          ...doodleWorkCheckFiles.uncommittedWorkList.values()
        ].filter(task => task.updateType === state.value.currentUpdateType)) {
          doodleWorkCheckFiles.formatDataState(item)
          const data = Object.assign({}, item)
          data.file = ''

          const result = await doodlework.submitWorkTask(
            data,
            state.value.localHttpPath
          )
          const task = Object.assign({}, state.value.allFiles.get(item.id))
          state.value.allFiles.delete(item.id)
          task.id = result.id
          await doodleWork.actions.formatTask(task, result)
          state.value.allFiles.set(task.id, task)
        }
        doodleWorkCheckFiles.uncommittedWorkList = new Map()
      }
      // loadLocalDoodleWork: async task => {
      //   const data = await doodlework.getWorkTask(
      //     task.id,
      //     state.value.localHttpPath
      //   )
      //   if (data.status === 'running') {
      //     await doodleWork.actions.formatTask(task, data)
      //     const currentTime = new Date()
      //     const date = new Date(data.run_time)
      //     task.computed_time =
      //       currentTime > date
      //         ? doodleWork.actions.formatDiffTime(currentTime - date)
      //         : '00:00:00'
      //   }
      //   if (data.status !== task.status) {
      //     if (data.status === 'failed') {
      //       // const logs_str = await doodleWork.actions.getWorkTaskLog(task.id,'mini')
      //       // const logs = logs_str.match(/^\[.*?] \[.*?] \[error].*$/gm)
      //       // task.last_line_log = logs ? logs[logs?.length - 1] : ''
      //       await doodleWork.actions.formatTask(task, data)
      //     } else if (data.status === 'completed') {
      //       await doodleWork.actions.formatTask(task, data)
      //       task.status = 'updating'
      //       state.value.updateTaskQueue.enqueue(task)
      //     } else if (data.status === 'running') {
      //       await doodleWork.actions.formatTask(task, data)
      //       //   const currentTime = new Date()
      //       //   const date = new Date(data.run_time)
      //       //   task.run_time =
      //       //     currentTime > date
      //       //       ? actions.formatDiffTime(currentTime - date)
      //       //       : '00:00:00'
      //       // }
      //     } else {
      //       await doodleWork.actions.formatTask(task, data)
      //     }
      //   }
      // }
    }
    return {
      state,
      actions,
      isShowUpdatePanel,
      doodleWork,
      doodleWorkCheckFiles
    }
  }
)
