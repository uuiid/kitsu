<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import ImageUpdateCell from '@/components/cells/ImageUpdateCell.vue'
import { AiScriptStore } from '@/store/modules/AiScript.js'
import AiVideoCell from '@/components/cells/AiVideoCell.vue'

const tabs = ['txt2Video', 'image2Video']
const inputCount = 5
const isOpenNegative = ref(false)
const AiSpcript = AiScriptStore()
const dragging = ref(false)
const dragStartX = ref(0)
const leftPanelWidth = ref(300)
const startLeftWidth = ref(300)
const rightPanelWidth = ref(window.innerWidth - leftPanelWidth.value - 10)
const currentTab = ref('txt2Video')
const currentTabContent = computed(() => {
  let temp = null
  switch (currentTab.value) {
    case 'txt2image':
      temp = txt2PInput
      break
    case 'txt2Video':
      temp = txt2VInput
      break
    case 'image2Video':
      temp = image2VInput
      break
  }
  return temp
})
const txt2PInput = reactive({
  input: '',
  negativeInput: '',
  config: [
    {
      value: '9:16',
      options: [
        { value: '1:1', label: '1:1' },
        { value: '16:9', label: '16:9' },
        { value: '4:3', label: '4:3' },
        { value: '9:16', label: '9:16' }
      ]
    },
    {
      value: '1',
      options: [
        {
          value: '1',
          label: '1张'
        },
        {
          value: '2',
          label: '2张'
        },
        {
          value: '3',
          label: '3张'
        },
        {
          value: '4',
          label: '4张'
        }
      ]
    }
  ]
})
const txt2VInput = reactive({
  input: '',
  negativeInput: '',
  isOpenNegative: false,
  config: {
    duration: {
      value: '5s',
      options: [
        { value: '5s', label: '5s' },
        { value: '10s', label: '10s' }
      ]
    },
    aspect_ratio: {
      value: '16:9',
      options: [
        { value: '16:9', label: '16:9' },
        { value: '9:16', label: '9:16' },
        { value: '1:1', label: '1:1' }
      ]
    },
    cfg_scale: {
      value: 0.5,
      max: 1,
      min: 0,
      visible: false
    }
  }
})
const image2VInput = reactive({
  input: '',
  negativeInput: '',
  isOpenNegative: false,
  image: {
    1: null,
    2: null,
    3: null,
    4: null
  },
  config: {
    duration: {
      value: '5s',
      options: [
        { value: '5s', label: '5s' },
        { value: '10s', label: '10s' }
      ]
    },
    aspect_ratio: {
      value: '16:9',
      options: [
        { value: '16:9', label: '16:9' },
        { value: '9:16', label: '9:16' },
        { value: '1:1', label: '1:1' }
      ]
    }
  }
})
const numbers = computed(() => {
  const result = []
  for (let i = 1; i <= 85; i += 1) {
    result.push(i)
  }
  return result
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  rightPanelWidth.value = window.innerWidth - leftPanelWidth.value - 10
}

function onInput() {}

function handleInputKeyDown() {}

function onMouseDown(event) {
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  dragStartX.value = event.clientX
  dragging.value = true
  startLeftWidth.value = leftPanelWidth.value
}

function onMouseMove(event) {
  if (dragging.value) {
    const delta = event.clientX - dragStartX.value
    leftPanelWidth.value = startLeftWidth.value + delta
    rightPanelWidth.value = window.innerWidth - leftPanelWidth.value - 10 // 10 是分隔条的宽度
  }
}

function onMouseUp() {
  dragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

async function onGenerate() {
  switch (currentTab.value) {
    case 'txt2Video':
      console.log(currentTab.value)
      await AiSpcript.action.txt2video({
        model_name: 'kling-v1-6',
        prompt: txt2VInput.input,
        negative_prompt: txt2VInput.negativeInput,
        cfg_scale: txt2VInput.config.cfg_scale.value,
        duration: txt2VInput.config.duration.value,
        aspect_ratio: txt2VInput.config.aspect_ratio.value
      })
      break
    case 'image2Video':
      console.log(currentTab.value)
      AiSpcript.action.txt2video(currentTab.value)
      break
  }
}
</script>

<template>
  <div class="ai-video">
    <div class="ai-video-layout">
      <el-container class="ai-video-layout">
        <el-aside class="ai-aside" :style="{ width: leftPanelWidth + 'px' }">
          <div class="ai-tabs">
            <div
              class="ai-tab-item"
              v-for="tab in tabs"
              :key="tab"
              @click="currentTab = tab"
            >
              <span> {{ $t(`ai_painting.${tab}`) }} </span>
              <div
                :class="{
                  'ai-select-tab': currentTab === tab
                }"
                style="height: 2px"
              ></div>
            </div>
          </div>
          <div class="ai-video-txt2p">
            <div class="ai-video-image" v-if="currentTab === 'image2Video'">
              <div class="ai-video-image-item">
                <image-update-cell />
                <!--image-update-cell />
              </div>
              <div class="ai-video-image-item">
                <image-update-cell />
                <image-update-cell /-->
              </div>
            </div>
            <div class="ai-video-describe">
              <div class="ai-video-describe-title">
                <div class="ai-video-describe-title">
                  <div>
                    <span> 创意描述 </span>
                    <span style="color: rgba(255, 255, 255, 0.4)">
                      (必填)
                    </span>
                  </div>
                </div>
              </div>
              <div class="ai-video-describe-content">
                <textarea
                  ref="inputRef"
                  class="ai-input"
                  :rows="inputCount"
                  v-model="currentTabContent.input"
                  placeholder="给我点创作提示吧"
                  @input="onInput"
                  @keydown="handleInputKeyDown"
                />
              </div>
            </div>
            <div class="ai-video-describe" v-if="currentTab !== 'txt2image'">
              <div class="ai-video-negative-describe-title">
                <div>
                  <span> 不希望呈现的内容 </span>
                  <span style="color: rgba(255, 255, 255, 0.4)">
                    (非必填)
                  </span>
                </div>
                <chevron-right
                  class="lucide-icon"
                  v-if="isOpenNegative"
                  @click.stop="isOpenNegative = false"
                ></chevron-right>
                <chevron-down
                  class="lucide-icon"
                  @click.stop="isOpenNegative = true"
                  v-else
                ></chevron-down>
              </div>
              <div
                class="ai-video-describe-content"
                v-if="!isOpenNegative && currentTab !== 'txt2image'"
              >
                <textarea
                  ref="inputRef"
                  class="ai-input"
                  :rows="inputCount"
                  v-model="currentTabContent.negativeInput"
                  placeholder="给我点创作提示吧"
                  @input="onInput"
                  @keydown="handleInputKeyDown"
                />
              </div>
            </div>

            <div class="ai-video-config">
              <div
                class="ai-video-config"
                :key="index"
                v-for="(config, index) in currentTabContent.config"
              >
                <el-select
                  v-model="config.value"
                  placeholder="Select"
                  size="default"
                  style="width: 100px"
                  v-if="config.options"
                >
                  <el-option
                    v-for="item in config.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <el-popover placement="top" trigger="click" v-else>
                  <el-slider
                    :max="config.max"
                    :min="config.min"
                    :step="0.05"
                    v-model="config.value"
                  />
                  <template #reference>
                    <el-button>创意相关{{ config.value }}</el-button>
                  </template>
                </el-popover>
              </div>
            </div>
          </div>
          <div class="ai-video-generate">
            <el-button @click="onGenerate">生成</el-button>
          </div>
        </el-aside>
        <div class="main-content-separator" @mousedown="onMouseDown"></div>
        <el-main
          class="main-content"
          :style="{ width: rightPanelWidth + 'px' }"
        >
          <div class="main-content">
            <div class="video-list">
              <div class="video-item" :key="number" v-for="number in numbers">
                <div class="video-preview">
                  <ai-video-cell
                    :src="`http://127.0.0.1:5000/video/21344-重生八零成为村首富的美艳妻/${number}`"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-main>
      </el-container>
    </div>
    <!--iframe class="content" src="http://127.0.0.1:7860/" /-->
  </div>
</template>

<style scoped lang="scss">
.ai-video {
  width: 100%;
  max-height: calc(100vh - 160px);
  height: calc(100vh - 160px);
}

.ai-video-layout {
  height: 100%;
  width: 100%;
}

.ai-aside {
  display: flex;
  flex-direction: column;
  width: 30%;
  padding-right: 1em;
}

.main-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
}

