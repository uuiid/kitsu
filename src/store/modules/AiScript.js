import { defineStore } from 'pinia'
import { ref } from 'vue'
import AiScript from '@/store/api/AiScript.js'
import { doodleWorkStore } from '@/store/modules/doodlework.js'

function sign(params) {
  const {
    headers = {},
    query = {},
    region = '',
    serviceName = '',
    method = '',
    pathName = '/',
    accessKeyId = '',
    secretAccessKey = '',
    needSignHeaderKeys = [],
    bodySha
  } = params
  const datetime = headers['X-Date']
  const date = datetime.substring(0, 8) // YYYYMMDD
  // 创建正规化请求
  const [signedHeaders, canonicalHeaders] = getSignHeaders(
    headers,
    needSignHeaderKeys
  )
  const canonicalRequest = [
    method.toUpperCase(),
    pathName,
    queryParamsToString(query) || '',
    `${canonicalHeaders}\n`,
    signedHeaders,
    bodySha || hash('')
  ].join('\n')
  const credentialScope = [date, region, serviceName, 'request'].join('/')
  // 创建签名字符串
  const stringToSign = [
    'HMAC-SHA256',
    datetime,
    credentialScope,
    hash(canonicalRequest)
  ].join('\n')
  // 计算签名
  const kDate = hmac(secretAccessKey, date)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, serviceName)
  const kSigning = hmac(kService, 'request')
  const signature = hmac(kSigning, stringToSign).toString('hex')

  return [
    'HMAC-SHA256',
    `Credential=${accessKeyId}/${credentialScope},`,
    `SignedHeaders=${signedHeaders},`,
    `Signature=${signature}`
  ].join(' ')
}

function hmac(secret, s) {
  const crypto = require('crypto')
  return crypto.createHmac('sha256', secret).update(s, 'utf8').digest()
}

function hash(s) {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex')
}

function queryParamsToString(params) {
  return Object.keys(params)
    .sort()
    .map(key => {
      const val = params[key]
      if (typeof val === 'undefined' || val === null) {
        return undefined
      }
      const escapedKey = uriEscape(key)
      if (!escapedKey) {
        return undefined
      }
      if (Array.isArray(val)) {
        return `${escapedKey}=${val.map(uriEscape).sort().join(`&${escapedKey}=`)}`
      }
      return `${escapedKey}=${uriEscape(val)}`
    })
    .filter(v => v)
    .join('&')
}

function getSignHeaders(originHeaders, needSignHeaders) {
  function trimHeaderValue(header) {
    return header.toString?.().trim().replace(/\s+/g, ' ') ?? ''
  }

  const HEADER_KEYS_TO_IGNORE = new Set([
    'authorization',
    'content-type',
    'content-length',
    'user-agent',
    'presigned-expires',
    'expect'
  ])
  let h = Object.keys(originHeaders)
  // 根据 needSignHeaders 过滤
  if (Array.isArray(needSignHeaders)) {
    const needSignSet = new Set(
      [...needSignHeaders, 'x-date', 'host'].map(k => k.toLowerCase())
    )
    h = h.filter(k => needSignSet.has(k.toLowerCase()))
  }
  // 根据 ignore headers 过滤
  h = h.filter(k => !HEADER_KEYS_TO_IGNORE.has(k.toLowerCase()))
  const signedHeaderKeys = h
    .slice()
    .map(k => k.toLowerCase())
    .sort()
    .join(';')
  const canonicalHeaders = h
    .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    .map(k => `${k.toLowerCase()}:${trimHeaderValue(originHeaders[k])}`)
    .join('\n')
  return [signedHeaderKeys, canonicalHeaders]
}

