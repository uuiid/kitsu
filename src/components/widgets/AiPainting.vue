<script setup>
import { ref, onMounted } from 'vue'

const myIframe = ref()
const url = ref()
onMounted(async () => {
  let temp = 'http://127.0.0.1:7860/'
  const isLocal = await checkConnection()
  if (!isLocal) temp = 'http://192.168.20.79:7860/'
  console.log(localStorage.getItem('dark-theme'))
  if (localStorage.getItem('dark-theme') === 'true') {
    temp = temp + '?__theme=dark'
  } else {
    temp = temp + '?__theme=light'
  }
  console.log(temp)
  url.value = temp
  // setInterval(() => {
  //   if (!connectionStatus.value) {
  //     checkConnection()
  //   }
  // })
})

async function checkConnection() {
  try {
    // 使用fetch检测连接
    await fetch('http://127.0.0.1:7860/', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store'
    })

    return true
  } catch (error) {
    return false
  }
}
</script>

<template>
  <iframe ref="myIframe" style="height: 100%; width: 100%" :src="url" />
</template>

<style scoped lang="scss"></style>
