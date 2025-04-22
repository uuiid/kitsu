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
  getKlingToken() {
    const path = ``
    return client.pget(path)
  },
  txt2video(data, token) {
    const path = `https://api.klingai.com/v1/videos/text2video`
    return client.ppostKling(path, data, token)
  },
  image2video(data, token) {
    const path = `https://api.klingai.com/v1/videos/image2video`
    return client.ppostKling(path, data, token)
  },
  videoExtend(data, token) {
    const path = `https://api.klingai.com/v1/videos/video-extend`
    return client.ppostKling(path, data, token)
  }
}
