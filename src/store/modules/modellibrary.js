import { defineStore } from 'pinia'
import { ref } from 'vue'
import videolibraryApi from '@/store/api/videolibrary.js'
import { ElMessage } from 'element-plus'

const initState = {
  tags: new Map(),
  selectedTags: new Map()
}
export const ModelLibraryStore = defineStore('ModelLibraryStore', () => {
  const state = ref(initState)
  const actions = {
    getAllTags: async () => {
      return await videolibraryApi.getAllTags()
    },
    setTags: async () => {
      const tags = await videolibraryApi.getAllTags()
      state.value.tags.clear()
      tags.forEach(tag => {
        state.value.tags.set(tag.id, tag)
      })
    },
    createTag: async tag => {
      if (actions.checkTag(tag)) {
        const res = await videolibraryApi.createTag(tag)
        if (res) {
          state.value.tags.set(res.id, res)
          return res
        }
      }
      return false
    },
    modifyTag: async tag => {
      if (actions.checkTag(tag)) {
        const res = await videolibraryApi.modifyTag(tag)
        state.value.tags.get(res.id).name = res.name
      }
    },
    deleteTag: async tag => {
      await videolibraryApi.deleteTag(tag)
      state.value.tags.delete(tag.id)
    },
    tagLinkAsset: async (tags, asset_id) => {
      for (const tag of tags) {
        await videolibraryApi.tagLinkAsset(tag, asset_id)
      }
    },
    deleteTagLinkAsset: async (tag_id, asset_id) => {
      await videolibraryApi.deleteTagLinkAsset(tag_id, asset_id)
    },
    checkTag: tag => {
      const tags = [...state.value.tags.values()].filter(temp_tag => {
        return temp_tag.name === tag.name
      })
      if (tags.length > 0) {
        ElMessage.error('该标签已存在')
        return false
      } else {
        console.log(state.value.tags.has(tag.id))
        return true
      }
    },
    handleInputConfirm: async (tag_name, callback) => {
      const tag = { name: tag_name }
      const res = await ModelLibraryStore().actions.createTag(tag)
      callback(res)
    }
  }
  return { state, actions }
})
