<script setup>
import AiVideo from '@/components/widgets/AiVideo.vue'
import { AiScriptStore } from '@/store/modules/AiScript.js'

const aiScript = AiScriptStore()
</script>

<template>
  <div class="ai-painting">
    <div class="ai-painting-layout">
      <el-container class="ai-painting-layout">
        <ai-video
          :tabs="['txt2Picture']"
          :is-video="false"
          :src-list="aiScript.state.receiveImageList"
        ></ai-video>
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

.ai-painting-layout {
  height: 100%;
  width: 100%;
}

.ai-aside {
  display: flex;
  flex-direction: column;
  width: 400px;
  padding-right: 1em;
}

.main-content {
  width: 100%;
  height: 100%;
  background: #5a4646;
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
</style>
