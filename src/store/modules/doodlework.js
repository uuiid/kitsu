import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import doodlework from '@/store/api/doodlework.js'
import user from '@/store/modules/user.js'
import productions from '@/store/modules/productions.js'
import { v4 as uuid } from 'uuid'
import { ElMessage } from 'element-plus'
import { io } from 'socket.io-client'

//import uuid from 'uuid'
export class DoodleWorkBase {
  constructor() {
    this.name = ''
    this.isShowFiled = true
    this.isSubmitting = false
    this.workList = new Map()
    this.uncommittedWorkList = new Map()
    this.task_data_filed = new Map()
    this.historyWorkList = new Map()
    this.isReload = false
    //this.executeField = ['execute', 'execute_clear']
    this.currentExecuteField = 'execute'
    this.productions = productions.state.openProductions
    this.tableHeaderFiled = {
      name: { name: '文件名', type: 'string' },
      status: { name: '状态', type: 'string' },
      source_computer: { name: '运行主机', type: 'string' },
      run_time: { name: '运行时间', type: 'time' },
      submitter: { name: '创建者', type: 'string' },
      last_line_log: { name: '日志', type: 'string' },
      submit_time: {
        name: '创建时间',
        type: 'string'
      },
      end_time: {
        name: '结束时间',
        type: 'string'
      }
    }
  }

  formatResolution(file) {
    if (this.productions) {
      const resolution = this.productions
        .filter(production => production.code === file.name.split('_')[0])[0]
        .resolution?.split('x')
      return {
        width: Number(resolution[0]),
        height: Number(resolution[1])
      }
    }
  }

  formatDataState(data) {}

  validateString(input) {
    const regex = /^[A-Z]+_EP\d+_SC\d+[A-Z]?\.ma$/
    return regex.test(input)
  }

  getFilmAperture(file) {
    const ratio = this.productions.filter(
      production => production.code === file.name.split('_')[0]
    )[0].ratio
    return (Number(ratio.split(':')[0]) / Number(ratio.split(':')[1])).toFixed(
      2
    )
  }

  formatData(file) {
    const resolution = this.formatResolution(file)
    const data = {
      id: uuid(),
      name: file.name,
      status: 'waiting',
      source_computer: '本机',
      submitter: user.state.user?.id || 'CB3b915c-2F16-cE9d-c2cE-b45B5ebb583a',
      run_computer_id: 'CB3b915c-2F16-cE9d-c2cE-b45B5ebb583C',
      task_data: {
        path: file.path,
        camera_film_aperture: Number(this.getFilmAperture(file)),
        image_size: {
          width: resolution.width || 1920,
          height: resolution.height || 1080
        }
      },
      type: this.name
    }
    this.formatDataState(data)
    return data
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
      } else {
        ElMessage({
          message: `${file.path} 请检查文件名称`,
          type: 'error'
        })
      }
    })
    //this.uncommittedWorkList = [...this.uncommittedWorkList, ...data]
  }
}

class DoodleWorkFbx extends DoodleWorkBase {
  constructor(productions) {
    super()
    this.name = 'export_fbx'
    this.productions = productions
    this.task_data_filed.set('create_play_blast', {
      id: 'create_play_blast',
      name: '是否生成拍屏',
      checked: true,
      type: Boolean
    })
  }

  formatDataState(data) {
    data.task_data.create_play_blast =
      this.task_data_filed.get('create_play_blast').checked
  }

  formatData(file) {
    return super.formatData(file)
  }
}

class DoodleWorkReplaceMaya extends DoodleWorkBase {
  constructor(productions) {
    super()
    this.productions = productions
    this.name = 'replace_maya_ref'
    this.task_data_filed = new Map()
    this.replaceFiles = new Map()
  }

  formatDataState(data) {
    data.task_data.file_list = [...this.replaceFiles.values()]
  }
}

