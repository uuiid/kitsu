import client from '@/store/api/client'

export default {
  newVideo(video) {
    const data = {
      label: video.label,
      parent_id: video.parent_id,
      id: video.id,
      path: video.path,
      notes: video.notes,
      active: video.active,
      has_thumbnail: video.has_thumbnail
    }
    const path = `/api/doodle/model_library/assets`
    return client.ppost(path, [data])
  },
  newVideos(video) {
    const path = `/api/doodle/model_library/assets`
    return client.ppost(path, video)
  },
  getVideos() {
    const path = `/api/doodle/model_library/assets`
    return client.pget(path)
  },
  deleteVideo(video) {
    const path = `/api/doodle/model_library/assets/${video.id}`
    return client.pdel(path)
  },
  modifyVideo(video) {
    const tempVideo = {
      id: video.id,
      parent_id: video.parent_id,
      label: video.label,
      path: video.path,
      notes: video.notes,
      active: video.active,
      has_thumbnail: video.has_thumbnail
    }
    const path = `/api/doodle/model_library/assets/${video.id}`
    return client.ppost(path, tempVideo)
  },
  modifyVideoActive(video) {
    const tempVideo = {
      id: video.id,
      parent_id: video.parent_id,
      label: video.label,
      path: video.path,
      notes: video.notes,
      active: !video.active
    }
    const path = `/api/doodle/model_library/assets/${video.id}`
    return client.ppost(path, tempVideo)
  },
  modifyVideos(videos) {
    const tempVideos = []
    videos.forEach(video => {
      tempVideos.push({
        id: video.id,
        parent_id: video.parent_id,
        label: video.label,
        path: video.path,
        notes: video.notes,
        active: !video.active
      })
    })
    const path = `/api/doodle/model_library/assets`
    return client.ppatch(path, tempVideos)
  },
  newVideoType(type) {
    const data = {
      label: type.label,
      parent_id: type.parent_id,
      id: type.id,
      order: type.order
    }
    const path = `/api/doodle/model_library/assets_tree`
    return client.ppost(path, data)
  },
  getVideosType() {
    const path = `/api/doodle/model_library/assets_tree`
    return client.pget(path)
  },
  deleteVideoType(video) {
    const path = `/api/doodle/model_library/assets_tree/${video.id}`
    return client.pdel(path)
  },
  addImage(image) {
    const path = `/api/doodle/pictures/${image.id}`
    return client.ppostFileData(path, image)
  },
  modifyVideoTypeOrder(type, other) {
    const data = []
    data.push({
      label: type.label,
      parent_id: type.parent_id,
      id: type.id,
      order: other.order
    })
    data.push({
      label: other.label,
      parent_id: other.parent_id,
      id: other.id,
      order: type.order
    })
    const path = `/api/doodle/model_library/assets_tree`
    return client.ppatch(path, data)
  }
}
