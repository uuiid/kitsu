import videolibraryApi from '../api/videolibrary'

const initialState = {
  videos: [],
  originalVideoTypes: new Map(),
  videoTypes: {},
  editVideo: {},
  editVideos: [],
  editVideoImage: null,
  isElectron: false,
  currentVideoType: {},
  selectedVideos: new Map(),
  openedVideoTypes: new Map(),
  videoExtensions: [
    'mp4',
    'mkv',
    'rmvb',
    'avi',
    'flv',
    'mov',
    'mpeg',
    'm4v',
    'wmv'
  ],
  imageExtensions: ['jpg', 'jpeg', 'png', 'gif'],
  isEditVideoSelection: false,
  isUpdatingVideo: false,
  refreshTimer: new Date()
}
const helpers = {
  getFileFromPath(filePath) {
    const fs = require('fs')
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.log(err)
          return reject(err)
        }
        return resolve(data)
      })
    })
  },
  getDateFromFile(file) {
    return new Promise((resolve, reject) => {
      let data = null
      const reader = new FileReader()
      reader.onload = () => {
        data = reader.result
      }
      reader.readAsArrayBuffer(file)
      reader.onloadend = () => {
        resolve(data)
      }
    })
  },
  handleVideo(re, res_obj) {
    const videoElement = document.createElement('video')
    videoElement.muted = true
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    return new Promise((resolve, reject) => {
      videoElement.src = window.URL.createObjectURL(res_obj.get(re.path).file)
      videoElement.addEventListener('error', () => {
        videoElement.remove()
        canvas.remove()
        resolve()
      })
      videoElement.addEventListener('loadedmetadata', () => {
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight

        videoElement.currentTime = Math.min(
          Math.floor(Math.random() * (8 - 2 + 1)) + 2,
          videoElement.duration
        )
        videoElement.addEventListener('seeked', async () => {
          try {
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

            canvas.toBlob(
              async blob => {
                try {
                  const arrayBuffer = await blob.arrayBuffer()
                  videoElement.remove()
                  canvas.remove()
                  resolve(Buffer.from(arrayBuffer))
                } catch (error) {
                  videoElement.remove()
                  canvas.remove()
                  reject(error)
                }
              },
              'image/png',
              1.0
            )
          } catch (error) {
            videoElement.remove()
            canvas.remove()
            reject(error)
          }
        })
      })
    })
  }
}

const state = {
  ...initialState
}

