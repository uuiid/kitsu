<template>
  <div class="timer">
    <span v-if="!task.run_time_info || task.run_time_info?.length === 0"
      >{{ time }}
    </span>
    <el-popover placement="right" :width="690" trigger="click" v-else>
      <template #reference>
        <span style="margin-right: 16px">{{ time }}</span>
      </template>
      <el-table :data="time_info" style="width: 100%">
        <el-table-column width="120" property="start_time" label="开始时间" />
        <el-table-column width="120" property="end_time" label="结束时间" />
        <el-table-column width="120" property="run_time" label="运行时间" />
        <el-table-column width="300" property="info" label="详情" />
      </el-table>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch, onMounted, computed } from 'vue'
import { doodleWorkStore } from '@/store/modules/doodlework.js'

const doodleWork = doodleWorkStore()
const props = defineProps(['task'])
// 定义响应式数据
const time = ref('00:00:00') // 计时器的时间（秒）
let interval = null // 用于存储 setInterval 的引用
const time_info = computed(() => {
  const temp = []
  if (props.task.run_time_info) {
    props.task.run_time_info.forEach(item => {
      const start_time = new Date(item.start_time)
      const end_time = new Date(item.end_time)
      temp.push({
        start_time: item.start_time,
        end_time: item.end_time,
        run_time: doodleWork.actions.formatDiffTime(end_time - start_time), // end_time - start_time,
        info: item.info
      })
    })
  }
  return temp
})

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
      if (props.task.run_time_info?.length > 0) {
        let all_time = 0
        props.task.run_time_info.forEach(item => {
          if (item) {
            const start_time = new Date(item.start_time)
            const end_time = new Date(item.end_time)
            all_time += end_time - start_time
          }
        })
        time.value = doodleWork.actions.formatDiffTime(all_time)
      }
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
  min-width: 50px;
  max-width: 50px;
}
</style>
