<template>
  <XyzTransition appear xyz="fade">
    <div class="main">
      <topbar />
      <sidebar />
      <router-view />
    </div>
  </XyzTransition>
</template>

<script>
import Topbar from '@/components/tops/Topbar.vue'
import Sidebar from '@/components/sides/Sidebar.vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { ElMessage } from 'element-plus'
import i18n from '@/lib/i18n.js'

export default {
  name: 'main-wrapper',

  components: {
    Topbar,
    Sidebar
  },

  mounted() {
    this.$socket.connect()
    try {
      doodleWorkStore()
        .actions.getToolVersions()
        .then(() => {
          doodleWorkStore().actions.pullProcess()
        })
    } catch (error) {
      ElMessage({
        message: i18n.global.t('doodle_work.initial_error'),
        type: 'error',
        duration: 2000
      })
    }
  }
}
</script>

<style>
.main {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
