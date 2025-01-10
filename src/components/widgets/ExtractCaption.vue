<script setup>
import { computed, ref, watchEffect } from 'vue'
//import { getCurrentInstance } from 'vue'
import mammoth from 'mammoth'
import { doodleWorkStore } from '@/store/modules/doodlework.js'
import TableList from '@/components/lists/TableList.vue'
import { ElMessage, ElNotification } from 'element-plus'

//const _this = getCurrentInstance().appContext.config.globalProperties
const doodleWork = doodleWorkStore()
const props = defineProps(['name', 'isDrop'])
doodleWork.state.currentDoodleWorkType = props.name
const dialogFormVisible = ref(false)
const isDragOver = ref(false)
// const onQuantityChange = event => {
//   console.log('onQuantityChange', event)
//   doodleWork.actions.setWorkSetting()
// }
setInterval(() => {
  if (doodleWork.doodleWorkStateMap.get('提取字幕').isReload) {
    for (const [key, item] of doodleWork.doodleWorkStateMap.get('提取字幕')
      .workList) {
      console.log(key)
      if (item.status === 'waiting') {
        extractCaption(item)
        item.status = 'completed'
      }
    }
  }
  doodleWork.doodleWorkStateMap.get('提取字幕').isReload = false
}, 1000)

const onAction = async (action_name, task) => {
  if (action_name === 'remove-task') {
    doodleWork.currentDoodleWorkState.workList.delete(task.id)
    ElMessage({
      message: '移除成功',
      type: 'success',
      duration: 1000
    })
  } else if (action_name === 'cancel-task') {
    try {
      await doodleWork.actions.cancelDoodleWorkTask(task)
      ElMessage({
        message: '移除成功',
        type: 'success'
      })
    } catch (e) {
      ElMessage.error('移除失败')
    }
  }
}

const getDateFromFile = file => {
  return new Promise(resolve => {
    let data = null
    const reader = new FileReader()
    reader.onload = () => {
      data = reader.result
    }
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      resolve(data)
    }
  })
}

const extractCaption = async task => {
  const data = await getDateFromFile(task.file)
  const result = await mammoth.extractRawText({ arrayBuffer: data })
  const regex = /(.+?[:|：].+?)$/gm
  const regexRemove = /^(第\d+集：|人物：).*?\n/gm
  const cleanedText = result.value.replace(regexRemove, '')
  const extract_captions = cleanedText.match(regex)
  task.extract_captions = extract_captions
  const final_extract_captions = []
  for (let extract_caption of extract_captions) {
    extract_caption = removeAllPunctuationMarks(extract_caption)
    extract_caption = removeBracketedContent(extract_caption)
    extract_caption = removeBeforeColonContent(extract_caption)
    const sub_extract_captions = cutContent(extract_caption)
    final_extract_captions.push(...sub_extract_captions)
  }
}

const removeLastBlankSpace = text => {
  return text.replace(/\s+$/gm, '')
}

const removeAllPunctuationMarks = text => {
  if (doodleWork.currentDoodleWorkState.task_data_filed.get(1)?.checked) {
    const temp = text.replace(/([^\u4e00-\u9fa5()（）：:a-zA-Z0-9_])/gm, ' ')
    return removeLastBlankSpace(temp)
  }
  return text
}
const removeBracketedContent = text => {
  if (doodleWork.currentDoodleWorkState.task_data_filed.get(2).checked) {
    return text.replace(/([(|（].*?[)|）])/gm, '')
  }
  return text
}
const removeBeforeColonContent = text => {
  if (doodleWork.currentDoodleWorkState.task_data_filed.get(3)?.checked) {
    return text.replace(/(.*?[：|:])/gm, '')
  }
  return text
}

const cutContent = text => {
  if (
    doodleWork.currentDoodleWorkState.task_data_filed.get(4)?.checked &&
    doodleWork.currentDoodleWorkState.task_data_filed.get(5)?.number <
      text.length
  ) {
    const step = doodleWork.currentDoodleWorkState.task_data_filed.get(5).number
    const temp = []
    for (let i = 0; i < text.length; i += step) {
      const temp_text = text.slice(i, i + step)
      temp.push(removeLastBlankSpace(temp_text))
    }
    return temp
  }
  removeLastBlankSpace(text)
  return [text]
}

// const addFiles = files => {
//   doodleWork.currentDoodleWorkState.addFilesData(files)
// }
const formatTime = seconds => {
  const date = new Date(0)
  date.setSeconds(seconds)
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const secs = String(date.getUTCSeconds()).padStart(2, '0')
  const millis = String(date.getUTCMilliseconds()).padStart(3, '0')
  return `${hours}:${minutes}:${secs},${millis}`
}

const generateSRTContent = subtitles => {
  return subtitles
    .map((subtitle, index) => {
      const { startTime, endTime, text } = subtitle
      return `${index + 1}
${formatTime(startTime)} --> ${formatTime(endTime)}
${text}\n`
    })
    .join('\n')
}

