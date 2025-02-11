<script setup>
import { ref, watchEffect } from 'vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { ElNotification } from 'element-plus'
import i18n from '@/lib/i18n.js'

const doodleWork = doodleWorkStore()

const pagedAssets = ref([
  {
    id: 0,
    label: '解算插件',
    textIcon: 'S',
    disabled: true,
    description: '创建解算资产、解析引用',
    version: '2020',
    color: '#00b89c',
    isVisible: true,
    installState: false,
    installPath: ''
  },
  {
    id: 1,
    label: 'UE插件',
    textIcon: 'U',
    disabled: true,
    description: 'ue5插件',
    version: '5.4',
    color: 'rgba(0,0,1,0.58)',
    isVisible: false,
    installState: false,
    installPath: ''
  }
])

// const checkPluginState = plugin => {
//   const fs = require('fs')
//   return fs.existsSync(plugin.installPath)
// }

const installPlugin = async plugin => {
  plugin.installState = true
  try {
    const os = require('os')
    const fs = require('fs')
    if (plugin.id === 0) {
      if (doodleWork.doodleWorkFilePath) {
        const sourcePath = `${doodleWork.doodleWorkFilePath}\\maya`
        const destPathRoot = `${os.homedir()}\\Documents\\maya\\${plugin.version}\\modules`
        const destPath = `${destPathRoot}\\doodle`
        await doodleWork.actions.copyFolder(sourcePath, destPath)
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
    } else if (plugin.id === 1) {
      if (doodleWork.state.doodleWorkSetting.UE_path) {
        const subPlugins = [
          { sourceName: 'SideFX_Labs', destName: 'SideFX_Labs' },
          { sourceName: 'ue54_Plug', destName: 'Doodle' },
          { sourceName: 'UnrealEngine5VLC', destName: 'UnrealEngine5VLC' }
        ]
        for (const subPlugin of subPlugins) {
          const sourcePath = `${doodleWork.doodleWorkFilePath}\\${subPlugin.sourceName}`
          const destPath = `${plugin.installPath}\\${subPlugin.destName}`
          doodleWork.actions.copyFolder(sourcePath, destPath)
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

const setPluginInstallPath = async () => {
  pagedAssets.value.forEach(plugin => {
    if (plugin.id === 0)
      plugin.installPath = doodleWork.state.doodleWorkSetting.maya_path
    else if (plugin.id === 1)
      plugin.installPath =
        doodleWork.state.doodleWorkSetting.UE_path + '\\Engine\\Plugins'
  })
}

watchEffect(() => {
  if (doodleWork.state.doodleWorkSetting) {
    setPluginInstallPath()
  }
})
</script>

<template>
  <div class="list-body">
    <ul class="items">
      <li
        class="item flexcolumn"
        :key="entity.id"
        v-for="entity in pagedAssets"
        v-show="doodleWork.state.isVisitor ? entity.isVisible : true"
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
              描述：{{ entity.description }}
            </div>
            <div>{{ `\n` }}</div>
            <div class="entity-description" :title="entity.label">
              版本：{{ entity.version }}
            </div>
          </div>
          <div class="item-install-button">
            <p
              class="install-button"
              :class="{
                button: true,
                'is-loading': entity.installState
              }"
              @click="installPlugin(entity)"
            >
              {{ entity.installState ? `安装` : `安装` }}
            </p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.list-body {
  height: 90%;
  overflow: auto;
  //border: thick dotted #ff0000;
}

.items {
  display: flex;
  flex-direction: column;
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
    width: 100%;
    flex-direction: column;
    white-space: pre-line;

    .entity-name {
      font-size: 20px;
    }
  }
}

.item-install-button {
  width: 100%;
  display: flex;
  padding-right: 50px;
  flex-direction: row;
  align-items: center;
  justify-content: end;
}
</style>
