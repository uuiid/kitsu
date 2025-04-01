import { defineStore } from 'pinia'
import { ref } from 'vue'

const initState = {
  currentDialogue: '',
  allDialogue: new Map()
}
export const AiScriptStore = defineStore('AiScriptStore', () => {
  const state = ref(initState)
  const action = {}
  return { state, action }
})
