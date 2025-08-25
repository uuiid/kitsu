<script setup>
import { ref } from 'vue'
import AiImageAction from '@/components/cells/AiImageAction.vue'
import { InfoFilled } from '@element-plus/icons-vue'

const emit = defineEmits(['add-one-asset', 'add-ten-asset', 'show-info'])

defineProps({
  src: {
    type: String,
    default: ''
  }
})
const isShowActon = ref(false)
</script>

<template>
  <div
    class="image-cell"
    @mouseenter="src !== '' ? (isShowActon = true) : false"
    @mouseleave="isShowActon = false"
  >
    <ai-image-action
      v-if="isShowActon && src !== ''"
      @remove="src === ''"
      :style="`width:80px;height:80px;border-radius: 5px;`"
    >
      <template #action>
        <el-icon
          class="action-icon"
          size="15"
          color="#6bacea"
          title="+1"
          @click="emit('add-one-asset')"
        >
          +1
        </el-icon>
        <el-icon
          class="action-icon"
          size="15"
          color="#6bacea"
          title="详情"
          @click="emit('show-info')"
        >
          <info-filled />
        </el-icon>
        <el-icon
          class="action-icon"
          size="15"
          title="+10"
          color="#6bacea"
          @click="emit('add-ten-asset')"
        >
          +10
        </el-icon>
      </template>
    </ai-image-action>
    <img
      class="auto-resize"
      style="width: auto; height: auto"
      alt=""
      :src="src"
    />
    <div>
      <span v-if="src === ''">拖入或点击</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.image-cell {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  max-height: 95px;
  min-height: 95px;
  width: 100%;
  border-radius: 5px 5px 0 0;
  background: var(--background-alt-3);
  user-select: none;
  color: rgba(204, 203, 203, 0.42);
}

.auto-resize {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

.action-icon {
  cursor: pointer;
  color: #95c0ec;

  &:hover {
    color: #009dff;
  }
}
</style>
