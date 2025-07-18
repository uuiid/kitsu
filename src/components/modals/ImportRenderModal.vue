<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box content">
        <h1 class="title">
          {{ $t('main.csv.preview_title') }}
        </h1>

        <p>
          {{ $t('main.csv.preview_required') }}
        </p>
        <div class="description">
          <div v-show="!disableUpdate">
            <h2 class="legend-title">
              {{ $t('main.csv.options.title') }}
            </h2>
            <checkbox
              :toggle="true"
              :label="$t('main.csv.options.update')"
              v-model="updateData"
            />
          </div>
          <h3 class="legend-title">
            {{ $t('main.csv.legend') }}
          </h3>
          <div class="flexrow legends">
            <ul class="legend flexrow-item">
              <li class="legend-definition">
                <span class="legend-term"></span>
                {{ $t('main.csv.legend_ok') }}
              </li>
              <li class="legend-definition">
                <span class="legend-term ignored"></span>
                {{ $t('main.csv.legend_ignored') }}
              </li>
              <li class="legend-definition">
                <span class="legend-term missing"></span>
                {{ $t('main.csv.legend_missing') }}
              </li>
              <li class="legend-definition">
                <span class="legend-term missing-optional"></span>
                {{ $t('main.csv.legend_missing_optional') }}
              </li>
            </ul>
            <ul class="legend flexrow-item">
              <li class="legend-definition">
                <span class="legend-term"></span>
                {{ $t('main.csv.legend_line_ok') }}
              </li>
              <li class="legend-definition">
                <span class="legend-term disabled"></span>
                {{ $t('main.csv.legend_disabled') }}
              </li>
              <li v-show="!disableUpdate" class="legend-definition">
                <span class="legend-term overwrite"></span>
                {{ $t('main.csv.legend_overwrite') }}
              </li>
            </ul>
          </div>
        </div>

        <div class="render-container">
          <table class="render">
            <colgroup>
              <col
                :key="`col-missing-${item}`"
                class="missing"
                v-for="item in columnsRequired"
              />
              <col
                :key="`col-${index}`"
                :class="stateColumn(cell)"
                v-for="(cell, index) in columnSelect"
              />
              <col
                :key="`col-missing-${item}`"
                class="missing-optional"
                v-for="item in columnsOptional"
              />
            </colgroup>
            <thead>
              <tr class="render-headers">
                <th
                  class="required-header"
                  :key="`header-${cell}`"
                  v-for="cell in columnsRequired"
                >
                  {{
                    columnsAllowed.find(
                      item => item.value === cell || item.label === cell
                    )?.label
                  }}
                </th>
                <th
                  :key="`header-${index}`"
                  v-for="(cell, index) in parsedCsv[0]"
                >
                  <div class="render-select">
                    <combobox
                      :options="columnOptions"
                      :value="cell"
                      :error="isDuplicated(index)"
                      v-model="columnSelect[index]"
                      @update:model-value="checkForDuplicate"
                    />
                  </div>
                  {{
                    columnsAllowed.find(
                      item => item.value === cell || item.label === cell
                    )?.label ||
                    cell ||
                    '-'
                  }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                :class="{
                  overwrite: updateData && existingData(index),
                  disabled: !updateData && existingData(index)
                }"
                :key="`line-${index}`"
                v-for="(line, index) in parsedCsv
                  .slice(1)
                  .filter(line => line.length > 1)"
              >
                <td v-for="cell in columnsRequired" :key="`cell-${cell}`">
                  {{ '-' }}
                </td>
                <td v-for="(cell, index) in line" :key="`cell-${index}`">
                  {{ cell || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="render-footer">
          <button-simple
            :text="$t('main.csv.preview_reupload')"
            @click="onReupload"
          />
          <modal-footer
            :error-text="errorText"
            :is-loading="isLoading"
            :is-disabled="formData === undefined"
            :is-error="isError"
            @confirm="onConfirmClicked"
            @cancel="$emit('cancel')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { modalMixin } from '@/components/modals/base_modal'

import Combobox from '@/components/widgets/Combobox.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'import-render-modal',

  mixins: [modalMixin],

  components: {
    ButtonSimple,
    Combobox,
    Checkbox,
    ModalFooter
  },

  emits: ['cancel', 'confirm', 'reupload'],

  data() {
    return {
      duplicates: [],
      formData: null,
      updateData: false,
      columnSelect: []
    }
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },
    parsedCsv: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    dataMatchers: {
      type: Array,
      default: () => []
    },
    database: {
      type: Object,
      default: () => {}
    },
    disableUpdate: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    importError: {
      type: Error,
      default: null
    }
  },

  mounted() {
    this.formData = null
  },

  computed: {
    ...mapGetters([
      'assetMetadataDescriptors',
      'shotMetadataDescriptors',
      'editMetadataDescriptors',
      'productionAssetTypeOptions',
      'currentProduction',
      'productionAssetTaskTypes'
    ]),
    columnsRequired() {
      if (this.parsedCsv.length !== 0) {
        return this.columns.filter(item => {
          return (
            !this.columnSelect.includes(item) &&
            this.dataMatchers.includes(item)
          )
        })
      } else {
        return []
      }
    },

    columnsOptional() {
      console.log(this.columnSelect)
      if (this.parsedCsv.length !== 0) {
        return this.columns.filter(item => {
          return (
            !this.columnSelect.includes(item) &&
            !this.dataMatchers.includes(item)
          )
        })
      } else {
        return []
      }
    },

    metadataDescriptors() {
      if (this.$route.path.indexOf('assets') > 0) {
        return this.assetMetadataDescriptors
      }
      if (this.$route.path.indexOf('shots') > 0) {
        return this.shotMetadataDescriptors
      }
      if (this.$route.path.indexOf('edits') > 0) {
        return this.editMetadataDescriptors
      }
      return []
    },

    columnsAllowed() {
      const list = [
        {
          label: '类型',
          value: 'asset_type_name'
        },
        {
          label: '名称',
          value: 'name'
        },
        {
          label: '说明',
          value: 'description'
        }
      ]
      this.metadataDescriptors.forEach(item => {
        if (!list.includes(item.name)) {
          list.push({ label: item.name, value: item.field_name })
        }
      })
      this.productionAssetTaskTypes.forEach(item => {
        if (!list.includes(item.name)) {
          list.push({ label: item.name, value: item.id, task: 'task' })
        }
      })
      return list
    },

    columnOptions() {
      const options = [
        {
          label: this.$t('main.csv.choose'),
          value: this.$t('main.csv.unknown')
        }
      ]
      this.columnsAllowed.forEach(item => {
        options.push({ label: item.label, value: item.value })
      })
      console.log(options)
      return options
    },

    indexMatchers() {
      const indexes = []
      this.dataMatchers.forEach(item => {
        indexes.push(this.parsedCsv[0].indexOf(item))
      })
      return indexes
    },

    errorText() {
      let text = this.$t('main.csv.error_upload')
      if (this.importError && this.importError.status === 400) {
        const res = this.importError.response
        text += ` (line: ${res.body.line_number}) ${res.body.message}`
      }
      return text
    }
  },

  methods: {
    onConfirmClicked() {
      const all_data = []
      const error_data = []
      for (let i = 1; i < this.parsedCsv.length; i++) {
        const data = {}
        data['project_id'] = this.currentProduction.id
        data['is_shared'] = false
        let isError = false
        for (let j = 0; j < this.columnSelect.length; j++) {
          if (this.columnSelect[j] !== this.$t('main.csv.unknown')) {
            if (
              this.columnSelect[j]?.length === 36 &&
              this.productionAssetTaskTypes.find(
                item => item.id === this.columnSelect[j]
              )
            ) {
              if (this.parsedCsv[i][j] === 'todo') {
                if (data.asset_task_type_ids === undefined) {
                  data['asset_task_type_ids'] = []
                }
                data['asset_task_type_ids'].push(this.columnSelect[j])
              }
            } else {
              if (this.columnSelect[j] === 'asset_type_name') {
                const value = this.productionAssetTypeOptions.find(
                  item => item.label === this.parsedCsv[i][j]
                )
                if (value) {
                  data['entity_type_id'] = value.value || ''
                } else {
                  isError = true
                  data['entity_type_id'] = ''
                  data['error'] = '未找到类型' + this.parsedCsv[i][j]
                }
              } else {
                if (this.columnSelect[j] === 'description') {
                  data[this.columnSelect[j]] = this.parsedCsv[i][j] || ''
                } else if (this.parsedCsv[i][j] !== undefined) {
                  data[this.columnSelect[j]] = this.parsedCsv[i][j]
                }
              }
            }
          }
        }
        if (isError) {
          error_data.push(data)
          ElMessage.error(data.name + (data.error || '未知错误'))
        } else {
          all_data.push(data)
        }
      }
      //console.log('all_data', all_data)
      this.$emit('confirm', all_data, this.updateData)
    },
    onReupload() {
      this.$emit('reupload')
    },
    stateColumn(data) {
      if (
        !this.columnsAllowed.find(
          item => item.value === data || item.label === data
        )
      ) {
        return 'ignored'
      }
    },
    checkForDuplicate() {
      const ignoredItem = this.$t('main.csv.unknown')

      this.duplicates = this.columnSelect
        .filter((item, index) => this.columnSelect.indexOf(item) !== index)
        .filter(item => item !== ignoredItem)
    },
    isDuplicated(index) {
      if (this.duplicates.includes(this.columnSelect[index])) {
        return true
      }
    },
    existingData(index) {
      const csv = this.parsedCsv[index + 1]
      const db = this.database
      const columns = this.indexMatchers
      let itemName = ''
      columns.forEach(col => {
        itemName += csv[col]
      })
      return db[itemName]
    }
  },
  watch: {
    parsedCsv() {
      const list = []
      this.parsedCsv[0].forEach(item => {
        const val = this.columnsAllowed.find(
          item_ => item_.value === item || item_.label === item
        )
        if (val) {
          list.push(val.value)
        } else {
          list.push(this.$t('main.csv.unknown'))
        }
      })
      this.columnSelect = list
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .render-container {
    .render {
      th,
      td {
        border: 1px solid $dark-grey-lightest;
        color: $white;
      }

      tr:not(.render-headers):hover {
        background-color: $dark-grey-lightmore;
      }
    }
  }

  .render-select {
    border-color: $dark-grey-lightest;
  }

  .legend-term {
    border: 1px solid $dark-grey-lightest;
  }

  .ignored {
    background-color: $dark-grey;
  }

  .disabled {
    background: repeating-linear-gradient(
      -45deg,
      rgba($dark-grey, 0.6),
      rgba($dark-grey, 0.6) 2px,
      transparent 2px,
      transparent 10px
    );
  }
}

.modal-content {
  margin: 6rem auto 1.4rem;
  max-width: calc(100vw - 4rem);
  max-height: calc(100% - 6rem);
  width: auto;
}

.modal-content .box p.text {
  margin-bottom: 1em;
}

.error {
  margin-top: 1em;
}

.description {
  margin-bottom: 1em;
  margin-top: 2em;

  .flex-item {
    flex: 1 1 50%;
  }
}

.render-container {
  max-height: 300px;
  overflow: auto;

  .render-headers {
    .field {
      margin: 0;
    }
  }

  .render {
    width: 100%;
    border: 1px solid $light-grey-light;

    th,
    td {
      color: $dark-grey;
      border: 1px solid $light-grey-light;
      padding: 0.75rem;
    }

    tr:hover {
      background: none;
    }

    tr:not(.render-headers):hover {
      background-color: $white-grey-light;
    }
  }
}

.render-select {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid $light-grey-light;
}

.render-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
}

.modal-content .box h1.title {
  margin-bottom: 0;
}

.legend-title {
  color: var(--text);
  font-size: 1em;
  font-weight: bold;
  margin-bottom: 1.5em;
  margin-top: 0;
  text-transform: uppercase;
}

.legends {
  align-items: flex-start;
}

.legend {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.legend-term {
  display: inline-block;
  margin-right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid $light-grey-light;
}

.legend-definition {
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0 1rem 0.5rem 0;
}

.ignored {
  background-color: rgba($light-grey-light, 0.6);
}

.missing {
  background-color: rgba($red, 0.6);
}

.missing-optional {
  background-color: rgba($red, 0.2);
}

.optional-header,
.required-header {
  vertical-align: bottom;
}

col.missing-optional,
col.missing {
  min-width: 150px;

  th {
    vertical-align: bottom;
  }
}

.disabled {
  opacity: 0.4;
  background: repeating-linear-gradient(
    -45deg,
    rgba($light-grey-light, 0.7),
    rgba($light-grey-light, 0.7) 2px,
    transparent 2px,
    transparent 10px
  );
}

.overwrite {
  background-color: rgba($blue, 0.2);

  &:hover td {
    background-color: rgba($blue, 0.3);
  }
}
</style>