class DoodleWorkAbc extends DoodleWorkBase {
  constructor(productions) {
    super()
    this.productions = productions
    this.name = 'export_sim'
    this.task_data_filed.set('replace_ref_file', {
      id: 'replace_ref_file',
      name: '替换引用',
      checked: true,
      type: Boolean
    })
    this.task_data_filed.set('sim_file', {
      id: 'sim_file',
      name: '解算文件',
      checked: true,
      type: Boolean
    })
    this.task_data_filed.set('export_file', {
      id: 'export_file',
      name: '导出解算的文件',
      checked: true,
      type: Boolean
    })
    this.task_data_filed.set('create_play_blast', {
      id: 'create_play_blast',
      name: '创建拍屏',
      checked: true,
      type: Boolean
    })
  }

  formatDataState(data) {
    data.task_data.create_play_blast =
      this.task_data_filed.get('create_play_blast').checked
    data.task_data.replace_ref_file =
      this.task_data_filed.get('replace_ref_file').checked
    data.task_data.sim_file = this.task_data_filed.get('sim_file').checked
    data.task_data.export_file = this.task_data_filed.get('export_file').checked
  }

  formatData(file) {
    const data = super.formatData(file)
    data.task_data.project = this.productions.filter(
      production => production.code === file.name.split('_')[0]
    )[0]
    return data
  }
}

class DoodleWorkAutoLight extends DoodleWorkBase {
  constructor() {
    super()
    this.name = 'auto_light'
    this.task_data_filed.set('is_sim', {
      id: 'is_sim',
      name: '解算文件',
      checked: false,
      type: Boolean
    })
    this.task_data_filed.set('layering', {
      id: 'layering',
      name: '是否分层输出',
      checked: false,
      type: Boolean
    })
    this.task_data_filed.set('bind_skin', {
      id: 'bind_skin',
      name: '挂载骨架网格',
      checked: true,
      type: Boolean
    })
  }

  formatDataState(data) {
    data.task_data.is_sim = this.task_data_filed.get('is_sim').checked
    data.task_data.layering = this.task_data_filed.get('layering').checked
    data.task_data.bind_skin = this.task_data_filed.get('bind_skin').checked
  }

  formatShotName(file_name) {
    const shot_name = file_name.substring(
      0,
      file_name.includes('.') ? file_name.lastIndexOf('.') : file_name.length
    )
    const shot_split = shot_name.split('_')
    let shot_num = shot_split[2]
    shot_num = shot_num.substring(2, shot_num.length)
    let episodes = shot_split[1]
    let shot_enum = ''
    episodes = episodes.substring(2, episodes.length)
    const regex = /[A-Z]$/
    if (regex.test(shot_num)) {
      shot_enum = shot_num.substring(shot_num.length - 1, shot_num.length)
      shot_num = shot_num.substring(0, shot_num.length - 1)
    }
    return {
      shot_name: shot_name,
      shot: Number(shot_num),
      episodes: Number(episodes),
      shot_enum: shot_enum
    }
  }

  formatData(file) {
    const data = super.formatData(file)
    const shotData = this.formatShotName(file.name)
    data.task_data.episodes = shotData.episodes
    data.task_data.shot = {
      shot: shotData.shot,
      shot_enum: shotData.shot_enum
    }
    data.task_data.project = this.productions.filter(
      production => production.code === file.name.split('_')[0]
    )[0]
    return data
  }
}

class DoodleWorkExtractCaption extends DoodleWorkBase {
  constructor() {
    super()
    this.name = 'extract_caption'
    this.isShowFiled = false
    this.tableHeaderFiled = this.tableHeaderFiled = {
      name: { name: '文件名', type: 'string' },
      status: { name: '状态', type: 'string' }
    }
    this.task_data_filed.set(1, {
      id: 1,
      name: '去除所有标点(不包括括号和冒号)',
      checked: false,
      type: Boolean
    })
    this.task_data_filed.set(2, {
      id: 2,
      name: '去除括号内内容',
      checked: false,
      type: Boolean
    })
    this.task_data_filed.set(3, {
      id: 3,
      name: '去除冒号前内容',
      checked: false,
      type: Boolean
    })
    this.task_data_filed.set(4, {
      id: 4,
      name: '切断行',
      checked: false,
      type: Boolean
    })
    this.task_data_filed.set(5, {
      id: 5,
      name: '切断行大小',
      checked: false,
      type: Number,
      number: 28,
      parent_id: 4
    })
  }

