<script setup>
import MarkdownIt from 'markdown-it'
import { computed } from 'vue'

const props = defineProps(['content'])
const parsedMarkdown = computed(() => {
  const md = new MarkdownIt()
  return md.render(props.content)
})
</script>

<template>
  <div v-html="parsedMarkdown" class="ai-content"></div>
</template>

<style scoped lang="scss">
.ai-content {
  padding: 0 5px;
  font-size: 18px;
  //width: 100%;
}

:deep(pre) {
  border-radius: 12px;
}
:deep(code) {
  border-radius: 10px;
}
</style>