function uriEscape(str) {
  try {
    return encodeURIComponent(str)
      .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
      .replace(/[*]/g, ch => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`)
  } catch (e) {
    return ''
  }
}

function getDateTimeNow() {
  const now = new Date()
  return now.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

// 获取 body sha256
function getBodySha(body) {
  const url = require('url')
  const util = require('util')
  const crypto = require('crypto')
  const hash = crypto.createHash('sha256')
  if (typeof body === 'string') {
    hash.update(body)
  } else if (body instanceof url.URLSearchParams) {
    hash.update(body.toString())
  } else if (util.isBuffer(body)) {
    hash.update(body)
  }
  return hash.digest('hex')
}

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

const initState = {
  currentDialogue: '',
  allDialogue: new Map(),
  jiMengAccessKeyId: '',
  receiveImageList: [],
  receiveVideoList: [],
  receiveImage2VideoList: [],
  receiveTxt2ImageTimer: null,
  receiveImage2ImageTimer: null,
  txt2ImageIsLoading: false,
  image2VideoIsLoading: false,
  txt2VideoIsLoading: false,
  aiHistory: {
    txt2Image: [],
    txt2Video: [],
    image2Video: []
  }
}
export const AiScriptStore = defineStore('AiScriptStore', () => {
  const state = ref(initState)
  const action = {
    chat: (request, callback) => {
      const res = AiScript.chat(
        request,
        callback,
        `http://192.168.40.180:11434`
      )
      console.log(res)
      return res
    },
    getJiMengToken: () => {
      return AiScript.getJiMengToken()
    },
    txt2image: async data => {
      data.req_key = 'jimeng_high_aes_general_v21_L'
      data.return_url = true
      const keys = await AiScript.getJiMengKey()
      const { authorization, signParams } = action.createAuthorization(
        'CVProcess',
        keys,
        true,
        data
      )
      // await sleep(10000)
      const res = await AiScript.txt2image(data, signParams, authorization)
      if (res.data.image_urls.length > 0) {
        const path = require('path')
        const filePath = path.join(
          action.aiGenerateFileRootPath(),
          'txt2Video',
          data.task_id + '.png'
        )
        await action.saveObjectFromUrl(res.data.image_urls[0], filePath)
        const nativeData = data
        nativeData['task_id'] = data.task_id
        state.value.aiHistory.txt2Image.push(nativeData)
        await action.writeAiHistory()
        state.value.receiveImageList.push(...res.data.image_urls)
        state.value.txt2ImageIsLoading = false
        return res
      }
    },
    txt2video: async data => {
      data.req_key = 'jimeng_vgfm_t2v_l20'
      const keys = await AiScript.getJiMengKey()
      const { authorization, signParams } = action.createAuthorization(
        'CVSync2AsyncSubmitTask',
        keys,
        true,
        data
      )
      const res = await AiScript.txt2video(data, signParams, authorization)
      if (res.message === 'Success') {
        const startDate = Date.now()
        state.value.receiveTxt2ImageTimer = setInterval(() => {
          action.getTxt2video(
            {
              req_key: data.req_key,
              task_id: res.data.task_id
            },
            startDate,
            data
          )
        }, 2000)
      }
      return res
    },
    getTxt2video: async (data, startDate, nativeData) => {
      if (Date.now() - startDate > 1200000) {
        clearInterval(state.value.receiveTxt2ImageTimer)
      }
      const keys = await AiScript.getJiMengKey()
      const { authorization, signParams } = action.createAuthorization(
        'CVSync2AsyncGetResult',
        keys,
        true,
        data
      )
      const res = await AiScript.getTxt2video(data, signParams, authorization)
      if (res.message === 'Success' && res.data.video_url !== '') {
        clearTimeout(state.value.receiveTxt2ImageTimer)
        const path = require('path')
        const filePath = path.join(
          action.aiGenerateFileRootPath(),
          'txt2Video',
          data.task_id + '.mp4'
        )
        await action.saveVideo(res.data.video_url, filePath)
        nativeData['task_id'] = data.task_id
        state.value.aiHistory.txt2Video.push(nativeData)
        await action.writeAiHistory()
        state.value.txt2VideoIsLoading = false
        state.value.receiveVideoList.push(res.data.video_url)
      }
      return res
    },
    image2video: async data => {
      data.req_key = 'jimeng_vgfm_i2v_l20'
      const keys = await AiScript.getJiMengKey()
      const { authorization, signParams } = action.createAuthorization(
        'CVSync2AsyncSubmitTask',
        keys,
        true,
        data
      )
      const res = await AiScript.image2video(data, signParams, authorization)
      if (res.message === 'Success') {
        const startDate = Date.now()
        state.value.receiveImage2ImageTimer = setInterval(() => {
          action.getImage2Video(
            {
              req_key: data.req_key,
              task_id: res.data.task_id
            },
            startDate,
            data
          )
        }, 2000)
      }
      return res
    },
    getImage2Video: async (data, startDate, nativeData) => {
      if (Date.now() - startDate > 1200000) {
        clearInterval(state.value.receiveImage2ImageTimer)
      }
      const keys = await AiScript.getJiMengKey()
      const { authorization, signParams } = action.createAuthorization(
        'CVSync2AsyncGetResult',
        keys,
        true,
        data
      )
      const res = await AiScript.getTxt2video(data, signParams, authorization)
      if (res.message === 'Success' && res.data.video_url !== '') {
        clearTimeout(state.value.receiveImage2ImageTimer)
        const path = require('path')
        const filePath = path.join(
          action.aiGenerateFileRootPath(),
          'txt2Video',
          data.task_id + '.mp4'
        )
        await action.saveVideo(res.data.video_url, filePath)
        nativeData['task_id'] = data.task_id
        delete nativeData['binary_data_base64']
        state.value.aiHistory.image2Video.push(nativeData)
        await action.writeAiHistory()
        state.value.image2VideoIsLoading = false
        state.value.receiveImage2VideoList.push(res.data.video_url)
      }
      return res
    },
    createAuthorization(action, keys, post = true, data = {}) {
      const signParams = {
        headers: {
          ['X-Date']: getDateTimeNow(),
          ['Content-Type']: 'application/json',
          ['Host']: 'visual.volcengineapi.com',
          'X-Content-Sha256': getBodySha(JSON.stringify(data))
        },
        method: 'POST',
        query: {
          Version: '2022-08-31',
          Action: action
        },
        accessKeyId: keys.access_key_id,
        secretAccessKey: keys.secret_access_key,
        serviceName: 'cv',
        region: 'cn-north-1',
        bodySha: getBodySha(JSON.stringify(data))
      }
      const params = signParams
      for (const [key, val] of Object.entries(signParams.query)) {
        if (val === undefined || val === null) {
          signParams.query[key] = ''
        }
      }
      return { authorization: sign(signParams), signParams: params }
    },
    async saveObjectFromUrl(url, filename) {
      const fs = require('fs')
      const https = require('https')
      const path = require('path')
      if (!fs.existsSync(path.dirname(filename))) {
        fs.mkdirSync(path.dirname(filename), { recursive: true })
      }
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename)
        https
          .get(url, response => {
            if (response.statusCode !== 200) {
              reject(
                new Error(`Request Failed. Status Code: ${response.statusCode}`)
              )
              return
            }

            response.pipe(file)
            file.on('finish', () => {
              file.close(resolve) // 下载完成后 resolve
            })
          })
          .on('error', err => {
            fs.unlink(filename, () => reject(err)) // 删除未完成的文件
          })
      })
    },
    async saveVideo(url, filename) {
      try {
        await action.saveObjectFromUrl(url, filename)
        const fs = require('fs')
        const task = {
          video_path: filename,
          time: 0.0
        }
        const data = await doodleWorkStore().actions.getVideoThumbnail(task)
        const arrayBuffer = await data.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        fs.writeFileSync(filename.replace('.mp4', '.png'), buffer)
      } catch (error) {
        console.error('下载失败:', error)
      }
    },
    aiGenerateFileRootPath() {
      const os = require('os')
      return `${os.homedir()}/AppData/Local/DoodleAi`
    },
    async readAiHistory() {
      try {
        const fs = require('fs')
        const path = require('path')
        const filePath = path.join(
          action.aiGenerateFileRootPath(),
          'aiHistory.json'
        )
        const raw = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(raw)
      } catch (err) {
        console.error('❌ 加载 JSON 文件失败:', err)
        return null
      }
    },
    async writeAiHistory() {
      const fs = require('fs')
      const path = require('path')
      const filePath = path.join(
        action.aiGenerateFileRootPath(),
        'aiHistory.json'
      )
      if (state.value.aiHistory !== null) {
        fs.writeFileSync(filePath, JSON.stringify(state.value.aiHistory))
      }
    }
  }
  return { state, action }
})
