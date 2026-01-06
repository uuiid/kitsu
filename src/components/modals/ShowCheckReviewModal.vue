<script setup>
import VideoPreview from '@/components/widgets/VideoPreview.vue'
import { updateTaskFilesStore } from '@/store/modules/updatetaskfiles.js'
defineProps({
  pagedAssets: {
    type: Array,
    default: () => []
  }
})
const updateTaskFiles = updateTaskFilesStore()
</script>

<template>
  <div
    :class="{
      modal: true,
      'is-active': updateTaskFiles.state.isShowCheckReviewModal
    }"
  >
    <div
      class="modal-background"
      @click="updateTaskFiles.state.isShowCheckReviewModal = false"
    ></div>
    <div class="modal-content">
      <div class="box">
        <h1 class="title">
          {{ $t('doodle.video_inspection_for_review') }}
        </h1>
        <div class="list-body">
          <ul class="items">
            <li
              class="item flexcolumn"
              :key="entity.id"
              v-for="entity in pagedAssets"
              :style="`border: 5px solid ${entity.exist ? 'transparent' : 'red'};`"
            >
              <div class="card" :draggable="true">
                <video-preview
                  :ref="entity.id"
                  :empty-height="200"
                  :empty-width="250"
                  :height="200"
                  :width="250"
                  :entity="entity"
                  :preview-file-id="entity.id"
                  :is-video="true"
                  is-rounded-top-border
                />
                <div class="item-description flexrow">
                  <div class="entity-name">
                    {{ entity.label }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-content {
  width: 80%;
}
.list-body {
  height: 90%;
  overflow: auto;
  //border: thick dotted #ff0000;
}
.items {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  //height: 100%;
  //overflow: auto;
}
.error-border {
  border-color: red;
}
.item {
  background-color: var(--background);
  border-radius: 1em;
  transition: border-color 0.2s ease-in-out;
  cursor: pointer;
  //max-height: 142px;

  &:hover {
    border-color: var(--background-selectable);
  }

  &.selected-item {
    border-color: var(--background-selected);
  }

  .card {
    border-radius: inherit;
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.1);

    .dark & {
      background-color: var(--background-alt);
    }
  }

  .item-description {
    color: var(--text-strong);
    font-size: 0.9em;
    font-weight: bold;
    white-space: nowrap;
    //max-width: 140px;
    //min-width: 140px;
    padding: 0.5em;

    .entity-name {
      margin-left: auto;
      margin-right: auto;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
