<script setup>
defineEmits(['remove'])
import { Trash2 } from 'lucide-vue-next'
</script>

<template>
  <div class="cell">
    <span class="image-action">
      <slot name="action">
        <el-icon class="action-icon" color="#6bacea">
          <trash-2 @click.stop="$emit('remove')" />
        </el-icon>
      </slot>
    </span>
  </div>
</template>

<style scoped lang="scss">
.call {
  width: 100%;
  height: 100%;
}

.image-action {
  position: absolute;
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 5px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.action-icon {
  cursor: pointer;
  color: #6bacea;

  &:hover {
    color: #009dff;
  }
}
</style>
