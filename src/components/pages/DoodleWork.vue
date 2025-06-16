<script setup>
import PageTitle from '@/components/widgets/PageTitle.vue'
import { CircleArrowDown } from 'lucide-vue-next'
import ExportFbx from '@/components/widgets/ExportFbx.vue'
import { computed, onMounted, onUnmounted, ref, watchEffect, watch } from 'vue'
import AddDoodleWork from '@/components/modals/AddDoodleWork.vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import DoodleWorkLogModal from '@/components/modals/DoodleWorkLogModal.vue'
import { useHead } from '@unhead/vue'
import { Settings } from 'lucide-vue-next'
import i18n from '@/lib/i18n.js'
import DoodleWorkSettingModal from '@/components/modals/DoodleWorkSettingModal.vue'
import { ElMessage, ElNotification } from 'element-plus'
import PluginsCentral from '@/components/widgets/PluginsCentral.vue'
import ExtractCaption from '@/components/widgets/ExtractCaption.vue'
import DoodleWorkHistoryTaskModal from '@/components/modals/DoodleWorkHistoryTaskModal.vue'
import AIScript from '@/components/widgets/AIScript.vue'
import router from '@/router/index.js'
import VideoModal from '@/components/modals/VideoModal.vue'
import AiPainting from '@/components/widgets/AiPainting.vue'
//import { io } from 'socket.io-client'
//import router from '@/router/index.js'
useHead({
  title: i18n.global.t('doodle_work.doodle_work')
})
const doodleWork = doodleWorkStore()
onMounted(() => {
  //document.addEventListener('keydown', onKeyupEvent)
  doodleWork.actions.getVisitorContext()
})

// createHead(() => ({
//   title: i18n.global.t('doodle_work.doodle_work')
// }))

