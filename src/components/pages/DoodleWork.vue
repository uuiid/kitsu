<script setup>
import PageTitle from '@/components/widgets/PageTitle.vue'
import ExportFbx from '@/components/widgets/ExportFbx.vue'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import AddDoodleWork from '@/components/modals/AddDoodleWork.vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import DoodleWorkLogModal from '@/components/modals/DoodleWorkLogModal.vue'
import { useHead } from 'unhead'
import { Settings } from 'lucide-vue-next'
import i18n from '@/lib/i18n.js'
import DoodleWorkSettingModal from '@/components/modals/DoodleWorkSettingModal.vue'
import { ElMessage, ElNotification } from 'element-plus'
import PluginsCentral from '@/components/widgets/PluginsCentral.vue'
import ExtractCaption from '@/components/widgets/ExtractCaption.vue'
//import router from '@/router/index.js'
useHead({
  title: i18n.global.t('doodle_work.doodle_work')
})
const doodleWork = doodleWorkStore()
if (navigator.userAgent.includes('Electron')) doodleWork.actions.pullProcess()
onMounted(() => {
  //document.addEventListener('keydown', onKeyupEvent)
  doodleWork.actions.getVisitorContext()
})

doodleWork.actions.checkIsVisitor()
const currentPage = ref('')
const isShowSettingButton = ref(false)
const switchPage = pageName => {
  if (doodleWork.state.isPullProcessed) currentPage.value = pageName
  else
    ElNotification({
      title: i18n.global.t('video_library.warning'),
      message: messageContent.value,
      type: 'warning',
      duration: 2000
    })
}
const messageContent = computed(() => {
  return navigator.userAgent.includes('Electron')
    ? i18n.global.t('doodle_work.initializing')
    : i18n.global.t('doodle_work.please_use_the_client')
})

const homePage = computed(() => {
  return currentPage.value.name === 'home' || currentPage.value === ''
})

const pagTitle = computed(() => {
  return currentPage.value.label
    ? '->' + currentPage.value.label
    : currentPage.value.label
})

const visitorShow = computed(() => {
  return !doodleWork.state.isVisitor
})

// const onKeyupEvent = event => {
//   console.log('onKeyupEvent', event.key)
//   //if (event.key === 'Escape') router.push('/login')
// }

const onClickSetting = () => {
  if (doodleWork.state.isPullProcessed)
    doodleWork.state.isActiveSettingModal = true
  else
    ElNotification({
      title: i18n.global.t('video_library.warning'),
      message: messageContent.value,
      type: 'warning',
      duration: 2000
    })
}

const intervalId = setInterval(() => {
  if (navigator.userAgent.includes('Electron')) {
    if (doodleWork.state.localHttpPath) {
      doodleWork.actions.getWorkSetting()
      clearInterval(intervalId)
    } else doodleWork.actions.setLocalHttpPath()
  } else {
    clearInterval(intervalId)
  }
}, 1000)

onUnmounted(() => {
  clearInterval(intervalId)
  doodleWork.state.isVisitor = false
  message.close()
})
const message = ElMessage({
  message: messageContent.value,
  type: 'warning',
  duration: 0
})
watchEffect(() => {
  if (doodleWork.state.isPullProcessed) {
    message.close()
  }
})

const pagedAssets = ref([
  {
    id: 0,
    name: 'export_fbx',
    label: '导出FBX',
    textIcon: 'F',
    disabled: true,
    description: '',
    color: '#00b89c',
    isVisible: true,
    isBaseTemplate: true
  },
  {
    id: 1,
    name: 'export_abc',
    label: '导出ABC',
    textIcon: 'A',
    disabled: true,
    description: '',
    color: '#d775ec',
    isVisible: false,
    isBaseTemplate: true
  },
  {
    id: 2,
    name: 'auto_light',
    label: '自动灯光',
    textIcon: 'L',
    disabled: true,
    description: '',
    color: '#ec758b',
    isVisible: false,
    isBaseTemplate: true
  },
  {
    id: 3,
    name: 'extract_caption',
    label: '提取字幕',
    textIcon: 'Z',
    disabled: true,
    description: '',
    color: '#ecd875',
    isVisible: false,
    isBaseTemplate: false
  },
  {
    id: 4,
    name: 'image_to_video',
    label: '图片转视频',
    textIcon: 'V',
    disabled: true,
    description: '',
    color: '#00FF7F',
    isVisible: false,
    isBaseTemplate: true
  },
  {
    id: 5,
    name: 'plugin_center',
    label: '插件中心',
    textIcon: 'P',
    disabled: true,
    description: '',
    color: '#75adec',
    isVisible: false
  }
])
const onSetOutPath = () => {
  const fs = require('fs')
  if (
    doodleWork.state.outPath &&
    fs.statSync(doodleWork.state.outPath).isDirectory()
  ) {
    doodleWork.state.dialogFormVisible = false
    if (doodleWork.state.setOutPathCallback) {
      doodleWork.state.setOutPathCallback()
      doodleWork.state.setOutPathCallback = null
    }
  }
}
</script>

