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
  }

  validateString(file) {
    return true
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
    localHttpPath: ''
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
          if (task.file.name.endsWith('.uproject')) {
            await actions.updateDir(task)
          } else {
            await actions.updateFile(task.file.path, task)
          }
          task.status = 'updated'
          task.end_time = new Date().toISOString()
          state.value.loadingNum -= 1
        } catch (e) {
          task.status = 'failed'
          task.end_log = e.message
        }
        task.end_time = new Date().toISOString()
      },
      updateDir: async task => {
        const path = require('path')
        const root_path = path.dirname(task.file.path)
        const files = []
        const config_dir = path.join(root_path, 'Config')
        const content_dir = path.join(root_path, 'Content')
        await actions.walkDir(config_dir, files)
        await actions.walkDir(content_dir, files)
        files.push(task.file.path)
        for (const file of files) {
          await actions.updateFile(file, task, 'ue')
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
        return await doodlework.updateFile(task, file_data, type)
      },
      isReloadDoodleWork() {
        const temp = [...state.value.allFiles.values()].filter(item => {
          return ['submitted', 'assigned', 'running', 'updating'].includes(
            item.status
          )
        })
        doodleWorkCheckFiles.isReload = temp.length !== 0
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
      formatTask: async (task, data) => {
        task.status = data.status
        task.run_time = data.run_time
        task.end_time = data.end_time
        task.submit_time = data.submit_time
      },

      submitLocalDoodleWork: async () => {
        const port = window.api.DoodleExePort()
        if (port) state.value.localHttpPath = `http://127.0.0.1:${port}`
        // await fetch(state.value.localHttpPath + `/api/doodle/local_setting`, {
        //   mode: 'no-cors'
        // })
        for (const item of [
          ...doodleWorkCheckFiles.uncommittedWorkList.values()
        ]) {
          //doodleWorkCheckFiles.formatDataState(item)
          const data = Object.assign({}, item)
          data.file = ''

          const result = await doodlework.submitWorkTask(
            data,
            state.value.localHttpPath
          )
          const task = Object.assign({}, state.value.allFiles.get(item.id))
          state.value.allFiles.delete(item.id)
          task.id = result.id
          await actions.formatTask(task, result)
          state.value.allFiles.set(task.id, task)
        }
        doodleWorkCheckFiles.uncommittedWorkList = new Map()
      },
      formatDiffTime: diffTime => {
        const hours = Math.floor(diffTime / (1000 * 60 * 60))
        const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diffTime % (1000 * 60)) / 1000)

        // 格式化为 HH:mm:ss
        return [
          hours.toString().padStart(2, '0'),
          minutes.toString().padStart(2, '0'),
          seconds.toString().padStart(2, '0')
        ].join(':')
      },
      loadLocalDoodleWork: async task => {
        const data = await doodlework.getWorkTask(
          task.id,
          state.value.localHttpPath
        )
        if (data.status === 'running') {
          await actions.formatTask(task, data)
          const currentTime = new Date()
          const date = new Date(data.run_time)
          task.computed_time =
            currentTime > date
              ? actions.formatDiffTime(currentTime - date)
              : '00:00:00'
        }
        if (data.status !== task.status) {
          if (data.status === 'failed') {
            const logs_str = await actions.getWorkTaskLog(task.id)
            const logs = logs_str.match(/^\[.*?] \[.*?] \[error].*$/gm)
            task.end_log = logs ? logs[logs?.length - 1] : ''
            await actions.formatTask(task, data)
          } else if (data.status === 'completed') {
            await actions.formatTask(task, data)
            task.status = 'updating'
            state.value.updateTaskQueue.enqueue(task)
          } else if (data.status === 'running') {
            await actions.formatTask(task, data)
            //   const currentTime = new Date()
            //   const date = new Date(data.run_time)
            //   task.run_time =
            //     currentTime > date
            //       ? actions.formatDiffTime(currentTime - date)
            //       : '00:00:00'
            // }
          } else {
            await actions.formatTask(task, data)
          }
        }
      }
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