// 监听连接错误事件
doodleWork.actions.checkIsVisitor()
const currentPage = ref('')
const isShowSettingButton = ref(false)
const version = computed(() => {
  return doodleWork.state.doodleWorkZipFileVision
})
const switchPage = pageName => {
  doodleWork.state.DemonstrateVideoName = pageName.name
  if (pageName.name === 'material_Library') {
    router.push('/video-library')
  } else if (doodleWork.state.isPullProcessed) currentPage.value = pageName
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
  if (message) message.close()
})
let message = null
watchEffect(() => {
  if (doodleWork.state.isPullProcessed === true) {
    if (message) message.close()
  } else {
    message = ElMessage({
      message: messageContent.value,
      type: 'warning',
      duration: 0
    })
  }
})
watch(version, () => {
  doodleWork.actions.pullProcess()
})
const pagedAssets = ref([
  {
    id: 0,
    name: 'ai_script',
    label: 'AI剧本创作',
    textIcon: 'I',
    disabled: true,
    description: '',
    color: '#00b825',
    isVisible: true,
    isBaseTemplate: false,
    hidden: false
  },
  {
    id: 9,
    name: 'ai_painting',
    label: 'AI原画创作',
    textIcon: 'Y',
    disabled: true,
    description: '',
    color: '#00a9b8',
    isVisible: true,
    isBaseTemplate: false,
    hidden: false
  },
  {
    id: 1,
    name: 'export_fbx',
    label: '自动动画',
    textIcon: 'F',
    disabled: true,
    description: '',
    color: '#00b89c',
    isVisible: true,
    isBaseTemplate: true,
    videoName: '自动导出动画'
  },
  {
    id: 2,
    name: 'replace_maya_ref',
    label: '动画替换引用',
    textIcon: 'R',
    disabled: true,
    description: '',
    color: '#9c45e6',
    isVisible: true,
    isBaseTemplate: true
  },
  {
    id: 3,
    name: 'export_abc',
    label: '自动解算',
    textIcon: 'A',
    disabled: true,
    description: '',
    color: '#d775ec',
    isVisible: true,
    isBaseTemplate: true
  },
  {
    id: 4,
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
    id: 6,
    name: 'merge_video',
    label: '一键合成视频(png)',
    textIcon: 'V',
    disabled: true,
    description: '',
    color: '#00FF7F',
    isVisible: false,
    isBaseTemplate: true
  },
  {
    id: 7,
    name: 'connect_video',
    label: '一键连接视频(mp4)',
    textIcon: 'C',
    disabled: true,
    description: '',
    color: '#686aef',
    isVisible: false,
    isBaseTemplate: true
  },
  {
    id: 5,
    name: 'extract_caption',
    label: '自动提取字幕',
    textIcon: 'Z',
    disabled: true,
    description: '',
    color: '#ecd875',
    isVisible: false,
    isBaseTemplate: false
  },
  {
    id: 5,
    name: 'material_Library',
    label: '数字资产库',
    textIcon: 'L',
    disabled: true,
    description: '',
    color: '#55e159',
    isVisible: false,
    isBaseTemplate: false
  }
  // {
  //   id: 9,
  //   name: 'plugin_center',
  //   label: '插件中心',
  //   textIcon: 'P',
  //   disabled: true,
  //   description: '',
  //   color: '#75ec97',
  //   isVisible: true
  // }
])
const pluginAssets = ref([
  {
    id: 8,
    name: 'solving_plugin',
    label: '解算插件',
    textIcon: 'M',
    disabled: true,
    description: '',
    color: '#75adec',
    isVisible: true,
    isPlugin: false,
    installState: false,
    version: '2020'
  },
  {
    id: 9,
    name: 'UE_plugin',
    label: '资产批量导入',
    textIcon: 'I',
    disabled: true,
    description: '',
    color: '#9ea37f',
    isVisible: true,
    isPlugin: false,
    installState: false
  },
  {
    id: 10,
    name: 'UE_plugin',
    label: '特效资源库',
    textIcon: 'F',
    disabled: true,
    description: '',
    color: '#e366ef',
    isVisible: true,
    isPlugin: false,
    installState: false
  },
  {
    id: 11,
    name: 'UE_plugin',
    label: '查找超限材质',
    textIcon: 'C',
    disabled: true,
    description: '',
    color: '#6490f1',
    isVisible: true,
    isPlugin: false,
    installState: false
  },
  {
    id: 12,
    name: 'UE_plugin',
    label: '文件分类整理',
    textIcon: 'O',
    disabled: true,
    description: '',
    color: '#ed4f9d',
    isVisible: true,
    isPlugin: false,
    installState: false
  },
  {
    id: 12,
    name: 'UE_plugin',
    label: '一键渲染角色',
    textIcon: 'R',
    disabled: true,
    description: '',
    color: '#a64fed',
    isVisible: true,
    isPlugin: false,
    installState: false
  }
])
const installPlugin = async plugin => {
  plugin.installState = true
  try {
    const os = require('os')
    const fs = require('fs')
    if (plugin.name === 'solving_plugin') {
      if (doodleWork.doodleWorkFilePath) {
        const sourcePath = `${doodleWork.doodleWorkFilePath}\\maya`
        const destPathRoot = `${os.homedir()}\\Documents\\maya\\${plugin.version}\\modules`
        const destPath = `${destPathRoot}\\doodle`
        await doodleWork.actions.copyFolder(sourcePath, destPath)
        console.log(destPath)
        fs.unlinkSync(`${destPath}\\doodle.mod`)
        //fs.renameSync(`${destPath}\\maya`, `${destPath}\\doodle`)
        fs.writeFileSync(
          `${destPathRoot}\\doodle.mod`,
          `+ doodle 1.1 ./doodle
MYMODULE_LOCATION:= .
PATH+:= plug-ins
PYTHONPATH+:= scripts`
        )
      }
    } else if (plugin.name === 'UE_plugin') {
      if (doodleWork.state.doodleWorkSetting.UE_path) {
        if (fs.existsSync(doodleWork.state.doodleWorkSetting.UE_path)) {
          let doodleSourceName = 'ue55_Plug'
          if (doodleWork.state.doodleWorkSetting.UE_version === '5.4') {
            doodleSourceName = 'ue54_Plug'
          }
          if (
            !fs.existsSync(
              `${doodleWork.doodleWorkFilePath}\\${doodleSourceName.sourceName}`
            )
          ) {
            ElNotification({
              title: i18n.global.t('doodle_work.install_fail'),
              message:
                '找不到ue源路径:' +
                `${doodleWork.doodleWorkFilePath}\\${doodleSourceName.sourceName}`,
              type: 'error'
            })
            plugin.installState = false
            return
          }
          const subPlugins = [
            { sourceName: 'SideFX_Labs', destName: 'SideFX_Labs' },
            { sourceName: doodleSourceName, destName: 'Doodle' },
            { sourceName: 'UnrealEngine5VLC', destName: 'UnrealEngine5VLC' }
          ]
          for (const subPlugin of subPlugins) {
            const sourcePath = `${doodleWork.doodleWorkFilePath}\\${subPlugin.sourceName}`
            const destPath = `${doodleWork.state.doodleWorkSetting.UE_path}\\Engine\\Plugins\\${subPlugin.destName}`
            doodleWork.actions.copyFolder(sourcePath, destPath)
          }
        } else {
          ElNotification({
            title: i18n.global.t('doodle_work.install_fail'),
            message:
              '找不到ue路径:' + doodleWork.state.doodleWorkSetting.UE_path,
            type: 'error'
          })
          plugin.installState = false
          return
        }
      } else {
        ElNotification({
          title: i18n.global.t('doodle_work.install_fail'),
          message: '请先设置ue路径',
          type: 'error'
        })
        plugin.installState = false
        return
      }
    }
    ElNotification({
      title: i18n.global.t('doodle_work.install_success'),
      message: '',
      type: 'success'
    })
  } catch (e) {
    ElNotification({
      title: i18n.global.t('doodle_work.install_fail'),
      message: '请检查文件是否被占用',
      type: 'error'
    })
    console.error(e)
  }
  plugin.installState = false
}

