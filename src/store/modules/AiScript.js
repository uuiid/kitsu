import { defineStore } from 'pinia'
import { ref } from 'vue'
import AiScript from '@/store/api/AiScript.js'

const initState = {
  currentDialogue: '',
  allDialogue: new Map(),
  klingToken: ''
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
    getKlingToken: () => {
      return AiScript.getKlingToken()
    },
    txt2video: data => {
      return AiScript.txt2video(data, state.value.klingToken)
    },
    image2video: data => {
      return AiScript.image2video(data, state.value.klingToken)
    }
  }
  return { state, action }
})