const mutations = {
  SET_VIDEOS(state, videos) {
    state.videos = videos.filter(item => item.active)
  },
  SET_EDIT_VIDEO(state, video) {
    state.editVideo = video
  },
  SET_VIDEO_TYPE(state, videoTypes) {
    state.videoTypes = videoTypes
  },
  SET_ORIGINAL_VIDEO_TYPES(state, videoTypes) {
    state.originalVideoTypes = new Map(videoTypes.map(item => [item.id, item]))
  },
  NEW_VIDEO(state, video) {
    state.editVideo = video
    state.videos.push(video)
  },
  NEW_VIDEOS(state, videos) {
    state.editVideo = videos[0]
    state.videos = [...state.videos, ...videos]
  },
  NEW_VIDEOS_TYPE(state, type) {
    state.originalVideoTypes.set(type.id, type)
    state.originalVideoTypes = new Map(state.originalVideoTypes)
  },
  DELETE_VIDEO_TYPE(state, type) {
    state.originalVideoTypes.delete(type.id)
    state.originalVideoTypes = new Map(state.originalVideoTypes)
  },
  DELETE_VIDEO(state, video) {
    state.videos = state.videos.filter(item => item.id !== video.id)
  },
  DELETE_VIDEOS(state, videos) {
    const idsToRemove = new Set(videos.map(video => video.id))
    state.videos = state.videos.filter(item => !idsToRemove.has(item.id))
  },
  MODIFY_VIDEO(state, video) {},
  SET_IS_ELECTRON(state, isElectron) {
    state.isElectron = isElectron
  },
  SET_CURRENT_VIDEO_TYPE(state, videoType) {
    state.currentVideoType.isSelected = false
    state.currentVideoType = videoType
    state.currentVideoType.isSelected = true
  },
  SET_CURRENT_VIDEO_TYPE_STATUS(state, videoType) {
    videoType.isOpen = !videoType.isOpen
    console.log(videoType)
  },
  SET_VIDEO_SELECTION(state, video) {
    if (state.selectedVideos.has(video.id)) {
      state.selectedVideos.delete(video.id)
      state.selectedVideos = new Map(state.selectedVideos) // for reactivity
    } else {
      state.selectedVideos.set(video.id, video)
      state.selectedVideos = new Map(state.selectedVideos) // for reactivity
      //const maxX = state.displayedAssets.length
      //const maxY = state.nbValidationColumns
      // unselect previously selected tasks
      //state.assetSelectionGrid = buildSelectionGrid(maxX, maxY)
    }
  },
  CLEAR_SELECTED_VIDEOS(state) {
    state.selectedVideos = new Map()
  },
  RESET_SELECTED_VIDEOS(state, videos) {
    state.selectedVideos = new Map()
    videos.forEach(video => {
      state.selectedVideos.set(video.id, video)
    })
  },
  SET_VIDEO_TYPE_OPEN(state, videoType) {
    videoType.isOpen = !videoType.isOpen
    if (state.openedVideoTypes.has(videoType.id)) {
      state.openedVideoTypes.delete(videoType.id)
      state.openedVideoTypes = new Map(state.openedVideoTypes) // for reactivity
    } else {
      state.openedVideoTypes.set(videoType.id, videoType)
      state.openedVideoTypes = new Map(state.openedVideoTypes) // for reactivity
    }
  },
  MODIFY_VIDEO_TYPE_ORDER(state, types) {
    types.forEach(type => {
      state.originalVideoTypes.set(type.id, type)
    })
    state.originalVideoTypes = new Map(state.originalVideoTypes)
  },
  SET_IS_EDIT_VIDEO_SELECTION(state) {
    state.isEditVideoSelection = !state.isEditVideoSelection
    state.selectedVideos = new Map()
  },
  SET_IS_UPDATING_VIDEOS(state) {
    state.isUpdatingVideo = !state.isUpdatingVideo
  },
  SET_REFRESH_TIMER(state) {
    state.refreshTimer = new Date()
  }
}

