<script setup>
import TextField from '@/components/widgets/TextField.vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import { computed, ref, onMounted } from 'vue'
const doodleWork = doodleWorkStore()
const refreshKey = ref(0)
const previewUrl = computed(() => {
  return (
    doodleWork.state.localHttpPath +
    '/api/actions/tools/add-watermark?preview=true&t' +
    new Date().getTime() +
    refreshKey.value
  )
})

const displayFields = computed(() => {
  return doodleWork.currentDoodleWorkState.watermark_setting
})
const textPlaceholder = (val, key) => {
  if (key === 'UE_path') return '请输入UE路径例：D:\\EpicGame\\UE_5.5'
  else return String(val)
}
onMounted(async () => {
  if (
    doodleWork.currentDoodleWorkState.watermark_setting.out_path === undefined
  )
    doodleWork.actions.getWorkSetting()
  refreshKey.value++
})
const onTextChange = (val, key) => {
  if (key === 'watermark_color')
    doodleWork.currentDoodleWorkState.watermark_setting[key] = val
}
async function onSubmit() {
  await doodleWork.actions.previewWatermark()
  refreshKey.value++
}
</script>

<template>
  <div class="field">
    <label class="label">预览</label>
    <el-image
      style="width: 280px; height: 185px"
      :src="previewUrl"
      :zoom-rate="1.2"
      :max-scale="7"
      :preview-src-list="[previewUrl]"
      :min-scale="0.2"
      :initial-index="1000"
      fit="cover"
      preview-teleported
    />
  </div>
  <div
    :key="key"
    v-for="(value, key) in displayFields"
    v-show="!['status', 'name'].includes(key)"
  >
    <text-field
      :type="doodleWork.currentDoodleWorkState.tableHeaderFiled[key]?.type"
      :placeholder="textPlaceholder(value, key)"
      :label="doodleWork.currentDoodleWorkState.tableHeaderFiled[key]?.name"
      :model-value="value"
      v-model="doodleWork.currentDoodleWorkState.watermark_setting[key]"
      @change="val => onTextChange(val, key)"
      v-if="
        ['string', 'number'].includes(
          doodleWork.currentDoodleWorkState.tableHeaderFiled[key]?.type
        )
      "
    />
    <div
      class="field"
      v-if="
        ['color'].includes(
          doodleWork.currentDoodleWorkState.tableHeaderFiled[key]?.type
        )
      "
    >
      <label class="label">{{
        doodleWork.currentDoodleWorkState.tableHeaderFiled[key]?.name
      }}</label>
      <el-color-picker
        v-model="displayFields[key]"
        @change="onTextChange($event, key)"
      />
    </div>
    <div
      class="field"
      v-if="
        ['number_list'].includes(
          doodleWork.currentDoodleWorkState.tableHeaderFiled[key]?.type
        )
      "
    >
      <label class="label">{{
        doodleWork.currentDoodleWorkState.tableHeaderFiled[key]?.name
      }}</label>
      <el-input-number v-model="displayFields[key][0]" />
      <el-input-number v-model="displayFields[key][1]" />
    </div>
  </div>
  <div class="has-text-right">
    <a
      :class="{
        button: true
      }"
      @click="onSubmit"
    >
      预览
    </a>
  </div>
</template>

<style scoped lang="scss">
.field {
  margin-bottom: 15px;
}
</style>