<template>
  <div>
    <div class="columns fixed-page">
      <div class="doodle-work">
        <header
          class="header interval"
          @mouseenter="isShowSettingButton = true"
          @mouseleave="isShowSettingButton = false"
        >
          <div class="header-row">
            <page-title
              class="mt1 mt1-hover"
              :text="$t('doodle_work.doodle_work')"
              :bold="true"
              @click="switchPage('')"
            />
            <page-title class="mt1" :text="pagTitle" :bold="true" />
          </div>
          <div class="header-action">
            <settings
              class="mt1 mt1-hover"
              v-show="true"
              @click="onClickSetting"
            />
            <p
              v-if="doodleWork.state.isVisitor"
              class="has-text-centered"
              :class="{
                button: true
              }"
            >
              <router-link :to="{ name: 'login' }">
                {{ $t('doodle_work.logout') }}
              </router-link>
            </p>
          </div>
        </header>
        <div class="list-body" v-if="homePage">
          <ul class="items">
            <li
              class="item flexcolumn"
              :key="entity.id"
              v-for="entity in pagedAssets"
              @click="switchPage(entity)"
              v-show="entity.isVisible || visitorShow"
            >
              <div class="card">
                <span
                  class="text-icon"
                  :style="`background-color: ${entity.color}`"
                  >{{ entity.textIcon }}</span
                >
                <div class="item-description">
                  <div class="entity-name" :title="entity.label">
                    {{ entity.label }}
                  </div>
                  <div class="entity-description" :title="entity.label">
                    {{ entity.description }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <export-fbx
          class="datatable-wrapper"
          :name="currentPage.name"
          :is-set-out-path="currentPage.name === 'image_to_video'"
          v-if="currentPage.isBaseTemplate"
        />

        <extract-caption
          class="datatable-wrapper"
          :name="currentPage.name"
          v-if="currentPage.name === 'extract_caption'"
        />
        <plugins-central v-if="currentPage.name === 'plugin_center'" />
      </div>
      <add-doodle-work />
      <doodle-work-log-modal v-if="doodleWork.state.isActiveLogModal" />
      <doodle-work-setting-modal />
    </div>
  </div>
  <el-dialog
    v-model="doodleWork.state.dialogFormVisible"
    title="设置导出路径"
    width="500"
    @close="onSetOutPath"
  >
    <el-form>
      <el-form-item label="导出路径">
        <el-input v-model="doodleWork.state.outPath" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="onSetOutPath"> 确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.doodle-work {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  width: 100%;
  padding: 4em 2em 1em 2em;
  color: var(--text);
  margin-left: auto;
  margin-right: auto;
  gap: 10px;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-right: 20px;
}

.header-row {
  display: flex;
  flex-direction: row;
}

.header-action {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
}

.has-text-centered {
  margin-top: 10px;
  padding: 5px;
  border-radius: 5px;
  //border: 1px solid $green;
}

.mt1-hover {
  &:hover {
    cursor: pointer;
  }
}

.list-body {
  height: 90%;
  overflow: auto;
  //border: thick dotted #ff0000;
}

.items {
  display: flex;
  flex-wrap: wrap;
  gap: 50px;
  //height: 100%;
  //overflow: auto;
}

.card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  min-width: 300px;
  min-height: 100px;
  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);
  border: 5px solid transparent;
  border-radius: 1em;
  padding: 2px;
  background-color: var(--background-alt);

  .dark & {
    color: var(--text-alt);
    background-color: var(--background-alt);
  }

  &:hover {
    cursor: pointer;
    border-color: var(--background-selectable);
  }

  .text-icon {
    border-radius: 5px;
    display: flex;
    user-select: none;
    justify-content: center;
    align-items: center;
    font-size: 100px;
    min-height: 100px;
    min-width: 100px;
    max-width: 100px;
    max-height: 100px;
    background-color: #ec758b;
    color: var(--text-strong);
  }

  .item-description {
    display: flex;
    height: 100px;
    flex-direction: column;

    .entity-name {
      font-size: 20px;
    }
  }
}
</style>
