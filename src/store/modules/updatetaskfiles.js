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
      type: Boolean,
      task_type_id: '3e20ff2b-13e6-4dce-8bf2-37341b5c1f34'
    })
    this.task_data_filed.set('history_check', {
      id: 'history_check',
      name: '是否检查历史',
      checked: true,
      type: Boolean,
      task_type_id: '3e20ff2b-13e6-4dce-8bf2-37341b5c1f34'
    })
    this.task_data_filed.set('multi_uv_inspection', {
      id: 'multi_uv_inspection',
      name: '是否检查名称长度',
      checked: true,
      type: Boolean,
      task_type_id: '3e20ff2b-13e6-4dce-8bf2-37341b5c1f34'
    })
    this.task_data_filed.set('name_length_check', {
      id: 'name_length_check',
      name: '检查是否有多uv的情况(默认勾选)',
      checked: true,
      type: Boolean,
      task_type_id: '3e20ff2b-13e6-4dce-8bf2-37341b5c1f34'
    })
    this.task_data_filed.set('only_upload', {
      id: 'only_upload',
      name: '仅上传',
      checked: false,
      type: Boolean,
      task_type_id: 'eb7c92c8-232c-4894-8efa-c62ced44ff05'
    })
    this.task_data_filed.set('create_play_blast', {
      id: 'create_play_blast',
      name: '创建拍屏',
      checked: true,
      type: Boolean,
      task_type_id: 'eb7c92c8-232c-4894-8efa-c62ced44ff05'
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
    if (this.isShowFiled) {
      for (const [key, value] of this.task_data_filed) {
        if (value.task_type_id === data.task_type_id) data[key] = value.checked
      }
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
      task_data: file.task_data,
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
    currentUpdateType: 0,
    selection: [],
    downloadFileTaskId: ''
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
        if (entity.entity_type_id !== 'c8b65ac0-e0b7-4da5-b4d2-9b466be0788e') {
          if (entity.asset_type_id !== '8c02b76a-6be6-4959-af58-5c31a85fe072')
            if (
              !entity.bian_hao &&
              entity.asset_type_id !== '6d9d69f0-4269-46fc-9c26-a7f7bf2f30e3'
            )
              message += '编号 '
          if (!entity.pin_yin_ming_cheng) message += '拼音名称 '
          if (!entity.gui_dang) message += '归档 '
          if (!entity.kai_shi_ji_shu) message += '开始集数'
        }
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
      handleCopyCompletion(task) {
        task.status = 'updated'
        task.end_time = new Date().toISOString()
        state.value.loadingNum -= 1
      },
      updateTaskFile: async task => {
        try {
          // const path = require('path')
          // let target_path = ''
          if (task.updateType === 3) {
            await actions.updateDir(task)
            // target_path = await doodlework.getUeFilePath(
            //   state.value.selectedTask.task.id
            // )
          } else if (task.updateType === 2) {
            await actions.updateFile(task.file.path, task, 'image')
            // target_path = await doodlework.getImageFilePath(
            //   state.value.selectedTask.task.id
            // )
          } else if (task.updateType === 0) {
            //await actions.updateFile(task.file.path, task)
            if (
              state.value.selectedTask.task.task_type_id ===
              '13ddf60c-ed8e-4e65-85bb-57dc4207aeca'
            )
              await actions.updateFile(task.file.path, task)
            else await actions.submitLocalDoodleWork(task)
          } else if (task.updateType === 1) {
            await actions.updateFile(task.file.path, task)
          } else if (task.updateType === 4) {
            await actions.submitLocalDoodleWork(task)
          }
          task.status = 'updated'
          task.end_time = new Date().toISOString()
          state.value.loadingNum -= 1
        } catch (e) {
          task.status = 'failed'
          task.last_line_log = e.message
          task.end_time = new Date().toISOString()
          task.progress = 0
        }
        //task.end_time = new Date().toISOString()
      },
      updateDir: async task => {
        const fs = require('fs/promises')
        const path = require('path')
        const root_path = path.dirname(task.file.path)
        const files = []
        const config_dir = path.join(root_path, 'Config')
        const content_dir = path.join(root_path, 'Content')
        // await actions.copyFoldersWithProgress(
        //   [config_dir, content_dir],
        //   '',
        //   (percent, file, relPath, srcDir, totalSize) => {
        //     task.totalSize = totalSize
        //     task.progress = percent
        //   }
        // )
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
          disposition:
            type === 'output'
              ? `${path.basename(file_path).split('.')[1]}/${path.basename(file_path)}`
              : path.basename(file_path),
          data: data
        }
        // if (task.task_id === undefined || task.task_id === '')
        //   task.task_id = state.value.selectedTask.task.id

        if (type === 'maya' || type === 'image' || type === 'output')
          return await doodlework.updateFile(
            task,
            file_data,
            type,
            (loaded, total) => {
              type === (task.progress = loaded / total)
            }
          )
        else {
          file_data.disposition = file_path.replace(
            path.dirname(task.file.path) + `\\`,
            ''
          )
          await doodlework.updateFile(task, file_data, type, () => {})
        }
      },
      copyFileWithProgress(src, dest, callback) {
        const fs = require('fs')
        const path = require('path')
        const totalSize = fs.statSync(src).size
        let copiedSize = 0
        const baseDir = path.dirname(dest)
        if (!fs.existsSync(baseDir)) {
          fs.mkdirSync(baseDir, { recursive: true })
        }
        return new Promise((resolve, reject) => {
          const readStream = fs.createReadStream(src)
          const writeStream = fs.createWriteStream(dest)

          readStream.on('data', chunk => {
            copiedSize += chunk.length
            const percent = ((copiedSize / totalSize) * 100).toFixed(2)
            if (callback) callback(percent)
          })

          readStream.on('error', reject)
          writeStream.on('error', reject)

          writeStream.on('close', () => {
            if (callback) callback(100)
            resolve()
          })

          readStream.pipe(writeStream)
        })
      },
      getAllFiles(dir) {
        const fs = require('fs')
        const path = require('path')
        let results = []
        const list = fs.readdirSync(dir)
        list.forEach(file => {
          const filePath = path.join(dir, file)
          const stat = fs.statSync(filePath)
          if (stat && stat.isDirectory()) {
            results = results.concat(actions.getAllFiles(filePath))
          } else {
            results.push(filePath)
          }
        })
        return results
      },
      async copyFoldersWithProgress(
        srcDirs,
        destDir,
        callback,
        includeRoot = true
      ) {
        const fs = require('fs')
        const path = require('path')
        // 收集所有文件
        let files = []
        for (const srcDir of srcDirs) {
          const dirFiles = actions
            .getAllFiles(srcDir)
            .map(f => ({ srcDir, file: f }))
          files = files.concat(dirFiles)
        }

        // 计算总大小
        let totalSize = 0
        files.forEach(({ file }) => {
          totalSize += fs.statSync(file).size
        })

        let copiedSize = 0

        // 逐个文件复制
        for (const { srcDir, file } of files) {
          const relPath = path.relative(srcDir, file)
          const baseTarget = includeRoot
            ? path.join(destDir, path.basename(srcDir))
            : destDir
          const destPath = path.join(baseTarget, relPath)

          fs.mkdirSync(path.dirname(destPath), { recursive: true })

          await new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(file)
            const writeStream = fs.createWriteStream(destPath)

            readStream.on('data', chunk => {
              copiedSize += chunk.length
              const percent = ((copiedSize / totalSize) * 100).toFixed(2)
              if (callback) callback(percent, file, relPath, srcDir, totalSize)
            })

            readStream.on('error', reject)
            writeStream.on('error', reject)

            writeStream.on('close', resolve)

            readStream.pipe(writeStream)
          })
        }

        if (callback) callback(100, null, null, null, 0) // 完成
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
      getLocalSetting: async () => {
        await doodleWorkStore().actions.getWorkSetting()
        return doodleWorkStore().state.doodleWorkSetting
      },
      submitLightLocalDoodleWork: async task => {
        task['id'] = uuid()
        task['source_computer'] = '本机'
        task['submitter'] = user.state.user.id || ''
        if (state.value.localHttpPath === '')
          state.value.localHttpPath = `http://127.0.0.1:${window.api.DoodleExePort()}`
        const res = await doodlework.submitLightTask(
          productions.state.currentProduction.id,
          task,
          state.value.localHttpPath
        )
        res['updateType'] = 4
        if (task.download) {
          doodleWorkStore().state.doodleWorkExeDownloadProgressMessage =
            '下载中...'
          doodleWorkStore().state.doodleWorkExeDownloadProgress = 0
          doodleWorkStore().state.isShowDoodleWorkExeDownloadProgress = true
          state.value.downloadFileTaskId = res.id
        }
        state.value.allFiles.set(res.id, res)
      },
      submitLocalDoodleWork: async task => {
        //const task_id = task.id
        task.type = 'check_maya'
        const item = Object.assign({}, task)
        const port = window.api.DoodleExePort()
        //const path = require('path')
        if (port) state.value.localHttpPath = `http://127.0.0.1:${port}`
        // await fetch(state.value.localHttpPath + `/api/doodle/local_setting`, {
        //   mode: 'no-cors'
        // })

        if (state.value.selectedTask.task.task_type_id !== '') {
          // if (
          //   state.value.currentUpdateType === 0 &&
          //   item.task_data.target_path !== undefined
          // ) {
          //   try {
          //     const target_path = path.join(
          //       productions.state.currentProduction.path,
          //       item.task_data.target_path + '/temp/' + item.file.name
          //     )
          //     item.task_data.path = target_path
          //     await actions.copyFileWithProgress(item.file.path, target_path)
          //   } catch (e) {
          //     state.value.allFiles.get(item.id).status = 'failed'
          //     state.value.allFiles.get(item.id).last_line_log = '文件拷贝失败'
          //
          //   }
          // }
          console.log(item)
          if (
            state.value.selectedTask.task.task_type_id !==
            '32504e3e-381c-4f36-bdeb-f73328f96f9c'
          )
            doodleWorkCheckFiles.formatDataState(item)
          const data = Object.assign({}, item)
          data.path = item.file.path
          data.file = ''
          //data.task_id = state.value.selectedTask.task.id
          let result = null
          if (
            state.value.selectedTask.task.task_type_id ===
            '3e20ff2b-13e6-4dce-8bf2-37341b5c1f34'
          ) {
            result = await doodlework.submitInspectTask(
              data,
              state.value.localHttpPath
            )
          } else if (
            state.value.selectedTask.task.task_type_id ===
              '32504e3e-381c-4f36-bdeb-f73328f96f9c' ||
            state.value.selectedTask.task.task_type_id ===
              'da050d42-4f45-40c4-9638-cc637753d3b5'
          ) {
            result = await doodlework.submitGenerateUeskTask(
              data,
              state.value.localHttpPath
            )
          } else if (
            state.value.selectedTask.task.task_type_id ===
            'eb7c92c8-232c-4894-8efa-c62ced44ff05'
          ) {
            data['project_id'] = productions.state.currentProduction.id
            result = await doodlework.submitExportAnimation(
              data,
              state.value.localHttpPath
            )
          } else if (
            state.value.selectedTask.task.task_type_id ===
            '9d71918b-cbf0-46bc-9c39-27177c9a950a'
          ) {
            data['project_id'] = productions.state.currentProduction.id
            result = await doodlework.submitSimAbc(
              data,
              state.value.localHttpPath
            )
          }

          const task = Object.assign({}, state.value.allFiles.get(item.id))
          state.value.allFiles.delete(item.id)
          task.id = result.id
          await doodleWork.actions.formatTask(task, result)
          state.value.allFiles.set(task.id, task)
        } else {
          const task = Object.assign({}, state.value.allFiles.get(item.id))
          state.value.allFiles.delete(item.id)
          // task.status = 'updating'
          // state.value.updateTaskQueue.enqueue(task)
          state.value.allFiles.set(task.id, task)
        }
        doodleWorkCheckFiles.uncommittedWorkList.delete(item.id)
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
