<script setup>
import { ref } from 'vue'
import AiImageAction from '@/components/cells/AiImageAction.vue'
import { InfoFilled } from '@element-plus/icons-vue'

const emit = defineEmits(['add-one-asset', 'add-ten-asset', 'show-info'])

defineProps({
  src: {
    type: String,
    default: ''
  },
  isShow: {
    type: Boolean,
    default: true
  },
  imageWidth: {
    type: Number,
    default: 93
  },
  imageHeight: {
    type: Number,
    default: 93
  },
  addOneTxt: {
    type: String,
    default: '+1'
  },
  addTenTxt: {
    type: String,
    default: '+10'
  }
})
const isShowActon = ref(false)
</script>

<template>
  <div
    class="image-cell"
    @mouseenter="src !== '' ? (isShowActon = true) : false"
    @mouseleave="isShowActon = false"
    :style="`max-height: ${imageHeight}px;min-height: ${imageWidth}px;`"
  >
    <ai-image-action
      v-if="isShowActon && src !== '' && isShow"
      @remove="src === ''"
      :style="`width:${imageWidth}px;height:${imageHeight}px;border-radius: 5px;`"
    >
      <template #action>
        <el-icon
          class="action-icon"
          size="15"
          color="#6bacea"
          :title="addOneTxt"
          @click.stop="emit('add-one-asset')"
        >
          {{ addOneTxt }}
        </el-icon>
        <el-icon
          class="action-icon"
          size="15"
          color="#6bacea"
          title="详情"
          @click.stop="emit('show-info')"
        >
          <info-filled />
        </el-icon>
        <el-icon
          class="action-icon"
          size="15"
          :title="addTenTxt"
          color="#6bacea"
          @click.stop="emit('add-ten-asset')"
        >
          {{ addTenTxt }}
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
