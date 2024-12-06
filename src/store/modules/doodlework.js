import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import client from '@/store/api/client.js'
import superagent from 'superagent'
import JSZip from 'jszip'

function initState() {
  return {
    workList: [],
    localHttpPath: '',
    uncommittedWorkList: [],
    isActiveModal: false,
    doodleWorkExeLocalRootPath: '',
    doodleWorkExeDownloadPath: '',
    doodleWorkZipFileVision: '',
    tableHeaderFiled: {
      name: { name: '文件名', type: 'string' },
      status: { name: '状态', type: 'string' },
      source_computer: { name: '运行主机', type: 'string' },
      run_time: { name: '运行时间', type: 'string' },
      submitter: { name: '创建者', type: 'string' },
      submit_time: { name: '创建时间', type: 'string' }
    },
    fbxTaskDataFiled: [
      {
        id: 'create_play_blast',
        name: '是否生成拍屏',
        checked: true
      }
    ],
    abcTaskDataFiled: [
      {
        id: 'replace_ref_file',
        name: '替换引用'
      },
      {
        sim_file: '解算文件',
        export_file: '导出解算的文件',
        create_play_blast: '创建拍屏'
      }
    ]
  }
}

export const doodleWorkStore = defineStore('doodleWorkStore', () => {
  const state = ref(initState())

  const doodleWorkZipFileName = computed(() => {
    return `Doodle-${state.value.doodleWorkZipFileVision}-win64.zip`
  })
  const doodleWorkZipFilePath = computed(() => {
    return `${state.value.doodleWorkExeLocalRootPath}/${doodleWorkZipFileName.value}`
  })

  const doodleWorkExePath = computed(() => {
    return `${state.value.doodleWorkExeLocalRootPath}/Doodle-${state.value.doodleWorkZipFileVision}-win64/bin/doodle_kitsu_supplement.exe`
  })

  const actions = {
    submitLocalDoodleWork: async () => {
      state.value.workList = [
        ...state.value.workList,
        ...state.value.uncommittedWorkList
      ]
      const fs = require('fs')
      const os = require('os')
      state.value.doodleWorkExeLocalRootPath = `${os.homedir()}/.doodle`
      const doodleExePid = window.api.doodleExePid()
      if (doodleExePid) {
        state.value.workList = await client.pget(state.value.localHttpPath)
      } else {
        if (fs.existsSync(doodleWorkExePath.value)) {
          window.api.doodleExeRun(doodleWorkExePath.value, ['--local'])
        } else {
          if (!fs.existsSync(state.value.doodleWorkExeLocalRootPath)) {
            console.log(state.value.doodleWorkExeLocalRootPath)
            fs.mkdirSync(state.value.doodleWorkExeLocalRootPath)
          }
          state.value.doodleWorkZipFileVision = (
            await client.pget('/api/doodle/tool/version')
          ).version
          if (!fs.existsSync(doodleWorkZipFilePath)) {
            await actions.downloadDoodleWorkExe(
              `/${doodleWorkZipFileName.value}`,
              doodleWorkZipFilePath.value
            )
          }

          await actions.zipFile(
            doodleWorkZipFilePath.value,
            state.value.doodleWorkExeLocalRootPath
          )
        }
      }
      state.value.uncommittedWorkList = []
      //await client.ppost(state.value.localHttpPath, workList)
    },
    downloadDoodleWorkExe: async (url, outputPath) => {
      const fs = require('fs')
      try {
        const stream = fs.createWriteStream(outputPath)
        const response = await superagent.get(url).responseType('arraybuffer')
        stream.write(Buffer.from(response.body))
        stream.end()

        stream.on('finish', () => {
          console.log(`File saved to ${outputPath}`)
        })

        stream.on('error', err => {
          console.error('Error writing file:', err)
        })
      } catch (err) {
        console.error('Download failed:', err)
      }
    },
    zipFile: async (filePath, outputPath) => {
      const fs = require('fs')
      const path = require('path')
      const zipData = await fs.readFileSync(filePath)
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
    submitDoodleWork: async workList => {},
    loadLocalDoodleWork: async () => {},
    formatFbxData: file => {
      return {
        id: '',
        name: file.name,
        task_data: {
          create_play_blast: true,
          file: file.path
        },
        status: '等待',
        source_computer: '本机',
        submitter: '本机',
        run_computer_id: '本机'
      }
    }
  }
  return { state, actions }
})