const getters = {
  videos: state => state.videos,
  videoTypes: state => state.videoTypes,
  editVideo: state => state.editVideo,
  originalVideoTypes: state => state.originalVideoTypes,
  isElectron: state => state.isElectron,
  openedVideoTypes: state => state.openedVideoTypes,
  currentVideoType: state => state.currentVideoType,
  selectedVideos: state => state.selectedVideos,
  videoExtensions: state => state.videoExtensions,
  imageExtensions: state => state.imageExtensions,
  isEditVideoSelection: state => state.isEditVideoSelection,
  isUpdatingVideo: state => state.isUpdatingVideo,
  refreshTimer: state => state.refreshTimer
}
const actions = {
  loadVideos({ commit }) {
    videolibraryApi
      .getVideos()
      .then(res => {
        commit('SET_VIDEOS', res)
        return res
      })
      .catch(err => {
        return err
      })
  },
  newVideos({ commit }, videos) {
    commit('SET_IS_UPDATING_VIDEOS')
    const path = require('path')
    const res_obj = videos.reduce((acc, video) => {
      return acc.set(video.path, video)
    }, new Map())
    return videolibraryApi.newVideos(videos).then(res => {
      const imageUploadPromises = res.map(re => {
        if (
          state.imageExtensions.includes(
            path.extname(re.path).slice(1).toLowerCase()
          )
        ) {
          return helpers.getFileFromPath(re.path).then(data => {
            const image = {
              id: re.id,
              data: data,
              filetype: re.extension
            }
            return videolibraryApi.addImage(image).then(() => {})
          })
        } else if (
          state.videoExtensions.includes(path.extname(re.path).slice(1))
        ) {
          return helpers
            .handleVideo(re, res_obj)
            .then(data => {
              const image = {
                id: re.id,
                data: data,
                filetype: 'image/png'
              }
              return videolibraryApi.addImage(image).then(() => {})
            })
            .catch(error => {
              console.error(`视频处理失败: ${re.path}`, error)
              re.has_thumbnail = false
              videolibraryApi.modifyVideo(re).then(() => {
                return re
              })
            })
        }
      })
      return Promise.all(imageUploadPromises).then(() => {
        commit('NEW_VIDEOS', res)
        commit('SET_IS_UPDATING_VIDEOS')
        return res
      })
    })
  },
  newVideo({ commit }, video) {
    return videolibraryApi
      .newVideo(video)
      .then(res => {
        let data = null
        const reader = new FileReader()
        reader.onload = () => {
          data = reader.result
        }
        reader.onloadend = () => {
          const re = res[0]
          re.data = data
          re.filetype = video.upimage.type
          videolibraryApi.addImage(re).then(() => {
            commit('NEW_VIDEO', res[0])
          })
          return res
        }
        reader.readAsArrayBuffer(video.upimage)
      })
      .catch(err => {
        console.log(err)
        return err
      })
  },
  modifyVideo({ commit }, video) {
    commit('SET_IS_UPDATING_VIDEOS')
    return videolibraryApi
      .modifyVideo(video)
      .then(res => {
        if (video.active) {
          if (video.upimage) {
            const image = {
              id: res.id,
              filetype: video.upimage.type
            }
            if (video.upimage.path) {
              return helpers.getFileFromPath(video.upimage.path).then(data => {
                image.data = data
                return videolibraryApi.addImage(image).then(re => {
                  commit('SET_IS_UPDATING_VIDEOS')
                  return re
                })
              })
            } else {
              return helpers.getDateFromFile(video.upimage).then(data => {
                image.data = data
                commit('SET_IS_UPDATING_VIDEOS')
                return videolibraryApi.addImage(image).then(() => {})
              })
            }
          }
        } else {
          commit('SET_VIDEO_SELECTION', video)
          commit('DELETE_VIDEO', video)
        }
      })
      .catch(err => {
        commit('SET_IS_UPDATING_VIDEOS')
        return err
      })
  },
  modifyVideos({ commit }) {
    const videos = Array.from(state.selectedVideos.values())
    return videolibraryApi.modifyVideos(videos).then(() => {
      commit('CLEAR_SELECTED_VIDEOS')
      commit('DELETE_VIDEOS', videos)
    })
  },
  modifyVideoActive({ commit }, video) {
    return videolibraryApi
      .modifyVideoActive(video)
      .then(() => {
        commit('SET_VIDEO_SELECTION', video)
        commit('DELETE_VIDEO', video)
      })
      .catch(err => {
        return err
      })
  },
  deleteVideo({ commit }, video) {
    videolibraryApi.deleteVideo(video).then(() => {
      commit('DELETE_VIDEO', video)
    })
  },
  loadVideosType({ commit }) {
    videolibraryApi
      .getVideosType()
      .then(res => {
        commit('SET_ORIGINAL_VIDEO_TYPES', res)
        return res
      })
      .catch(err => {
        console.log(err)
        return err
      })
  },
  newVideosType({ commit }, type) {
    videolibraryApi
      .newVideoType(type)
      .then(res => {
        commit('NEW_VIDEOS_TYPE', res)
        return res
      })
      .catch(err => {
        console.log(err)
        return err
      })
  },
  setIsElectron({ commit }, isElectron) {
    commit('SET_IS_ELECTRON', isElectron)
  },
  setCurrentVideoType({ commit }, videoType) {
    commit('SET_CURRENT_VIDEO_TYPE', videoType)
  },
  setCurrentVideoTypeStatus({ commit }, status) {
    commit('SET_CURRENT_VIDEO_TYPE_STATUS', status)
  },
  setVideoSelection({ commit }, video) {
    commit('SET_VIDEO_SELECTION', video)
  },
  setVideoTypeOpen({ commit }, videoType) {
    commit('SET_VIDEO_TYPE_OPEN', videoType)
  },
  clearSelectedVideos({ commit }) {
    commit('CLEAR_SELECTED_VIDEOS')
  },
  resetSelectedVideos({ commit }, videos) {
    commit('RESET_SELECTED_VIDEOS', videos)
  },
  deleteSelectedVideos({ commit }) {},
  deleteVideoType({ commit }) {
    return videolibraryApi
      .deleteVideoType(state.currentVideoType)
      .then(res => {
        commit('DELETE_VIDEO_TYPE', state.currentVideoType)
        return res
      })
      .catch(err => {
        return err
      })
  },
  modifyVideoTypeOrder({ commit }, { type, other }) {
    return videolibraryApi.modifyVideoTypeOrder(type, other).then(res => {
      commit('MODIFY_VIDEO_TYPE_ORDER', res)
      return res
    })
  },
  getScanProject({ commit }, bearer) {
    return videolibraryApi.getScanProject(bearer).then(result => {
      return result
    })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
