<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import ImageUpdateCell from '@/components/cells/ImageUpdateCell.vue'
import { AiScriptStore } from '@/store/modules/AiScript.js'
import AiVideoCell from '@/components/cells/AiVideoCell.vue'
import AiImageCell from '@/components/cells/AiImageCell.vue'

const AiScript = AiScriptStore()
const props = defineProps({
  tabs: {
    type: Array,
    default: () => ['txt2Video', 'image2Video']
  },
  isVideo: {
    type: Boolean,
    default: true
  },
  srcList: {
    type: Array,
    default: () => []
  }
})

const tabs = props.tabs
const inputCount = 5
const dragging = ref(false)
const dragStartX = ref(0)
const leftPanelWidth = ref(300)
const startLeftWidth = ref(300)
const rightPanelWidth = ref(window.innerWidth - leftPanelWidth.value - 10)
const currentTab = ref(tabs[0])
const imageInputRef = ref()
const currentTabContent = computed(() => {
  let temp = null
  switch (currentTab.value) {
    case 'txt2Picture':
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
  config: {
    aspect_ratio: {
      value: '288*512',
      options: [
        { value: '512*512', label: '1:1', resolution: '512*512' },
        { value: '512*384', label: '4:3', resolution: '512*384' },
        { value: '384*512', label: '3:4', resolution: '384*512' },
        { value: '512*341', label: '3:2', resolution: '512*341' },
        { value: '341*512', label: '2:3', resolution: '341*512' },
        { value: '512*288', label: '16:9', resolution: '512*288' },
        { value: '288*512', label: '9:16', resolution: '288*512' }
      ]
    }
  }
  // {
  //   value: '1',
  //   options: [
  //     {
  //       value: '1',
  //       label: '1张'
  //     },
  //     {
  //       value: '2',
  //       label: '2张'
  //     },
  //     {
  //       value: '3',
  //       label: '3张'
  //     },
  //     {
  //       value: '4',
  //       label: '4张'
  //     }
  //   ]
  // }
})
const txt2VInput = reactive({
  input: '',
  negativeInput: '',
  isOpenNegative: false,
  config: {
    duration: {
      value: '5s',
      options: [
        { value: '5s', label: '5s' }
        // { value: '10s', label: '10s' }
      ]
    },
    aspect_ratio: {
      value: '16:9',
      options: [
        { value: '16:9', label: '16:9' },
        { value: '9:16', label: '9:16' },
        { value: '4:3', label: '4:3' },
        { value: '3:4', label: '3:4' },
        { value: '1:1', label: '1:1' },
        { value: '21:9', label: '21:9' },
        { value: '9:21', label: '9:21' }
      ]
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
        { value: '5s', label: '5s' }
        // { value: '10s', label: '10s' }
      ]
    },
    aspect_ratio: {
      value: '16:9',
      options: [
        { value: '16:9', label: '16:9' },
        { value: '9:16', label: '9:16' },
        { value: '4:3', label: '4:3' },
        { value: '3:4', label: '3:4' },
        { value: '1:1', label: '1:1' },
        { value: '21:9', label: '21:9' },
        { value: '9:21', label: '9:21' }
      ]
    }
  }
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
    case 'txt2Picture':
      await AiScript.action.txt2image({
        prompt: txt2PInput.input,
        width: parseInt(txt2PInput.config.aspect_ratio.value.split('*')[0], 10),
        height: parseInt(txt2PInput.config.aspect_ratio.value.split('*')[1], 10)
      })
      break
    case 'txt2Video':
      console.log(currentTab.value)
      await AiScript.action.txt2video({
        prompt: txt2VInput.input,
        aspect_ratio: txt2VInput.config.aspect_ratio.value
      })
      break
    case 'image2Video':
      AiScript.action.image2video({
        prompt: image2VInput.input,
        binary_data_base64: [imageInputRef.value.previewSrc.split(',')[1]],
        aspect_ratio: txt2VInput.config.aspect_ratio.value
      })
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
                <image-update-cell ref="imageInputRef" />
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
                <el-input
                  ref="inputRef"
                  class="ai-input"
                  type="textarea"
                  :rows="inputCount"
                  v-model="currentTabContent.input"
                  placeholder="给我点创作提示吧"
                  @input="onInput"
                  @keydown="handleInputKeyDown"
                  maxlength="150"
                  show-word-limit
                />
              </div>
            </div>
            <!--div class="ai-video-describe" v-if="currentTab !== 'txt2Picture'">
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
                v-if="!isOpenNegative && currentTab !== 'txt2Picture'"
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
            </div-->

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
              <div
                class="video-item"
                :key="src"
                v-for="(src, index) in srcList"
              >
                <div class="video-preview" v-if="props.isVideo">
                  <ai-video-cell :src="src" />
                </div>
                <div class="video-preview" v-else>
                  <ai-image-cell
                    class="auto-resize"
                    :src-index="index"
                    :src-list="srcList"
                  ></ai-image-cell>
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
  border: transparent solid 1px;
  border-radius: 5px;
}

.ai-input {
  width: 100%;
  font-size: 1.2em;
  background: transparent;
  resize: none;
  overflow: auto;
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
