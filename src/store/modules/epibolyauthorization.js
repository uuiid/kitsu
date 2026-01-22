import { defineStore } from 'pinia'
import { ref } from 'vue'
import epibolyAuthorizationApi from '@/store/api/epibolyAuthorization.js'

function initState() {
  return {}
}

export const epibolyAuthorizationStore = defineStore(
  'epibolyAuthorizationStore',
  () => {
    const state = ref(initState())
    const actions = {
      getEpibolyAuthorization(project_id) {
        return epibolyAuthorizationApi.getEpibolyAuthorization(project_id)
      },
      addEpibolyAuthorization(project_id, data) {
        console.log(data)
        return epibolyAuthorizationApi.addEpibolyAuthorization(project_id, data)
      },
      deleteEpibolyAuthorization(project_id, authorization_id) {
        return epibolyAuthorizationApi.deleteEpibolyAuthorization(
          project_id,
          authorization_id
        )
      }
    }

    return {
      state,
      actions
    }
  }
)
