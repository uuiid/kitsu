import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import doodlework from '@/store/api/doodlework.js'
import superagent from 'superagent'
import JSZip from 'jszip'
import user from '@/store/modules/user.js'
import productions from '@/store/modules/productions.js'
import { v4 as uuid } from 'uuid'

//import uuid from 'uuid'

class DoodleWorkBase {
  constructor(productions) {
    this.name = ''
    this.workList = new Map()
    this.uncommittedWorkList = new Map()
    this.task_data_filed = new Map()
    this.productions = productions
  }

  formatDataState(data) {}

  validateString(input) {
    const regex = /^[A-Z]+_EP\d{3}_SC\d{3}[A-Z]?\.ma$/
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
    const data = {
      id: uuid(),
      name: file.name,
      status: '等待',
      source_computer: '本机',
      submitter: user.state.user?.id || '',
      run_computer_id: 'CB3b915c-2F16-cE9d-c2cE-b45B5ebb583C',
      task_data: {
        path: file.path,
        camera_film_aperture: Number(this.getFilmAperture(file))
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
      }
    })
    //this.uncommittedWorkList = [...this.uncommittedWorkList, ...data]
  }
}

class DoodleWorkFbx extends DoodleWorkBase {
  constructor(productions) {
    super(productions)
    this.name = 'export_fbx'
    this.task_data_filed.set('create_play_blast', {
      id: 'create_play_blast',
      name: '是否生成拍屏',
      checked: true
    })
  }

  formatDataState(data) {
    data.task_data.create_play_blast =
      this.task_data_filed.get('create_play_blast').checked
  }

  formatData(file) {
    const data = super.formatData(file)
    console.log(this.task_data_filed.get('create_play_blast').checked)
    return data
  }
}

class DoodleWorkAbc extends DoodleWorkBase {
  constructor(productions) {
    super(productions)
    this.name = 'export_sim'
    this.task_data_filed.set('replace_ref_file', {
      id: 'replace_ref_file',
      name: '替换引用',
      checked: true
    })
    this.task_data_filed.set('sim_file', {
      id: 'sim_file',
      name: '解算文件',
      checked: true
    })
    this.task_data_filed.set('export_file', {
      id: 'export_file',
      name: '导出解算的文件',
      checked: true
    })
    this.task_data_filed.set('create_play_blast', {
      id: 'create_play_blast',
      name: '创建拍屏',
      checked: true
    })
  }

