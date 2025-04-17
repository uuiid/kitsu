<script setup>
import TextField from '@/components/widgets/TextField.vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import i18n from '@/lib/i18n.js'
import Combobox from '@/components/widgets/Combobox.vue'

const doodleWork = doodleWorkStore()
doodleWork.actions.getToolVersions()
const readonlyFields = ['UE_version']

const displayFields = computed(() => {
  return doodleWork.state.doodleWorkSetting
})

const versions = computed(() => {
  const values = []
  doodleWork.state.versions.forEach(version => {
    values.push({ label: version, value: version })
  })
  return values
})

if (doodleWork.state.localHttpPath) doodleWork.actions.getWorkSetting()
const readUEVersion = path => {
  const fs = require('fs')
  let vision_file = `${path}\\Engine\\Binaries\\Win64\\UnrealEditor.version`
  if (path.includes('\\Engine\\Binaries\\Win64')) {
    vision_file = `${path}\\UnrealEditor.version`
  } else if (path.includes('\\Engine\\Binaries')) {
    vision_file = `${path}\\Win64\\UnrealEditor.version`
  } else if (path.includes('\\Engine')) {
    vision_file = `${path}\\Binaries\\Win64\\UnrealEditor.version`
  }
  if (fs.existsSync(vision_file)) {
    const data = fs.readFileSync(vision_file, 'utf8')
    const jsonObject = JSON.parse(data)
    doodleWork.state.doodleWorkSetting['UE_path'] = vision_file.replace(
      '\\Engine\\Binaries\\Win64\\UnrealEditor.version',
      ''
    )
    ElMessage.success('UE路径添加成功')
    return `${jsonObject['MajorVersion']}.${jsonObject['MinorVersion']}`
  }
  ElMessage.error('请输入正确的UE路径例：D:\\EpicGame\\UE_5.5')
  return ''
}
const onTextChange = (val, key) => {
  if (key === 'UE_path') {
    doodleWork.state.doodleWorkSetting['UE_version'] = readUEVersion(
      val.target.value
    )
  } else if (key === 'maya_parallel_quantity') {
    doodleWork.state.doodleWorkSetting['maya_parallel_quantity'] = Number(
      val.target.value
    )
  }
}
const textPlaceholder = (val, key) => {
  if (key === 'UE_path') return '请输入UE路径例：D:\\EpicGame\\UE_5.5'
  else return String(val)
}

const onConfirm = async () => {
  try {
    if (doodleWork.state.doodleWorkSetting['UE_path']) {
      if (!doodleWork.state.doodleWorkSetting['UE_version']) {
        ElMessage.error('请先正确设置ue路径')
        return 0
      }
    }
    await doodleWork.actions.setWorkSetting()
    ElMessage({
      message: i18n.global.t('doodle_work.set_success'),
      type: 'success'
    })
  } catch (error) {
    ElMessage.error('设置失败')
  }
}
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': doodleWork.state.isActiveSettingModal
    }"
  >
    <div
      class="modal-background"
      @click="doodleWork.state.isActiveSettingModal = false"
    ></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('settings.title') }}
        </h1>
        <combobox
          class="flexrow-item"
          label="版本"
          :options="versions"
          v-model="doodleWork.state.doodleWorkZipFileVision"
          @change="onVersionChange"
        />
        <text-field
          ref="nameField"
          :placeholder="textPlaceholder(value, key)"
          :key="key"
          :label="$t(`doodle_work.settings.${key}`)"
          :readonly="readonlyFields.includes(key)"
          v-for="(value, key) in displayFields"
          :model-value="value"
          v-model="displayFields[key]"
          v-show="key !== 'authorize' && value !== 'true'"
          @change="val => onTextChange(val, key)"
        />
        <text-field
          label="视频导出路径"
          v-model="doodleWork.state.outPath"
          v-show="
            ['merge_video', 'connect_video'].includes(
              doodleWork.currentDoodleWorkState.name
            )
          "
        ></text-field>
        <div class="has-text-right">
          <a
            :class="{
              button: true,
              'is-primary': true
            }"
            @click="onConfirm"
          >
            {{ $t('main.confirmation') }}
          </a>
          <button
            class="button is-link"
            @click="doodleWork.state.isActiveSettingModal = false"
          >
            {{ $t('main.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
