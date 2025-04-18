<script setup>
import { ref, reactive, computed } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import ImageUpdateCell from '@/components/cells/imageUpdateCell.vue'

const tabs = ['txt2Picture', 'txt2Video', 'picture2Video']
const inputCount = 5
const isOpenNegative = ref(false)

const currentTab = ref('txt2Picture')
const currentTabContent = computed(() => {
  let temp = null
  switch (currentTab.value) {
    case 'txt2Picture':
      temp = txt2PInput
      break
    case 'txt2Video':
      temp = txt2VInput
      break
    case 'picture2Video':
      temp = picture2VInput
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
  config: [
    {
      value: '5s',
      options: [
        { value: '5s', label: '5s' },
        { value: '10s', label: '10s' }
      ]
    },
    {
      value: '16:9',
      options: [
        { value: '16:9', label: '16:9' },
        { value: '9:16', label: '9:16' },
        { value: '1:1', label: '1:1' }
      ]
    },
    {
      value: 0.5,
      max: 1,
      min: 0,
      visible: false
    }
  ]
})
const picture2VInput = reactive({
  input: '',
  negativeInput: '',
  isOpenNegative: false,
  picture: {
    1: null,
    2: null,
    3: null,
    4: null
  },
  config: [
    {
      value: '5s',
      options: [
        { value: '5s', label: '5s' },
        { value: '10s', label: '10s' }
      ]
    },
    {
      value: '16:9',
      options: [
        { value: '16:9', label: '16:9' },
        { value: '9:16', label: '9:16' },
        { value: '1:1', label: '1:1' }
      ]
    },
    {
      value: 0.5,
      max: 1,
      min: 0,
      visible: false
    }
  ]
})

function onInput() {}

function handleInputKeyDown() {}
</script>

<template>
  <div class="ai-painting">
    <div class="ai-painting-layout">
      <el-container class="ai-painting-layout">
        <el-aside class="ai-aside">
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
          <div class="ai-painting-txt2p">
            <div
              class="ai-painting-image"
              v-if="currentTab === 'picture2Video'"
            >
              <div class="ai-painting-image-item">
                <image-update-cell />
                <image-update-cell />
              </div>
              <div class="ai-painting-image-item">
                <image-update-cell />
                <image-update-cell />
              </div>
            </div>
            <div class="ai-painting-describe-title">
              <div class="ai-painting-describe-title"></div>
            </div>
            <div class="ai-painting-describe-content">
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
            <div
              class="ai-painting-negative-describe-title"
              v-if="currentTab !== 'txt2Picture'"
            >
              不希望呈现的内容(非必填)
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
              class="ai-painting-describe-content"
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
            <div class="ai-painting-config">
              <div
                class="ai-painting-config"
                :key="index"
                v-for="(config, index) in currentTabContent.config"
              >
                <el-select
                  v-model="config.value"
                  placeholder="Select"
                  size="mini"
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
                    step="0.05"
                    v-model="config.value"
                  />
                  <template #reference>
                    <el-button>创意相关{{ config.value }}</el-button>
                  </template>
                </el-popover>
              </div>
            </div>
          </div>
          <div class="ai-painting-generate">
            <el-button>生成</el-button>
          </div>
        </el-aside>
        <el-main class="main-content">Main</el-main>
      </el-container>
    </div>
    <!--iframe class="content" src="http://127.0.0.1:7860/" /-->
  </div>
</template>

<style scoped lang="scss">
.ai-painting {
  width: 100%;
  max-height: calc(100vh - 160px);
  height: calc(100vh - 160px);
}

.ai-painting-layout {
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
  background: #5a4646;
}

.ai-painting-image {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  padding: 4px;
  gap: 5px;
  border: 1px solid rgba(204, 203, 203, 0.42);
  border-radius: 5px;
}

.ai-painting-image-item {
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

.ai-painting-txt2p {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-painting-describe {
  display: flex;
}

.ai-painting-negative-describe-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.ai-painting-describe-content {
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

.ai-painting-config {
  display: flex;
  gap: 10px;
}

.ai-painting-generate {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 2em;
}

.ai-painting-slider {
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
</style>