  validateString(input) {
    const regex = /\.docx$/i
    const regex1 = /\.srt$/i
    return regex.test(input) || regex1.test(input)
  }

  formatData(file) {
    return {
      id: uuid(),
      name: file.name,
      file: file,
      status: 'waiting'
    }
  }
}

class DoodleWorkMergeVideo extends DoodleWorkAutoLight {
  constructor() {
    super()
    this.name = 'merge_video'
    this.task_data_filed = new Map()
  }

  validateString(input) {
    const regex = /^[A-Z]+_EP\d+_SC\d+[A-Z]?$/
    return regex.test(input)
  }

  formatDataState() {}

  formatData(file) {
    const data = super.formatData(file)
    const path = require('path')
    data.task_data.image_to_move = null
    data.task_data.user_name = user.state.user?.full_name
    data.task_data.out_path = path.join(
      doodleWorkStore().state.outPath,
      file.name + '.mp4'
    )
    return data
  }

  addFilesData(files) {
    const fs = require('fs')
    files.forEach(file => {
      if (
        fs.statSync(file.path).isDirectory() &&
        this.productions.filter(
          production => production.code === file.name.split('_')[0]
        ) &&
        this.validateString(file.name)
      ) {
        const data = this.formatData(file)
        this.uncommittedWorkList.set(data.id, data)
      } else {
        ElMessage({
          message: `${file.path} 请检查文件名称`,
          type: 'error'
        })
      }
    })
    //this.uncommittedWorkList = [...this.uncommittedWorkList, ...data]
  }
}

class DoodleWorkConnectVideo extends DoodleWorkMergeVideo {
  constructor() {
    super()
    this.name = 'connect_video'
  }

  validateString(input) {
    const regex = /^[A-Z]+_EP\d+_SC\d+[A-Z]?\.mp4$/
    return regex.test(input)
  }

  addFilesData(files) {
    const fs = require('fs')
    const path = require('path')
    const file_paths = []
    files.forEach(file => {
      if (
        !fs.statSync(file.path).isDirectory() &&
        this.productions.filter(
          production => production.code === file.name.split('_')[0]
        ) &&
        this.validateString(file.name)
      ) {
        file_paths.push(file.path)
      } else {
        ElMessage({
          message: `${file.path} 请检查文件名称`,
          type: 'error'
        })
      }
    })
    if (file_paths.length > 0) {
      const data = this.formatData(files[0])
      file_paths.sort()
      data.name = `${path.basename(file_paths[0])}-${path.basename(file_paths[file_paths.length - 1])}`
      data.task_data.paths = file_paths
      data.task_data.out_path = path.join(
        doodleWorkStore().state.outPath,
        data.name.replace('.mp4', '')
      )
      this.uncommittedWorkList.set(data.id, data)
    }
  }

  formatData(file) {
    const data = super.formatData(file)
    data.task_data.connect_video = null
    delete data.task_data.image_to_move
    delete data.task_data.path
    delete data.task_data.project
    delete data.task_data.episodes
    delete data.task_data.shot
    return data
  }
}

function initState() {
  return {
    workList: [],
    localHttpPath: '',
    isActiveModal: false,
    isActiveLogModal: false,
    isActiveSettingModal: false,
    isActiveHistoryModal: false,
    isShowDemonstrateVideo: false,
    isShowAutoLightSearch: false,
    isReload: true,
    isVisitor: false,
    isPullProcessed: false,
    isInitialProcessed: false,
    visitorContext: null,
    doodleWorkExeLocalRootPath: '',
    doodleWorkExeDownloadPath: '',
    doodleWorkZipFileVision: '',
    doodleWorkSetting: {},
    currentDoodleWorkType: '',
    currentUser: {},
    viewLogWorkTask: {},
    workTaskLogData: '',
    outPath: '',
    dialogFormVisible: false,
    setOutPathCallback: null,
    versions: [],
    doodleSocket: null,
    port: 0,
    DemonstrateVideoName: '',
    autoLightSearchTasks: [],
    doodleWorkExeDownloadProgressMessage: '',
    doodleWorkExeDownloadProgress: 0,
    isShowDoodleWorkExeDownloadProgress: false
  }
}

