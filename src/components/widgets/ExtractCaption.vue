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
const isDragOver = ref(false)
// const onQuantityChange = event => {
//   console.log('onQuantityChange', event)
//   doodleWork.actions.setWorkSetting()
// }
setInterval(() => {
  if (doodleWork.doodleWorkStateMap.get('extract_caption').isReload) {
    for (const [key, item] of doodleWork.doodleWorkStateMap.get(
      'extract_caption'
    ).workList) {
      console.log(key)
      if (item.status === 'waiting') {
        extractCaption(item)
        item.status = 'completed'
      }
    }
  }
  doodleWork.doodleWorkStateMap.get('extract_caption').isReload = false
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
    if (file.path.endsWith('.srt')) {
      reader.readAsText(file, 'UTF-8')
    } else reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      resolve(data)
    }
  })
}

const extractCaption = async task => {
  if (task.file.path.endsWith('srt')) {
    const data = await getDateFromFile(task.file)
    const regex = /\n\s*\n/gm
    const subtitle_blocks = data.split(regex)
    const subtitles = []
    for (const block of subtitle_blocks) {
      const lines = block.split(/\n/gm)
      if (lines.length >= 3) {
        subtitles.push(lines[2])
      }
    }
    task.extract_captions = subtitles
  } else {
    const data = await getDateFromFile(task.file)
    const result = await mammoth.extractRawText({ arrayBuffer: data })
    const regex = /(.+?[:|：].+?)$/gm
    const regexRemove = /^(第\d+集：|人物：).*?\n/gm
    const cleanedText = result.value.replace(regexRemove, '')
    //const extract_captions = cleanedText.match(regex)
    task.extract_captions = cleanedText.match(regex)
    // const final_extract_captions = []
    // for (let extract_caption of extract_captions) {
    //   extract_caption = removeAllPunctuationMarks(extract_caption)
    //   extract_caption = removeBracketedContent(extract_caption)
    //   extract_caption = removeBeforeColonContent(extract_caption)
    //   const sub_extract_captions = cutContent(extract_caption)
    //   final_extract_captions.push(...sub_extract_captions)
    // }
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
    let i = 0
    let j = 0
    while (i < text.length) {
      const text_length = Math.min(step, text.length - i)
      if (text.length - i <= step) {
        temp.push(removeLastBlankSpace(text.slice(i, text.length)))
        break
      }
      let difference = 0
      let temp_text = ''
      if (j > text.length / step) break
      j++
      const regex = /^\p{P}$/gmu
      if (
        text.slice(i + text_length - 1, i + text_length) === ' ' ||
        regex.test(text.slice(i + text_length - 1, i + text_length))
      ) {
        temp_text = text.slice(i, i + text_length)
      } else {
        let forward = 0
        let is_forward = false
        while (forward < text_length) {
          forward += 1
          if (
            text.slice(
              i + text_length - forward - 1,
              i + text_length - forward
            ) === ' ' ||
            regex.test(
              text.slice(
                i + text_length - forward - 1,
                i + text_length - forward
              )
            )
          ) {
            is_forward = true
            break
          }
        }

        let backward = 0
        while (backward < text.length - (i + text_length)) {
          backward += 1
          if (
            text.slice(
              i + text_length + backward - 1,
              i + text_length + backward
            ) === ' ' ||
            regex.test(
              text.slice(
                i + text_length + backward - 1,
                i + text_length + backward
              )
            )
          ) {
            break
          }
        }
        if (is_forward === false || forward > backward) {
          temp_text = text.slice(i, i + text_length + backward)
          difference = backward
        } else {
          temp_text = text.slice(i, i + text_length - forward)
          difference = -forward
        }
      }
      i = i + text_length + difference
      if (temp_text !== '') temp.push(removeLastBlankSpace(temp_text))
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
      doodleWork.state.dialogFormVisible = true
      doodleWork.state.setOutPathCallback = onSubmit
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
const onAddFiles = files => {
  doodleWork.state.isActiveModal = true
  isDragOver.value = false
  doodleWork.currentDoodleWorkState.addFilesData(files)
}
watchEffect(() => {})
</script>

<template>
  <div class="datatable-main">
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
      :is-drop="true"
      :is-show-view-log="false"
      :is-show-submit="true"
      @add-data="onAddFiles"
      @handle-action="onAction"
      @submit="onSubmit"
    ></table-list>
  </div>
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
