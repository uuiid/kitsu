<template>
  <div class="timer">
    {{ time }}
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch, onMounted } from 'vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'

const doodleWork = doodleWorkStore()
const props = defineProps(['task'])
// 定义响应式数据
const time = ref('00:00:00') // 计时器的时间（秒）
let interval = null // 用于存储 setInterval 的引用

// 格式化时间（将秒转换为 HH:MM:SS）

// 开始计时器
const start = () => {
  interval = setInterval(() => {
    if (props.task.status === 'running') {
      const currentTime = new Date()
      const date = new Date(props.task.run_time)
      time.value = doodleWork.actions.formatDiffTime(currentTime - date)
    } else if (
      ['completed', 'failed', 'canceled'].includes(props.task.status)
    ) {
      clearInterval(interval)
    }
  }, 1000)
}
// 组件卸载时清除计时器
onUnmounted(() => {
  clearInterval(interval)
})
onMounted(() => {
  start()
})
watch(props.task.status, () => {
  console.log('--------')
  if (props.task.status === 'running') {
    start()
  } else if (['completed', 'failed', 'canceled'].includes(props.task.status)) {
    clearInterval(interval)
  }
})
</script>

<style scoped>
.timer {
  text-align: center;
  font-family: Arial, sans-serif;
}
</style>