export const doodleWorkStore = defineStore('doodleWorkStore', () => {
  const state = ref(initState())
  const currentUser = computed(() => {
    return state.value.isVisitor ? { id: uuid() } : user.state.user
  })
  const allProductions = computed(() => {
    return state.value.isVisitor
      ? state.value.visitorContext.projects
      : productions.state.openProductions
  })
  // watch(state.value.isVisitor,()=>{
  //
  // })
  const doodleWorkBase = new DoodleWorkBase()
  const doodleWorkFbx = new DoodleWorkFbx(allProductions)
  const doodleWorkReplaceMaya = new DoodleWorkReplaceMaya(allProductions)
  const doodleWorkAbc = new DoodleWorkAbc(allProductions)
  const doodleWorkAutoLight = new DoodleWorkAutoLight()
  const doodleWorkExtractCaption = new DoodleWorkExtractCaption()
  const doodleWorkMergeVideo = new DoodleWorkMergeVideo()
  const doodleWorkConnectVideo = new DoodleWorkConnectVideo()
  const doodleWorkStateMap = ref(
    new Map([
      ['export_fbx', doodleWorkFbx],
      ['export_abc', doodleWorkAbc],
      [doodleWorkReplaceMaya.name, doodleWorkReplaceMaya],
      ['auto_light', doodleWorkAutoLight],
      ['extract_caption', doodleWorkExtractCaption],
      ['merge_video', doodleWorkMergeVideo],
      ['connect_video', doodleWorkConnectVideo]
    ])
  )
  const currentDoodleWorkState = computed(() => {
    const result = doodleWorkStateMap.value.get(
      state.value.currentDoodleWorkType
    )
    return result || doodleWorkBase
  })
  // const doodleWorkZipFilePath = computed(() => {
  //   return `${state.value.doodleWorkExeLocalRootPath}/${doodleWorkZipFileName.value}`
  // })
  const doodleWorkFilePath = computed(() => {
    return `${state.value.doodleWorkExeLocalRootPath}/Doodle-${state.value.doodleWorkZipFileVision}-win64`
  })
  const doodleWorkExePath = computed(() => {
    return `${doodleWorkFilePath.value}/bin/doodle_kitsu_supplement.exe`
  })

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // const doodleWorkExeLocalPort = exePid => {
  //   const fs = require('fs')
  //   const os = require('os')
  //   const portPath = `${os.tmpdir()}\\doodle\\cache\\http\\${exePid}.txt`
  //   if (fs.existsSync(portPath)) {
  //     return fs.readFileSync(portPath, 'utf8').trim()
  //   } else {
  //     return null
  //   }
  // }
  const actions = {
    setSocketEvent: async () => {
      state.value.doodleSocket.on('connect', () => {
        console.log('connected')
      })
      state.value.doodleSocket.on('doodle:task_info:update', async data => {
        //await sleep(10)
        //let num=0
        //while (!currentDoodleWorkState.value.workList.has(data.id))

        if (
          data.type !== 'check_maya' &&
          doodleWorkStateMap.value.get(data.type) &&
          doodleWorkStateMap.value.get(data.type).workList.has(data.id)
        ) {
          if (data.status === 'failed') {
            const regex = /what:/i
            if (regex.test(data.last_line_log)) {
              const split_log = data.last_line_log.split('what:')
              data.last_line_log = split_log[split_log.length - 1]
            }
          } else {
            data.last_line_log = ''
          }
          actions.resetTask(
            data,
            doodleWorkStateMap.value.get(data.type).workList.get(data.id)
          )
          console.log(
            doodleWorkStateMap.value.get(data.type).workList.has(data.id)
          )
        }
      })
    },
    deleteHistoryDoodleFile(folderPath, exclude = '') {
      const fs = require('fs')
      const path = require('path')
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          console.error('读取文件夹出错:', err)
          return
        }

        files.forEach(file => {
          const fullPath = path.join(folderPath, file)
          fs.stat(fullPath, (err, stats) => {
            if (err) return console.error(err)
            if (!file.includes(exclude)) {
              if (stats.isDirectory()) {
                console.log('文件夹及内容已删除 ✅', fullPath)
                fs.rm(fullPath, { recursive: true, force: true }, err => {
                  if (err) {
                    console.error('删除失败:', err)
                    return
                  }
                  console.log('文件夹及内容已删除 ✅')
                })
              } else {
                fs.unlink(fullPath, err => {
                  if (err) {
                    console.error('删除文件失败:', err)
                    return
                  }
                  console.log('文件已删除 ✅')
                })
              }
            }
          })
        })
      })
    },
    pullProcess: async () => {
      const fs = require('fs')
      const os = require('os')
      if (state.value.isInitialProcessed) return
      else state.value.isInitialProcessed = true
      state.value.isPullProcessed = false
      if (!state.value.doodleWorkZipFileVision)
        state.value.doodleWorkZipFileVision = state.value.versions[0]
      state.value.doodleWorkExeLocalRootPath = `${os.homedir()}/.doodle`
      if (window.api.DoodleExePort() !== 0) {
        window.api.doodleExeClose()
      }
      const fileName = `Doodle-${state.value.doodleWorkZipFileVision}-win64`
      actions.deleteHistoryDoodleFile(
        state.value.doodleWorkExeLocalRootPath,
        fileName
      )
      if (!fs.existsSync(doodleWorkExePath.value)) {
        if (!fs.existsSync(state.value.doodleWorkExeLocalRootPath)) {
          fs.mkdirSync(state.value.doodleWorkExeLocalRootPath)
        }
        if (!fs.existsSync(doodleWorkExePath.value)) {
          const zipName = `${fileName}.zip`
          state.value.isShowDoodleWorkExeDownloadProgress = true
          state.value.doodleWorkExeDownloadProgressMessage = '下载中...'
          await actions.downloadWithProgress(
            `${zipName}`,
            state.value.doodleWorkExeLocalRootPath,
            ({ percent }) => {
              if (percent) {
                state.value.doodleWorkExeDownloadProgress = percent
              }
            }
          )
          //state.value.doodleWorkExeDownloadProgressMessage = '解压中...'
          // await actions.zipFile(
          //   buffer,
          //   state.value.doodleWorkExeLocalRootPath,
          //   ({ percent }) => {
          //     if (percent) {
          //       state.value.doodleWorkExeDownloadProgress = percent
          //     }
          //   }
          // )
          state.value.isShowDoodleWorkExeDownloadProgress = false
        }
      }
      await window.api.doodleExeRun(doodleWorkExePath.value, ['--local'])
      let num = 0
      const temp = true
      while (temp) {
        if (num > 30) break
        num++
        await sleep(2000)
        if (window.api.DoodleExePort() !== 0) {
          state.value.isPullProcessed = true
          const port = window.api.DoodleExePort()
          state.value.localHttpPath = `http://127.0.0.1:${port}`
          //state.value.doodleSocket = io(`http://127.0.0.1:5000/socket.io/`)
          //state.value.doodleSocket = io(`http://192.168.20.89:50025/socket.io/`)
          await actions.getWorkSetting()
          if (state.value.doodleSocket) {
            state.value.doodleSocket.disconnect()
          }
          state.value.doodleSocket = io(`http://127.0.0.1:${port}/events`)
          await actions.setSocketEvent()
          state.value.isInitialProcessed = false
          break
        }
      }
    },
    setLocalHttpPath: async () => {
      const port = window.api.DoodleExePort()
      state.value.localHttpPath = `http://127.0.0.1:${port}`
      if (port !== 0) {
        state.value.isPullProcessed = true
        await actions.getWorkSetting()
      }
    },
    formatTask: async (task, data) => {
      task.status = data.status
      task.run_time = data.run_time
      task.end_time = data.end_time
      task.submit_time = data.submit_time
      task.last_line_log = data.last_line_log
      task.run_time_info = data.run_time_info
    },
    getToolVersions: async () => {
      state.value.versions = await doodlework.getToolVersion()
      // if (state.value.versions?.length > 0) {
      //   state.value.doodleWorkZipFileVision = state.value.versions[0]
      // }
    },
    getVideoThumbnail: async task => {
      return doodlework.getVideoThumbnail(task, state.value.localHttpPath)
    },
    submitLocalDoodleWork: async () => {
      currentDoodleWorkState.value.isSubmitting = true
      await actions.getLocalHttpPath()
      for (const item of [
        ...currentDoodleWorkState.value.uncommittedWorkList.values()
      ]) {
        currentDoodleWorkState.value.formatDataState(item)

        const result = await doodlework.submitWorkTask(
          item,
          state.value.localHttpPath
        )
        const task = Object.assign(
          {},
          currentDoodleWorkState.value.uncommittedWorkList.get(item.id)
        )
        task.id = result.id
        await actions.formatTask(task, result)
        currentDoodleWorkState.value.workList.set(task.id, task)
      }
      currentDoodleWorkState.value.uncommittedWorkList = new Map()
      currentDoodleWorkState.value.replaceFiles = new Map()
      currentDoodleWorkState.value.isReload = true
      currentDoodleWorkState.value.isSubmitting = false
      // results.forEach(result => {
      //   currentDoodleWorkState.value.workList.set(result.id, result)
      // })
    },
    resubmitLocalDoodleWork: async task => {
      await actions.getLocalHttpPath()
      await doodlework.resubmitWorkTask(task, state.value.localHttpPath)
      task.status = 'submitted'
      currentDoodleWorkState.value.isReload = true
    },
    submitExtractCaptionTask: () => {
      for (const item of [
        ...currentDoodleWorkState.value.uncommittedWorkList.values()
      ]) {
        currentDoodleWorkState.value.workList.set(item.id, item)
      }
      currentDoodleWorkState.value.uncommittedWorkList = new Map()
      currentDoodleWorkState.value.isReload = true
    },
    async downloadWithProgress(url, outPath, onProgress) {
      return new Promise((resolve, reject) => {
        try {
          url = window.location.origin + '/' + url
          window.api.downloadAndUnzip(url, outPath)
          window.api.onProgress(percent => {
            onProgress({ percent })
            if (percent === 100) {
              resolve(outPath)
            }
          })
        } catch (e) {
          reject(e)
        }
      })
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
    listWorkTasks: async () => {
      await actions.getLocalHttpPath()
      const options = `user_id=${currentUser.value.id}&type=${currentDoodleWorkState.value.name}`
      const workTasks = await doodlework.listWorkTask(
        state.value.localHttpPath,
        options
      )
      await workTasks.sort((a, b) => {
        return b.submit_time.localeCompare(a.submit_time)
      })
      for (const workTask of workTasks) {
        if (!currentDoodleWorkState.value.workList.has(workTask.id))
          currentDoodleWorkState.value.historyWorkList.set(
            workTask.id,
            workTask
          )
      }
    },
    loadLocalDoodleWork: async () => {
      await actions.getLocalHttpPath()
      for (const task of [...currentDoodleWorkState.value.workList.values()]) {
        if (['submitted', 'assigned', 'running'].includes(task.status)) {
          const data = await doodlework.getWorkTask(
            task.id,
            state.value.localHttpPath
          )
          await actions.resetTask(data, task)
        }
      }
    },
    resetTask: async (newTask, task) => {
      await actions.formatTask(task, newTask)
    },
    isReloadDoodleWork: () => {
      const temp = [...currentDoodleWorkState.value.workList.values()].filter(
        item => {
          return ['submitted', 'assigned', 'running'].includes(item.status)
        }
      )
      currentDoodleWorkState.value.isReload = temp.length !== 0
    },

    cancelDoodleWorkTask: async task => {
      await actions.getLocalHttpPath()
      const data = {
        status: 'canceled',
        name: task.name,
        type: currentDoodleWorkState.value.name
      }
      return await doodlework.cancelWorkTask(
        task.id,
        data,
        state.value.localHttpPath
      )
    },

    deleteDoodleWorkTask: async workTaskId => {
      await actions.getLocalHttpPath()
      await doodlework.deleteWorkTask(workTaskId, state.value.localHttpPath)
    },
    getWorkTaskLog: async (task_id, type = null) => {
      let res = null
      await actions.getLocalHttpPath()
      if (type === null) {
        res = await doodlework.getWorkLog(task_id, state.value.localHttpPath)
      } else if (type === 'mini') {
        res = await doodlework.getWorkLogMini(
          task_id,
          state.value.localHttpPath
        )
      }
      let logs_str = ''
      if (res?.status === 200) {
        const reader = res?.body.getReader()
        const decoder = new TextDecoder()
        let value = await reader.read()
        logs_str = decoder.decode(new Uint8Array(value.value))
        while (!value.done && state.value.isActiveLogModal) {
          value = await reader.read()
          const fullData = decoder.decode(new Uint8Array(value.value))
          logs_str += fullData
        }
      } else {
        const fs = require('fs')
        const local_log_path = await actions.getLocalLogPath()
        const filePath = `${local_log_path.tmp_dir}\\${task_id}.log`
        logs_str = fs.readFileSync(filePath).toString()
      }
      return new Promise(resolve => {
        resolve(logs_str)
      })
    },
    getLocalHttpPath: () => {
      const port = window.api.DoodleExePort()
      state.value.localHttpPath = `http://127.0.0.1:${port}`
    },
    getWorkSetting: async () => {
      await actions.getToolVersions()
      await actions.getLocalHttpPath()
      const res = await doodlework.getLocalSetting(state.value.localHttpPath)
      if (res) state.value.doodleWorkSetting = res
      else throw new Error(res)
    },

    checkDoodleWork: () => {
      actions.getLocalHttpPath()
      doodlework
        .getLocalSetting(state.value.localHttpPath)
        .then(() => {
          state.value.isPullProcessed = true
        })
        .catch(() => {
          state.value.isPullProcessed = false
        })
    },
    setWorkSetting: async () => {
      await actions.getLocalHttpPath()
      state.value.doodleWorkSetting = await doodlework.setLocalSetting(
        state.value.doodleWorkSetting,
        state.value.localHttpPath
      )
    },
    checkIsVisitor: async () => {
      const res = await doodlework.checkIsVisitor()
      if (res.status === 401) state.value.isVisitor = true
    },
    getVisitorContext: async () => {
      state.value.visitorContext = await doodlework.getVisitorContext()
    },
    copyFolder: async (sourcePath, destPath) => {
      const fs = require('fs')
      const path = require('path')
      fs.mkdirSync(destPath, { recursive: true })
      const files = fs.readdirSync(sourcePath, { withFileTypes: true })
      for (const file of files) {
        const sourceFilePath = path.join(sourcePath, file.name)
        const destFilePath = path.join(destPath, file.name)
        if (file.isDirectory()) {
          await actions.copyFolder(sourceFilePath, destFilePath)
        } else {
          await fs.copyFileSync(sourceFilePath, destFilePath)
        }
      }
    },
    getDoodleFlags: async task_id => {
      return await doodlework.getDoodleFlags(task_id)
    },
    getLocalLogPath: () => {
      return doodlework.getLocalLogPath(state.value.localHttpPath)
    }
  }
  actions.getToolVersions()
  return {
    state,
    actions,
    currentDoodleWorkState,
    doodleWorkFilePath,
    doodleWorkStateMap
  }
})