  formatDataState(data) {
    data.task_data.reate_play_blast =
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
  constructor(productions) {
    super(productions)
    this.name = 'auto_light'
    this.task_data_filed.set('is_sim', {
      id: 'is_sim',
      name: '解算文件',
      checked: false
    })
    this.task_data_filed.set('layering', {
      id: 'layering',
      name: '是否分层输出',
      checked: false
    })
  }

  formatDataState(data) {
    data.task_data.is_sim = this.task_data_filed.get('is_sim').checked
    data.task_data.layering = this.task_data_filed.get('layering').checked
  }

  formatResolution(file) {
    const resolution = this.productions
      .filter(production => production.code === file.name.split('_')[0])[0]
      .resolution?.split(':')
    return {
      width: Number(resolution[0]),
      height: Number(resolution[1])
    }
  }

  formatShotName(file) {
    const shot_name = file.name.substring(0, file.name.lastIndexOf('.'))
    const shot_split = shot_name.split('_')
    let shot_num = shot_split[2]
    shot_num = shot_num.substring(2, shot_num.length)
    let episodes = shot_split[1]
    let shot_enum = ''
    episodes = episodes.substring(2, episodes.length)
    if (shot_num.length > 3) {
      shot_enum = shot_num.substring(3, shot_name.length)
      shot_num = shot_num.substring(0, 3)
    }
    return {
      shot_name: shot_name,
      shot: Number(shot_num),
      episodes: Number(episodes),
      shot_enum: shot_enum
    }
  }

  formatData(file) {
    console.log(this.productions)
    const data = super.formatData(file)
    const shotData = this.formatShotName(file)
    const resolution = this.formatResolution(file)
    data.task_data.episodes = shotData.episodes
    data.task_data.shot = {
      shot: shotData.shot,
      shot_enum: shotData.shot_enum
    }
    data.task_data.image_size = {
      width: resolution.width || 1920,
      height: resolution.height || 1080
    }
    data.task_data.project = this.productions.filter(
      production => production.code === file.name.split('_')[0]
    )[0]
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
    isReload: true,
    isVisitor: false,
    doodleWorkExeLocalRootPath: '',
    doodleWorkExeDownloadPath: '',
    doodleWorkZipFileVision: '',
    doodleWorkSetting: {},
    currentDoodleWorkType: '',
    currentUser: {},
    viewLogWorkTask: {},
    workTaskLogData: '',
    tableHeaderFiled: {
      name: { name: '文件名', type: 'string' },
      status: { name: '状态', type: 'string' },
      source_computer: { name: '运行主机', type: 'string' },
      run_time: { name: '运行时间', type: 'string' },
      submitter: { name: '创建者', type: 'string' },
      submit_time: { name: '创建时间', type: 'string' },
      end_time: { name: '结束时间', type: 'string' }
    }
  }
}

export const doodleWorkStore = defineStore('doodleWorkStore', () => {
  const state = ref(initState())
  const currentUser = computed(() => {
    return state.value.isVisitor ? { id: uuid() } : user.state.user
  })
  const allProductions = computed(() => {
    console.log(productions.state.openProductions)
    return state.value.isVisitor ? [] : productions.state.openProductions
  })
  const doodleWorkBase = new DoodleWorkBase(allProductions)
  const doodleWorkFbx = new DoodleWorkFbx(allProductions)
  const doodleWorkAbc = new DoodleWorkAbc(allProductions)
  const doodleWorkAutoLight = new DoodleWorkAutoLight(allProductions)

  const doodleWorkStateMap = ref(
    new Map([
      ['导出FBX', doodleWorkFbx],
      ['导出ABC', doodleWorkAbc],
      ['自动灯光', doodleWorkAutoLight]
    ])
  )

  const currentDoodleWorkState = computed(() => {
    const result = doodleWorkStateMap.value.get(
      state.value.currentDoodleWorkType
    )
    return result ? result : doodleWorkBase
  })
  const doodleWorkZipFileName = computed(() => {
    return `Doodle-${state.value.doodleWorkZipFileVision}-win64.zip`
  })
  // const doodleWorkZipFilePath = computed(() => {
  //   return `${state.value.doodleWorkExeLocalRootPath}/${doodleWorkZipFileName.value}`
  // })
  const doodleWorkFilePath = computed(() => {
    return `${state.value.doodleWorkExeLocalRootPath}/Doodle-${state.value.doodleWorkZipFileVision}-win64`
  })
  const doodleWorkExePath = computed(() => {
    return `${state.value.doodleWorkExeLocalRootPath}/Doodle-${state.value.doodleWorkZipFileVision}-win64/bin/doodle_kitsu_supplement.exe`
  })

  // function sleep(ms) {
  //   return new Promise(resolve => setTimeout(resolve, ms))
  // }

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
    pullProcess: async () => {
      const fs = require('fs')
      const os = require('os')
      state.value.doodleWorkExeLocalRootPath = `${os.homedir()}/.doodle`
      console.log(window.api.DoodleExePort())
      if (window.api.DoodleExePort() === 0) {
        if (!fs.existsSync(doodleWorkExePath.value)) {
          if (!fs.existsSync(state.value.doodleWorkExeLocalRootPath)) {
            console.log(state.value.doodleWorkExeLocalRootPath)
            fs.mkdirSync(state.value.doodleWorkExeLocalRootPath)
          }
          state.value.doodleWorkZipFileVision = (
            await doodlework.getToolVersion()
          ).version
          if (!fs.existsSync(doodleWorkFilePath.value)) {
            await actions.downloadDoodleWorkExe(
              `/${doodleWorkZipFileName.value}`
            )
          }
          await window.api.doodleExeRun(doodleWorkExePath.value, ['--local'])
        }
      }
      const port = window.api.DoodleExePort()
      if (port) state.value.localHttpPath = `http://127.0.0.1:${port}`
    },
    setLocalHttpPath: async () => {
      const port = window.api.DoodleExePort()
      if (port) state.value.localHttpPath = `http://127.0.0.1:${port}`
    },

    submitLocalDoodleWork: async () => {
      const port = window.api.DoodleExePort()
      console.log(port)
      if (port) state.value.localHttpPath = `http://127.0.0.1:${port}`
      // await fetch(state.value.localHttpPath + `/api/doodle/local_setting`, {
      //   mode: 'no-cors'
      // })
      const results = []
      for (const item of [
        ...currentDoodleWorkState.value.uncommittedWorkList.values()
      ]) {
        currentDoodleWorkState.value.formatDataState(item)
        results.push(
          await doodlework.submitWorkTask(item, state.value.localHttpPath)
        )
      }
      currentDoodleWorkState.value.uncommittedWorkList = new Map()
      results.forEach(result => {
        currentDoodleWorkState.value.workList.set(result.id, result)
      })
    },

    downloadDoodleWorkExe: async url => {
      try {
        const response = await superagent.get(url).responseType('arraybuffer')
        const buffer = await Buffer.from(response.body)
        console.log(response.body)
        if (!response.body) {
          throw new Error('No data received from the URL.')
        }
        // const fs = require('fs')
        // const stream = fs.createWriteStream(doodleWorkZipFilePath.value)
        // const response = await superagent.get(url).responseType('arraybuffer')
        // stream.write(Buffer.from(response.body))
        // stream.end()
        //
        // stream.on('finish', () => {
        //   console.log(`File saved to ${doodleWorkZipFilePath.value}`)
        // })
        //
        // stream.on('error', err => {
        //   console.error('Error writing file:', err)
        // })

        await actions.zipFile(buffer, state.value.doodleWorkExeLocalRootPath)
      } catch (err) {
        console.error('Download failed:', err)
      }
    },

    zipFile: async (zipData, outputPath) => {
      const fs = require('fs')
      const path = require('path')
      const zip = await JSZip.loadAsync(zipData)
      for (const [filename, file] of Object.entries(zip.files)) {
        const filePath = path.join(outputPath, filename)

        if (file.dir) {
          // 创建文件夹
          fs.mkdirSync(filePath, { recursive: true })
        } else {
          // 解压文件并保存
          const content = await file.async('nodebuffer') // 读取为 Buffer
          fs.mkdirSync(path.dirname(filePath), { recursive: true }) // 确保目录存在
          fs.writeFileSync(filePath, content)
        }
      }
    },

    loadLocalDoodleWork: async () => {
      const options = `user_id=${currentUser.value.id}&type=${currentDoodleWorkState.value.name}`
      const data = await doodlework.listWorkTask(
        state.value.localHttpPath,
        options
      )
      data.forEach(item => {
        currentDoodleWorkState.value.workList.set(item.id, item)
      })
    },

    cancelDoodleWorkTask: async task => {
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
      await doodlework.deleteWorkTask(workTaskId, state.value.localHttpPath)
      currentDoodleWorkState.value.workList.delete(workTaskId)
    },

    getWorkTaskLog: async task_id => {
      const res = await doodlework.getWorkLog(
        task_id,
        state.value.localHttpPath
      )
      console.log(res)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let value = await reader.read()
      state.value.workTaskLogData = decoder.decode(new Uint8Array(value.value))
      while (!value.done && state.value.isActiveLogModal) {
        value = await reader.read()
        const fullData = decoder.decode(new Uint8Array(value.value))
        state.value.workTaskLogData += fullData
      }
    },

    getWorkSetting: async () => {
      console.log(state.value.localHttpPath)
      state.value.doodleWorkSetting = await doodlework.getLocalSetting(
        state.value.localHttpPath
      )
    },

    setWorkSetting: async () => {
      state.value.doodleWorkSetting = await doodlework.setLocalSetting(
        state.value.doodleWorkSetting,
        state.value.localHttpPath
      )
    }
  }
  return { state, actions, currentDoodleWorkState }
})