const onSetOutPath = () => {
  const fs = require('fs')
  if (
    doodleWork.state.outPath &&
    fs.statSync(doodleWork.state.outPath).isDirectory()
  ) {
    if (doodleWork.state.setOutPathCallback) {
      doodleWork.state.setOutPathCallback()
      doodleWork.state.setOutPathCallback = null
    }
  } else {
    currentPage.value = ''
  }
  doodleWork.state.dialogFormVisible = false
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
            <page-title class="mt1 sub-title" :text="pagTitle" :bold="true" />
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
        <div v-if="homePage">
          <div class="list-body" v-if="homePage">
            <ul class="items">
              <li
                @mouseenter="
                  entity.isPlugin !== undefined
                    ? (entity.isPlugin = true)
                    : false
                "
                @mouseleave="
                  entity.isPlugin !== undefined
                    ? (entity.isPlugin = false)
                    : false
                "
                class="item flexcolumn"
                :key="entity.id"
                v-for="entity in pagedAssets"
                @click="
                  entity.isPlugin !== undefined ? false : switchPage(entity)
                "
                v-show="(entity.isVisible || visitorShow) && !entity.hidden"
              >
                <div class="card">
                  <span
                    class="text-icon"
                    :style="`background-color: ${entity.color}`"
                    >{{ entity.textIcon }}</span
                  >
                  <div class="item-description">
                    <div class="item-entity-title">
                      <span class="entity-name" :title="entity.label">{{
                        entity.label
                      }}</span>
                      <a
                        title="安装"
                        :class="{
                          'is-loading': entity.installState
                        }"
                        @click.stop="installPlugin(entity)"
                      >
                        <circle-arrow-down
                          class="download"
                          v-show="entity.isPlugin"
                        ></circle-arrow-down>
                      </a>
                    </div>
                    <div class="entity-description" :title="entity.label">
                      {{ entity.description }}
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div style="font-size: 30px; margin-bottom: 20px">插件中心</div>
          <div class="list-body" v-if="homePage">
            <ul class="items">
              <li
                @mouseenter="
                  entity.isPlugin !== undefined
                    ? (entity.isPlugin = true)
                    : false
                "
                @mouseleave="
                  entity.isPlugin !== undefined
                    ? (entity.isPlugin = false)
                    : false
                "
                class="item flexcolumn"
                :key="entity.id"
                v-for="entity in pluginAssets"
                @click="
                  entity.isPlugin !== undefined ? false : switchPage(entity)
                "
                v-show="(entity.isVisible || visitorShow) && !entity.hidden"
              >
                <div class="card">
                  <span
                    class="text-icon"
                    :style="`background-color: ${entity.color}`"
                    >{{ entity.textIcon }}</span
                  >
                  <div class="item-description">
                    <div class="item-entity-title">
                      <span class="entity-name" :title="entity.label">{{
                        entity.label
                      }}</span>
                      <a
                        title="安装"
                        :class="{
                          'is-loading': entity.installState
                        }"
                        @click.stop="installPlugin(entity)"
                      >
                        <circle-arrow-down
                          class="download"
                          v-show="entity.isPlugin"
                        ></circle-arrow-down>
                      </a>
                    </div>
                    <div class="entity-description" :title="entity.label">
                      {{ entity.description }}
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <export-fbx
          class="datatable-wrapper"
          :name="currentPage.name"
          :is-set-out-path="
            ['merge_video', 'connect_video'].includes(currentPage.name)
          "
          v-if="currentPage.isBaseTemplate"
        />

        <extract-caption
          class="datatable-wrapper"
          :name="currentPage.name"
          :is-drop="true"
          v-if="currentPage.name === 'extract_caption'"
        />
        <plugins-central v-if="currentPage.name === 'plugin_center'" />
        <a-i-script v-if="currentPage.name === 'ai_script'"></a-i-script>
        <ai-painting v-show="currentPage.name === 'ai_painting'"></ai-painting>
      </div>
      <add-doodle-work />
      <doodle-work-log-modal v-if="doodleWork.state.isActiveLogModal" />
      <doodle-work-history-task-modal
        v-if="doodleWork.state.isActiveHistoryModal"
      />
      <video-modal v-if="doodleWork.state.isShowDemonstrateVideo" />
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
  max-height: 100vh;
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
  align-items: center;
}

.download {
  cursor: pointer;

  &:hover {
    color: green;
  }
}

.item-entity-title {
  display: flex;
  justify-content: space-between;
  gap: 4em;
}

.entity-button {
  position: absolute;
  bottom: 1em;
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

.sub-title {
  margin-top: 8px;
}

.list-body {
  max-height: 40vh;
  height: 100%;
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
  min-width: 320px;
  max-width: 320px;
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
      white-space: nowrap;
      font-size: 20px;
      max-width: 100px;
      min-width: 100px;
    }
  }
}
</style>
