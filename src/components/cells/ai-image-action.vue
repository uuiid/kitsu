<script setup>
import { Trash2 } from 'lucide-vue-next'

defineEmits(['remove'])
</script>

<template>
  <div class="cell">
    <span class="image-action">
      <el-icon color="#6bacea"
        ><trash-2 @click.stop="$emit('remove')"
      /></el-icon>
    </span>
  </div>
</template>

<style scoped lang="scss">
.call {
  position: absolute;
  width: 100%;
  height: 100%;
}

.image-action {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
</style>
