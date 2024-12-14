<script setup>
import TextField from '@/components/widgets/TextField.vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { computed } from 'vue'

const doodleWork = doodleWorkStore()

const readonlyFields = ['UE_version']

const displayFields = computed(() => {
  return doodleWork.state.doodleWorkSetting
})
doodleWork.actions.getWorkSetting()
const readUEVersion = path => {
  const fs = require('fs')
  const vision_file = `${path}\\Engine\\Binaries\\Win64\\UnrealEditor.version`
  if (fs.existsSync(vision_file)) {
    const data = fs.readFileSync(vision_file, 'utf8')
    const jsonObject = JSON.parse(data)
    return `${jsonObject['MajorVersion']}.${jsonObject['MinorVersion']}`
  }
  return ''
}

const onTextChange = (val, key) => {
  if (key === 'UE_path') {
    doodleWork.state.doodleWorkSetting['UE_version'] = readUEVersion(
      val.target.value
    )
  }
}
const textPlaceholder = (val, key) => {
  if (key === 'UE_path') return '请输入UE路径例：D:\\EpicGame\\UE_5.5'
  else return String(val)
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
        <div class="has-text-right">
          <a
            :class="{
              button: true,
              'is-primary': true
            }"
            @click="doodleWork.actions.setWorkSetting"
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