.dark {
  .main-content {
    background: #25272b;
  }
}

.video-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.video-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280px;
  height: 200px;
  border-radius: 8px;
}

.video-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280px;
  height: 200px;
  background: #000000;
  border-radius: 8px;
}

.main-content-separator {
  width: 2px;
  cursor: ew-resize;
  background-color: #cccccc;
  position: relative;
  z-index: 10;
  margin-right: 10px;
}

.dark {
  .main-content-separator {
    background-color: #6a6a6a;
  }
}

.ai-video-image {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  padding: 4px;
  gap: 5px;
  border: 1px solid rgba(204, 203, 203, 0.42);
  border-radius: 5px;
}

.ai-video-image-item {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.ai-tabs {
  display: flex;
  flex-direction: row;
  gap: 20px;
  height: 30px;
}

.ai-tab-item {
  font-size: 16px;

  &:hover {
    cursor: pointer;
  }
}

.lucide-icon {
  cursor: pointer;

  &:hover {
    color: #6bacea;
  }
}

.ai-select-tab {
  background: #6bacea;
}

.ai-video-txt2p {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-video-describe {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ai-video-negative-describe-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.ai-video-describe-content {
  border: #6bacea solid 1px;
  border-radius: 5px;
}

.ai-input {
  width: 100%;
  font-size: 1.2em;
  background: transparent;
  resize: none;
  overflow: auto;
  padding: 0.5em;
}

.fixed-resize {
  max-width: 200px;
  max-height: 180px;
  width: auto;
  height: auto;
}

.ai-video-config {
  display: flex;
  gap: 10px;
}

.ai-video-generate {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 2em;
}

.ai-video-slider {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.1em 0.5em 0.1em 0.2em;
  border: 1px solid #6bacea;
  border-radius: 5px;

  &:hover {
    border: 1px solid #6bacea;
  }
}

.auto-resize {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}
</style>
