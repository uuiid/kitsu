<script setup>
import { ref, onMounted } from 'vue'

const myIframe = ref()
const connectionStatus = ref(false)
onMounted(() => {
  checkConnection()
  // setInterval(() => {
  //   if (!connectionStatus.value) {
  //     checkConnection()
  //   }
  // })
})

async function checkConnection() {
  try {
    // 使用fetch检测连接
    await fetch('http://127.0.0.1:7860/?__theme=dark', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store'
    })

    connectionStatus.value = true
  } catch (error) {
    connectionStatus.value = false
  }
}
</script>

<template>
  <iframe
    ref="myIframe"
    style="height: 100%; width: 100%"
    src="http://127.0.0.1:7860/?__theme=dark"
    v-if="connectionStatus"
  />
</template>

<style scoped lang="scss"></style>
