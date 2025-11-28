<template>
  <div
    :class="{
      modal: true,
      'is-active': active
    }"
  >
    <div class="modal-background" @click="$emit('cancel')"></div>

    <div class="modal-content">
      <div class="box">
        <page-title class="title" :text="$t('shots.manage')" />
        <div class="explanation">{{ $t('shots.creation_explanation') }}</div>
        <div>
          <div class="flexrow">
            <combobox
              ref="shot-padding"
              :label="$t('shots.padding')"
              :options="shotPaddingOptions"
              class="shot-padding flexrow-item"
              v-model="shotPadding"
            />
          </div>
        </div>

        <div class="shot-columns">
          <div class="shot-column" v-if="isTVShow">
            <h2 class="subtitle">{{ $t('shots.episodes') }}</h2>

            <div class="list">
              <div
                :class="{
                  'entity-line': true,
                  selected: episode.id === selectedEpisodeId
                }"
                :key="episode.id"
                @click="selectEpisode(episode.id)"
                v-for="episode in displayedEpisodes"
              >
                {{ episode.name }}
              </div>
            </div>
            <div class="field">
              <input
                class="input"
                ref="addEpisodeInput"
                :placeholder="$t('episodes.fields.placeholder')"
                type="text"
                @keyup.tab="focusAddSequence"
                @keyup.enter="addEpisode"
                v-model="names.episode"
                v-focus
              />
              <button
                :class="{
                  button: true,
                  'is-success': true,
                  'is-loading': loading.addEpisode
                }"
                :disabled="!isAddEpisodeAllowed"
                @click="addEpisode"
              >
                {{ $t('main.add') }}
              </button>
            </div>
          </div>

          <div class="shot-column">
            <h2 class="subtitle">{{ $t('shots.sequences') }}</h2>
            <div class="list">
              <div
                :class="{
                  'entity-line': true,
                  selected: sequence.id === selectedSequenceId
                }"
                :key="sequence.id"
                @keyup.tab="focusAddShot"
                @click="selectSequence(sequence.id)"
                v-for="sequence in displayedSequences"
              >
                {{ sequence.name }}
              </div>
            </div>
            <div class="field">
              <div class="field-input-root">
                <span>EP</span>
                <input
                  class="field-input"
                  ref="addSequenceInput"
                  placeholder="001"
                  type="text"
                  @keyup.enter="addSequence"
                  @input="
                    e =>
                      (names.sequence = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 3))
                  "
                  v-model="names.sequence"
                />
              </div>

              <button
                :class="{
                  button: true,
                  'is-success': true,
                  'is-loading': loading.addSequence
                }"
                :disabled="!isAddSequenceAllowed"
                @click="addSequence"
              >
                {{ $t('main.add') }}
              </button>
            </div>
          </div>

          <div class="shot-column">
            <h2 class="subtitle">{{ $t('shots.title') }}</h2>
            <div class="list">
              <div
                class="entity-line"
                :key="shot.id"
                v-for="shot in displayedShots"
              >
                {{ shot.name }}
              </div>
            </div>
            <div class="field">
              <div class="field-input-root">
                <span>SC</span>
                <input
                  class="field-input"
                  placeholder="001"
                  ref="addShotInput"
                  type="text"
                  @keyup.enter="addShot"
                  @input="
                    e =>
                      (names.shot = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 3))
                  "
                  v-model="names.shot"
                />
                <select style="height: 100%" v-model="shotNameSuffix">
                  <option></option>
                  <option
                    v-for="i in Array.from({ length: 26 }, (_, i) =>
                      String.fromCharCode(65 + i)
                    )"
                    :key="i"
                  >
                    {{ i }}
                  </option>
                </select>
              </div>
            </div>
            <div class="flexrow">
              <button
                :class="{
                  button: true,
                  'is-fullwidth': true,
                  'is-success': true,
                  'is-loading': loading.addShot
                }"
                :disabled="!isAddShotAllowed || loading.addShot"
                @click="addShot"
              >
                {{ $t('doodle.add1') }}
              </button>
              <div
                class="field-input-root-2"
                :class="{
                  'is-fullwidth': true,
                  disabled: !isAddShotAllowed || loading.addShot
                }"
              >
                <input
                  class="field-input-2"
                  type="number"
                  :disabled="!isAddShotAllowed || loading.addShot"
                  v-model="names.shot_number"
                />
                <button
                  class="button-text"
                  :disabled="!isAddShotAllowed || loading.addShot"
                  :class="{
                    'is-fullwidth': true,
                    'is-success': true,
                    'is-loading': loading.addShot
                  }"
                  @click="addShot10"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>

        <p class="has-text-right modal-footer">
          <button @click="$emit('cancel')" class="button is-link">
            {{ $t('main.close') }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import shotStore from '@/store/modules/shots'

import { modalMixin } from '@/components/modals/base_modal'

import stringHelpers from '@/lib/string'
import { sortByName } from '@/lib/sorting'

import Combobox from '@/components/widgets/Combobox.vue'
import PageTitle from '@/components/widgets/PageTitle.vue'

export default {
  name: 'manage-shots-modal',

  mixins: [modalMixin],

  components: {
    Combobox,
    PageTitle
  },

  props: {
    active: {
      default: true,
      type: Boolean
    }
  },

  emits: ['add-episode', 'add-sequence', 'add-shot', 'cancel'],

  data() {
    return {
      names: {
        episode: '',
        sequence: '',
        shot: '',
        shot_number: 10
      },
      loading: {
        addEpisode: false,
        addSequence: false,
        addShot: false
      },
      sequences: [],
      displayedShots: [],
      selectedEpisodeId: null,
      selectedSequenceId: null,
      shotPaddingOptions: [
        {
          label: '1',
          value: '1'
        },
        {
          label: '2',
          value: '2'
        },
        {
          label: '10',
          value: '10'
        }
      ],
      shotPadding: '1',
      shotNameSuffix: ''
    }
  },

  computed: {
    ...mapGetters([
      'currentProduction',
      'displayedEpisodes',
      'displayedSequences',
      'isTVShow'
    ]),

    isAddEpisodeAllowed() {
      const isEmpty = this.names.episode === ''
      const isExist = this.displayedEpisodes.find(episode => {
        return this.names.episode === episode.name
      })
      return !isEmpty && !isExist
    },

    isAddSequenceAllowed() {
      const isEmpty = this.names.sequence === ''
      const isExist = this.displayedSequences.find(sequence => {
        return this.names.sequence === sequence.name
      })
      return !isEmpty && !isExist && (this.selectedEpisodeId || !this.isTVShow)
    },

    isAddShotAllowed() {
      const isEmpty = this.names.shot === ''
      const isExist = this.displayedShots.find(shot => {
        return `SC${this.names.shot}${this.shotNameSuffix}` === shot.name
      })
      return !isEmpty && !isExist && this.selectedSequenceId
    },

    shots() {
      return shotStore.cache.shots
    }
  },

  methods: {
    focusAddSequence() {
      this.$refs.addSequenceInput.focus()
    },

    focusAddShot() {
      this.$refs.addShotInput.focus()
    },

    selectEpisode(episodeId) {
      if (!this.isTVShow) {
        this.selectedEpisodeId = episodeId
        this.displayedShots = []
      } else {
        this.selectedEpisodeId = episodeId
        this.$router.push({
          name: 'episode-shots',
          params: {
            production_id: this.currentProduction.id,
            episode_id: episodeId
          }
        })
      }
    },

    selectSequence(sequenceId) {
      this.selectedSequenceId = sequenceId
      this.displayedShots = sortByName(
        this.shots.filter(shot => {
          return shot.sequence_id === sequenceId
        })
      )
    },

    addEpisode() {
      if (this.isAddEpisodeAllowed) {
        const episodeName = this.names.episode
        if (episodeName.length > 0) {
          this.loading.addEpisode = true
          const episode = {
            name: this.names.episode,
            project_id: this.currentProduction.id
          }
          this.$emit('add-episode', episode, episode => {
            this.loading.addEpisode = false
            this.selectEpisode(episode.id)
            this.names.episode = stringHelpers.generateNextName(episode.name)
          })
        }
      }
    },

    addSequence() {
      if (this.isAddSequenceAllowed) {
        const sequenceName = `EP${this.names.sequence}`
        if (
          sequenceName.length > 0 &&
          (this.selectedEpisodeId || !this.isTVShow)
        ) {
          this.loading.addSequence = true
          const sequence = {
            name: sequenceName,
            episode_id: this.selectedEpisodeId,
            project_id: this.currentProduction.id
          }
          this.$emit('add-sequence', sequence, sequence => {
            this.loading.addSequence = false
            this.selectEpisode(this.selectedEpisodeId)
            this.selectSequence(sequence.id)
            this.names.sequence = stringHelpers.generateNextName(
              this.names.sequence
            )
          })
        }
      }
    },

    addShot() {
      if (this.isAddShotAllowed && !this.loading.addShot) {
        const shotName = `SC${String(Number(this.names.shot)).padStart(3, '0')}`
        this.loading.addShot = true
        if (shotName.length > 0 && this.selectedSequenceId) {
          const shot = {
            name: shotName + this.shotNameSuffix,
            sequence_id: this.selectedSequenceId,
            project_id: this.currentProduction.id
          }
          this.$emit('add-shot', shot, shot => {
            this.loading.addShot = false
            this.selectSequence(this.selectedSequenceId)
            let next_shot = Number(this.names.shot)
            if (this.shotNameSuffix === '') next_shot += 1
            this.names.shot = String(next_shot).padStart(3, '0')
          })
        }
      }
    },

    addShot10() {
      if (this.isAddShotAllowed && !this.loading.addShot) {
        const shotName = `SC${String(Number(this.names.shot)).padStart(3, '0')}`
        const number = shotName.replace(/\D/g, '')
        if (number.length > 0) {
          const val = parseInt(number)
          if (val) {
            let i
            for (i = 0; i < this.names.shot_number; i++) {
              this.loading.addShot = true
              if (this.selectedSequenceId) {
                const shot = {
                  name:
                    'SC' + String(Number(this.names.shot) + i).padStart(3, '0'),
                  sequence_id: this.selectedSequenceId,
                  project_id: this.currentProduction.id
                }
                this.$emit('add-shot', shot, shot => {
                  this.loading.addShot = false
                  this.selectSequence(this.selectedSequenceId)
                  console.log(this.names.shot)
                  this.names.shot = String(
                    Number(this.names.shot) + 1
                  ).padStart(3, '0')
                })
              }
            }
          }
        }
      }
    }
  },

  watch: {
    active() {
      if (this.active) {
        this.shotPadding = '1'
        this.sequences = this.displayedSequences
        if (this.isTVShow) {
          this.selectEpisode(this.displayedEpisodes[0].id)
        } else if (this.sequences.length > 0) {
          this.selectSequence(this.sequences[0].id)
        }

        setTimeout(() => {
          if (this.isTVShow) {
            this.$refs.addEpisodeInput.focus()
          } else {
            this.$refs.addSequenceInput.focus()
          }
        }, 100)
      }
    },

    selectedEpisodeId() {
      this.sequences = this.displayedSequences
      if (this.sequences.length > 0) {
        this.selectSequence(this.sequences[0].id)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .shot-column .list {
    border: 1px solid $dark-grey;
  }
}

.shot-columns {
  display: flex;
  height: 300px;
}

.shot-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shot-column .list {
  border: 1px solid $light-grey;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border-bottom: 0;
  flex: 1;
  margin-top: 4px;
  margin-right: 10px;
  overflow-y: scroll;
}

.shot-column .field {
  display: flex;
  margin-bottom: 0;
  margin-right: 10px;
  flex-direction: column;
}

.shot-column .button {
  margin-left: 0;
  border-radius: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.shot-column .input {
  border-radius: 0;
}

.entity-line {
  cursor: pointer;
  padding: 0.3em;
}

.entity-line:hover {
  background: var(--background-selectable);
}

.entity-line.selected {
  background: var(--background-selected);
  border: 0;
}

.modal-footer {
  padding: 1em 1em 0 1em;
}

input::placeholder {
  color: #bbb;
}

.explanation {
  margin-bottom: 1em;
}

.subtitle {
  margin-bottom: 0;
}

.shot-padding {
  margin-right: 1em;
}

.flexrow {
  display: flex;
  align-items: center;
  margin-bottom: 0;
  margin-right: 10px;
}

.field-input-root {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 2.5em;
  padding: 0.1em 0.5em;
  border-radius: 5px;
  margin-top: 2px;
  margin-bottom: 2px;
  border: 1px solid var(--border);
}

.field-input-root-focus {
  border-color: green;
}

.field-input {
  padding-left: 0.1em;
  height: 2.5em;
  font-size: 1em;
  width: 100%;
  background: transparent;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.field-input-root-2 {
  display: flex;
  background: var(--background-tag-button);
  align-items: center;
  height: 2.3em;
  gap: 5px;
  width: 100%;
  border-radius: 0 0 10px 10px;
  border: 1px solid var(--border);
}

.field-input-2 {
  background: transparent;
  border-bottom: 1px solid var(--border);
  height: 2em;
  text-indent: 10px;
  margin-right: 10px;
  margin-left: 10px;
  max-width: 60px;
  text-align: center;

  &:focus {
    border-color: green;
  }
}

.button-text {
  border-radius: 5px;
  border-bottom: 1px solid var(--border);
  padding: 0.1em 0.5em;
  height: 100%;

  &:hover {
    background: $light-green;
  }
}
</style>
