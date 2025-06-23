import { defineStore } from 'pinia'
import { ref } from 'vue'
import AiScript from '@/store/api/AiScript.js'

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

const initState = {
  currentDialogue: '',
  allDialogue: new Map(),
  jiMengAccessKeyId: '',
  receiveImageList: [
    'https://p9-aiop-sign.byteimg.com/tos-cn-i-vuqhorh59i/20250617140115F5258BAC2C3966A0D916-0~tplv-vuqhorh59i-image.image?rk3s=7f9e702d&x-expires=1750226483&x-signature=VBcK%2FBbP53G85dwPmMypVhjM8as%3D'
  ],
  receiveVideoList: [],
  receiveImage2VideoList: [],
  receiveTxt2ImageTimer: null,
  receiveImage2ImageTimer: null,
  txt2ImageIsLoading: false,
  image2VideoIsLoading: false,
  txt2VideoIsLoading: false
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
      const { authorization, signParams } = action.createAuthorization(
        'CVProcess',
        true,
        data
      )
      const res = await AiScript.txt2image(data, signParams, authorization)
      if (res.data.image_urls.length > 0)
        state.value.receiveImageList.push(...res.data.image_urls)
      state.value.txt2ImageIsLoading = false
      return res
    },
    txt2video: async data => {
      data.req_key = 'jimeng_vgfm_t2v_l20'
      const { authorization, signParams } = action.createAuthorization(
        'CVSync2AsyncSubmitTask',
        true,
        data
      )
      const res = await AiScript.txt2video(data, signParams, authorization)
      if (res.message === 'success') {
        const startDate = Date.now()
        state.value.receiveTxt2ImageTimer = setInterval(() => {
          action.getTxt2video(
            {
              req_key: data.req_key,
              task_id: res.data.task_id
            },
            startDate
          )
        }, 1000)
      }
      return res
    },
    getTxt2video: async (data, startDate) => {
      if (Date.now() - startDate > 60000) {
        clearInterval(state.value.receiveTxt2ImageTimer)
      }
      const { authorization, signParams } = action.createAuthorization(
        'CVSync2AsyncGetResult',
        true,
        data
      )
      const res = await AiScript.getTxt2video(data, signParams, authorization)
      if (res.message === 'Success') {
        clearTimeout(state.value.receiveTxt2ImageTimer)
        state.value.txt2VideoIsLoading = false
        state.value.receiveVideoList.push(res.data.video_url)
      }
      return res
    },
    image2video: async data => {
      data.req_key = 'jimeng_vgfm_i2v_l20'
      const { authorization, signParams } = action.createAuthorization(
        'CVSync2AsyncSubmitTask',
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
            startDate
          )
        }, 1000)
      }
      return res
    },
    getImage2Video: async (data, startDate) => {
      if (Date.now() - startDate > 60000) {
        clearInterval(state.value.receiveImage2ImageTimer)
      }
      const { authorization, signParams } = action.createAuthorization(
        'CVSync2AsyncGetResult',
        true,
        data
      )
      const res = await AiScript.getTxt2video(data, signParams, authorization)
      if (res.message === 'Success') {
        clearTimeout(state.value.receiveImage2ImageTimer)
        state.value.image2VideoIsLoading = false
        state.value.receiveImage2VideoList.push(res.data.video_url)
      }
      return res
    },
    createAuthorization(action, post = true, data = {}) {
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
        accessKeyId: 'AKLTZWM3MTcxOTY2MzhmNGQwYzgwMDQxYjBiOTNmZjE3NzE',
        secretAccessKey:
          'WVRZek5UaGxPR0V6WVdNMk5EQTNOV0k1TVRVNFptSTFZVE5sTVRoaU1tTQ==',
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
    }
  }
  return { state, action }
})
