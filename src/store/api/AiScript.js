import client from '@/store/api/client.js'

export default {
  async chat(data, callback, host) {
    const path = `${host}/api/chat`
    try {
      const response = await fetch(path, {
        method: 'post',
        responseType: 'stream',
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const reader = response.body.getReader()
      const textDecoder = new TextDecoder()
      let result = true
      while (result) {
        const { done, value } = await reader.read()
        if (done) {
          result = false
          break
        }
        callback(textDecoder.decode(value))
      }
    } catch (err) {
      console.log('发生错误:', err)
    }
  },
  getJiMengToken() {
    const path = ``
    return client.pget(path)
  },
  txt2image(data, signParams, authorization) {
    const path = `https://visual.volcengineapi.com/?Action=CVSync2AsyncSubmitTask&Version=2022-08-31`
    return client.ppostJiMeng(path, data, signParams, authorization)
  },
  txt2video(data, signParams, authorization) {
    const path = `https://visual.volcengineapi.com/?Action=CVSync2AsyncSubmitTask&Version=2022-08-31`
    return client.ppostJiMeng(path, data, signParams, authorization)
  },
  getTxt2Image(data, signParams, authorization) {
    const path = `https://visual.volcengineapi.com?Action=CVSync2AsyncGetResult&Version=2022-08-31`
    return client.ppostJiMeng(path, data, signParams, authorization)
  },
  getTxt2video(data, signParams, authorization) {
    const path = `https://visual.volcengineapi.com?Action=CVSync2AsyncGetResult&Version=2022-08-31`
    return client.ppostJiMeng(path, data, signParams, authorization)
  },
  image2video(data, signParams, authorization) {
    const path = `https://visual.volcengineapi.com?Action=CVSync2AsyncSubmitTask&Version=2022-08-31`
    return client.ppostJiMeng(path, data, signParams, authorization)
  },
  videoExtend(data, token) {
    const path = `https://api.klingai.com/v1/videos/video-extend`
    return client.ppostJiMeng(path, data, token)
  },
  getJiMengKey() {
    const path = `/api/doodle/key/ji_meng`
    return client.pget(path)
  },
  getSharedAIAssets() {
    const path = `/api/doodle/ai_image`
    return client.pget(path)
  },
  postSharedAIAssets(data) {
    const path = `/api/doodle/ai_image`
    return client.ppost(path, data)
  },
  updateAIImage(data) {
    const path = `/api/doodle/pictures/${data.task_id}`
    return client.ppostFileData(path, data)
  }
}
