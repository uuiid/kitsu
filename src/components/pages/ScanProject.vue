<template>
  <div>
    <div class="columns fixed-page">
      <div class="scan-project">
        <header class="header interval">
          <page-title
            class="mt1"
            :text="$t('scan_project.scan_project')"
            :bold="true"
          />
        </header>
        <div class="interval">
          <div
            class="project-list"
            :key="production.id"
            v-for="production in displayProductions"
          >
            <div class="project-list-item">
              <input
                type="checkbox"
                v-model="production.checked"
                @click="selectProduct(production)"
              />
              <span class="list-item-text" @click="selectProduct(production)">
                {{ production.name }}</span
              >
            </div>
          </div>
        </div>
        <div class="interval">
          <div
            class="project-list"
            :key="assetType.id"
            v-for="assetType in displayAssetTypes"
          >
            <div class="project-list-item">
              <input
                type="checkbox"
                v-model="assetType.checked"
                @click="selectAssetType(assetType)"
              />
              <span
                class="list-item-text"
                @click="selectAssetType(assetType)"
                >{{ assetType.name }}</span
              >
            </div>
          </div>
        </div>
        <div class="operate interval">
          <button-simple
            class="confirm-button"
            :text="$t('scan_project.start_scan_asset')"
            :class="{
              'is-loading': isLoading
            }"
            @click="confirmClicked"
          >
          </button-simple>
          <div class="search-field">
            <span class="search-icon">
              <search-icon :size="20" />
            </span>
            <input
              ref="search-field"
              class="input"
              :placeholder="$t('scan_project.name')"
              v-model.trim="searchQuery"
            />
          </div>
        </div>
        <div class="datatable-wrappert">
          <div v-if="assetData.length > 0">
            <table class="datatable">
              <thead class="datatable-head">
                <tr class="">
                  <th
                    class="normal"
                    :key="key"
                    v-for="(filed, key) in tableHeadFiled"
                  >
                    {{ filed }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="datatable-row"
                  :key="asset.id"
                  v-for="asset in displaySoftAsset"
                >
                  <td
                    class=""
                    :class="{
                      'error-text': asset[key].length < 1,
                      'table-body-selectable': isTableBodySelectable(key)
                    }"
                    :key="asset.id + key"
                    :title="formatTbodyData(asset, key)"
                    v-for="(_, key) in tableHeadFiled"
                    @click="onClickTbody(asset, key)"
                    @copy="onCopyTBody(asset, key)"
                  >
                    {{ formatTbodyData(asset, key) }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="has-text-right">共:{{ assetData.length }}</div>
          </div>
        </div>
      </div>
      <div
        class="prompt"
        :class="{ 'prompt-animation': prompt.length > 0 }"
        v-if="prompt.length > 0"
      >
        <span>{{ prompt }}</span>
      </div>
      <div class="prompt" :style="sty" v-if="isShowText">
        <span>{{ text }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PageTitle from '@/components/widgets/PageTitle.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import { SearchIcon } from 'lucide-vue-next'

export default {
  name: 'scan-project',
  components: {
    SearchIcon,
    ButtonSimple,
    PageTitle
  },

  data() {
    return {
      isLoading: false,
      selectedProduct: new Map(),
      selectedAssetType: new Map(),
      assetData: [],
      tableHeadFiled: this.$t('scan_project.filed'),
      searchQuery: '',
      prompt: '',
      text: 'CESHI',
      isShowText: false,
      sty: {
        top: '',
        left: ''
      }
    }
  },

  mounted() {},
  computed: {
    ...mapGetters(['openProductions', 'assetTypes']),
    displayProductions() {
      return JSON.parse(JSON.stringify(this.openProductions))
    },
    displayAssetTypes() {
      return JSON.parse(JSON.stringify(this.assetTypes)).filter(
        assetType => assetType.name
      )
    },
    displaySoftAsset() {
      return this.assetData.filter(a => {
        return (
          `${a.name}${a.number}${a.version_name}`
            .toLocaleLowerCase()
            .indexOf(this.searchQuery.toLocaleLowerCase()) !== -1
        )
      })
    }
  },

  methods: {
    ...mapActions(['getScanProject']),
    confirmClicked() {
      this.isLoading = true
      let fieldStr = ''
      this.selectedProduct.forEach((_, id) => {
        fieldStr += `project_id=${id}&`
      })
      this.selectedAssetType.forEach((_, id) => {
        fieldStr += `assets_id=${id}&`
      })
      this.getScanProject(fieldStr.slice(0, -1))
        .then(res => {
          this.isLoading = false
          res.sort((a, b) =>
            `${a.number}${a.name}${a.version_name}`.localeCompare(
              `${b.number}${b.name}${b.version_name}`
            )
          )
          this.assetData = res
        })

        .catch(error => {
          this.assetData = []
        })
    },

    selectProduct(product) {
      product.checked = !product.checked
      if (this.selectedProduct.has(product.id)) {
        this.selectedProduct.delete(product.id)
      } else {
        this.selectedProduct.set(product.id, product)
      }
      this.$forceUpdate()
    },
    isTableBodySelectable(key) {
      return ['base_path'].includes(key)
    },
    selectAssetType(type) {
      type.checked = !type.checked
      if (this.selectedAssetType.has(type.id)) {
        this.selectedAssetType.delete(type.id)
      } else {
        this.selectedAssetType.set(type.id, type)
      }
      this.$forceUpdate()
    },
    formatTbodyData(asset, key) {
      if (['ue_file', 'maya_file', 'solve_file_'].includes(key))
        return asset[key].length > 1 ? asset[key] : `未找到路径`
      else if (key === 'assets_type')
        return (
          this.openProductions.filter(product => {
            return product.id === asset.project_id
          })[0].name +
          '/' +
          this.assetTypes.filter(type => {
            return type.id === asset.assets_type
          })[0].name
        )
      else return asset[key]
    },
    onClickTbody(asset, key) {
      const fs = require('fs')
      const path = require('path')
      if (key === 'base_path') {
        const production_path = path.normalize(
          this.openProductions.filter(production => {
            return production.id === asset.project_id
          })[0].path + asset[key]
        )
        if (fs.existsSync(production_path)) {
          window.api.openPath(production_path)
        } else {
          console.log(production_path)
        }
      }
    },
    onCopyTBody(asset, key) {
      navigator.clipboard.writeText(this.formatTbodyData(asset, key))
      this.prompt = '已复制'
      const intervalId = setInterval(() => {
        this.prompt = ''
        clearInterval(intervalId)
      }, 2000)
    },
    printText(event, asset, key) {
      this.sty.top = `${event.pageY}px`
      this.sty.left = `${event.pageX}px`
      //this.text = this.formatTbodyData(asset, key)
    }
  },
  watch: {},
  metaInfo() {
    return {
      title: `${this.$t('scan_project.scan_project')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.scan-project {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  width: 100%;
  padding: 4em 2em 1em 2em;
  color: var(--text);
  margin-left: auto;
  margin-right: auto;
}

.project-list {
  display: inline-grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.list-item-text {
  margin-left: 10px;

  &:hover {
    cursor: pointer;
  }
}

.search-field {
  //display: flex;
  padding-top: 0;
  position: relative;

  .input {
    font-size: 0.8em;
    border-radius: 10px;
    padding-left: 40px;
  }

  .search-icon {
    position: absolute;
    color: $grey;
    z-index: 4;
    top: 6px;
    left: 10px;
  }
}

.project-list-item {
  display: flex;
  max-width: 200px;
  //border: thick dotted #ff0000;
}

.interval {
  margin-bottom: 10px;
}

.operate {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.flexrow-item {
  max-width: 200px;
}

.datatable-head {
  th {
    font-size: 1rem;
    border-bottom: 0 solid var(--border);
  }
}

.datatable-head-row {
  &:first-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;

    th:first-child {
      border-top-left-radius: 10px;
    }

    th:last-child {
      border-top-right-radius: 10px;
    }

    th.normal {
      display: flex;
      border-right: 1px solid var(--border);
    }
  }
}

.header {
  width: 100%;
  //border: thick dotted #ff0000;
}

.datatable-row {
  //user-select: text;

  td {
    max-width: 350px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.error-text {
  color: $red;
}

.table-body-selectable {
  cursor: pointer;
}

.datatable-wrappert {
  overflow: auto;
}

td.normal {
  border-right: 1px solid var(--border);
}

@keyframes moveUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-20px);
    opacity: 0;
  }
}

.prompt {
  position: fixed;
  font-size: 20px;
  bottom: 20%;
  left: 50%;
}

.prompt-animation {
  animation: moveUp 2s infinite;
}
</style>
