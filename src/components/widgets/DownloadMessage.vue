<!-- DownloadMessage.vue -->
<template>
  <teleport to="body">
    <Transition name="el-fade-in-linear" :style="`top: ${props.top}px`">
      <div v-if="visible" class="download-message" :class="typeClass">
        <el-icon class="icon">
          <component :is="iconComponent" />
        </el-icon>
        <span class="text">{{ message }}</span>
      </div>
    </Transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import {
  InfoFilled,
  WarningFilled,
  CircleCheckFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  progress: Number,
  type: {
    type: String,
    default: 'info' // 'success', 'warning', 'error'
  },
  messagePrefix: {
    type: String,
    default: '正在下载UE插件'
  },
  top: {
    type: Number,
    default: 60
  }
})

const visible = computed(() => props.modelValue)

const typeClass = computed(() => {
  return `download-message--${props.type}`
})

const iconComponent = computed(() => {
  switch (props.type) {
    case 'success':
      return CircleCheckFilled
    case 'warning':
      return WarningFilled
    case 'error':
      return CircleCloseFilled
    default:
      return InfoFilled
  }
})

const message = computed(() => {
  return `${props.messagePrefix} ${props.progress}%`
})
</script>

<style scoped>
.download-message {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  background: #fefefe;
  border: 1px solid #ebeef5;
  padding: 8px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  z-index: 9999;
  transition: all 0.3s;
}

.download-message .icon {
  margin-right: 10px;
  font-size: 18px;
}

.download-message--info {
  color: #409eff;
  border-color: rgba(64, 158, 255, 0.3);
  background-color: rgba(64, 158, 255, 0.1);
}

.download-message--success {
  color: #67c23a;
  border-color: rgba(103, 194, 58, 0.3);
  background-color: rgba(103, 194, 58, 0.1);
}

.download-message--warning {
  color: #e6a23c;
  border-color: rgba(230, 162, 60, 0.3);
  background-color: rgba(230, 162, 60, 0.1);
}

.download-message--error {
  color: #f56c6c;
  border-color: rgba(245, 108, 108, 0.3);
  background-color: rgba(245, 108, 108, 0.1);
}
</style>