const onSubmit = () => {
  const fs = require('fs')
  for (const task of [...doodleWork.currentDoodleWorkState.workList.values()]) {
    const final_extract_captions = []
    let seconds = 0
    for (let extract_caption of task.extract_captions) {
      extract_caption = removeAllPunctuationMarks(extract_caption)
      extract_caption = removeBracketedContent(extract_caption)
      extract_caption = removeBeforeColonContent(extract_caption)
      const sub_extract_captions = cutContent(extract_caption)
      for (const sub_extract_caption of sub_extract_captions) {
        final_extract_captions.push({
          startTime: seconds,
          endTime: seconds + 3,
          text: sub_extract_caption
        })
        seconds += 3
      }
    }
    const srtContent = generateSRTContent(final_extract_captions)
    if (doodleWork.state.outPath === '') {
      dialogFormVisible.value = true
      return
    } else {
      const fileName = task.file.name.split('.')[0]
      const timestamp = Date.now()
      const filePath = `${doodleWork.state.outPath}/${fileName}-${timestamp.toString()}.srt`
      fs.writeFileSync(filePath, srtContent)
    }
  }
  ElNotification({
    title: '导出成功',
    message: '路径：' + doodleWork.state.outPath,
    type: 'success'
  })
}
const disPlayTaskDataFiled = computed(() => {
  if (doodleWork.currentDoodleWorkState) {
    if (doodleWork.currentDoodleWorkState.task_data_filed) {
      return doodleWork.currentDoodleWorkState.task_data_filed
    }
  }
  return []
})
const handleDragOver = event => {
  event.preventDefault()
  if (!isDragOver.value) {
    isDragOver.value = true
    if (props.isDrop) {
      event.dataTransfer.dropEffect = 'none'
    } else {
      event.dataTransfer.dropEffect = 'copy'
    }
  }
}
const onDrop = event => {
  event.preventDefault()
  doodleWork.state.isActiveModal = true
  isDragOver.value = false
  const files = event.dataTransfer.files
  doodleWork.currentDoodleWorkState.addFilesData(files)
}
const onSetOutPath = () => {
  dialogFormVisible.value = false
  onSubmit()
}

watchEffect(() => {})
</script>

<template>
  <div class="datatable-main" @drop="onDrop" @dragover="handleDragOver">
    <div class="interval">
      <div
        class="project-list"
        :key="key"
        v-for="(taskData, key) in disPlayTaskDataFiled"
      >
        <div class="project-list-item" v-if="taskData[1].type === Boolean">
          <input
            class="input-checkbox"
            type="checkbox"
            v-model="taskData[1].checked"
            @click="
              console.log(doodleWork.currentDoodleWorkState.task_data_filed)
            "
          />
          <span
            class="input-checkbox-text"
            @click="taskData[1].checked = !taskData[1].checked"
            >{{ taskData[1].name }}</span
          >
        </div>
        <div
          class="project-list-item"
          v-else-if="taskData[1].type === Number"
          v-show="
            doodleWork.currentDoodleWorkState.task_data_filed.get(
              taskData[1].parent_id
            )?.checked
          "
        >
          <input
            class="input"
            type="number"
            v-model="taskData[1].number"
            @click="
              console.log(doodleWork.currentDoodleWorkState.task_data_filed)
            "
          />
          <span>{{ taskData[1].name }}</span>
        </div>
      </div>
    </div>
    <table-list
      :table-header-filed="doodleWork.currentDoodleWorkState.tableHeaderFiled"
      :body-list="doodleWork.currentDoodleWorkState.workList"
      name="导出"
      :is-drop="false"
      :is-show-view-log="false"
      :is-show-submit="true"
      @add-data="doodleWork.currentDoodleWorkState.addFilesData"
      @handle-action="onAction"
      @submit="onSubmit"
    ></table-list>
  </div>
  <el-dialog v-model="dialogFormVisible" title="设置导出路径" width="500">
    <el-form>
      <el-form-item label="导出路径" :label-width="formLabelWidth">
        <el-input v-model="doodleWork.state.outPath" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">退出</el-button>
        <el-button type="primary" @click="onSetOutPath"> 确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.datatable-main {
  display: flex;
  flex-direction: column;
  padding: 2em;
  border-radius: 5px;
  max-height: 100%;
  overflow: auto;
  margin-bottom: 1rem;
}

.settings {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 0.5em;
}

input[type='number'] {
  -moz-appearance: textfield;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.settings-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
}

.input {
  max-width: 100px;
  max-height: 30px;
}

.input-checkbox-text {
  cursor: pointer;
  user-select: none;
}

.interval {
  display: flex;
  flex-direction: row;
  gap: 2em;
  margin-bottom: 10px;
}

.project-list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.input-checkbox {
  height: 30px;
}

.dark {
  .input-checkbox {
    height: 30px;
  }
}
</style>
