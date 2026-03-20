import client from '@/store/api/client.js'

export default {
  cancelWorkTask(task_id, data, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}`
    return client.ppatch(path, data)
  },
  deleteWorkTask(task_id, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}`
    return client.pdel(path)
  },
  getLocalSetting(localPath = '') {
    const path = localPath + `/api/doodle/local_setting`
    return client.pget(path)
  },
  getToolVersion(localPath = '') {
    const path = localPath + `/api/doodle/tool/version`
    return client.pget(path)
  },
  getWorkLog(task_id, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}/log`
    return fetch(path)
  },
  getWorkLogMini(task_id, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}/log/mini`
    return fetch(path)
  },
  getWorkTask(task_id, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}`
    return client.pget(path)
  },
  listWorkTask(localPath = '', options = '') {
    const path = localPath + `/api/doodle/task?` + options
    return client.pget(path)
  },
  setLocalSetting(setting, localPath = '') {
    const path = localPath + `/api/doodle/local_setting`
    return client.ppost(path, setting)
  },
  setWorkTask(task_id, task, localPath = '') {
    const path = localPath + `/api/doodle/task/${task_id}`
    return client.ppatch(path, task)
  },
  submitWorkTask(task, localPath = '', isVisitor = false, project_id = '') {
    let path = localPath + `/api/doodle/task`
    if (isVisitor) path = `/api/actions/projects/${project_id}/export-anim-fbx`
    return client.ppost(path, task)
  },
  addWatermark(task, localPath = '') {
    const path = localPath + `/api/actions/tools/add-watermark`
    return client.ppost(path, task)
  },
  resubmitWorkTask(task, localPath = '') {
    const path = localPath + `/api/doodle/task/${task.id}/restart`
    return client.ppost(path, task)
  },
  checkIsVisitor() {
    const path = '/api/auth/authenticated'
    return fetch(path, { method: 'GET' })
  },
  getVisitorContext() {
    const path = '/api/data/user/context'
    return client.pget(path)
  },
  updateFile(task, file_data, type, onProgress, assetOrShot = '') {
    const path = `/api/doodle/data/${assetOrShot !== '' ? assetOrShot : task.entity_type || `assets`}/${task.task_id || task.id}/file/${type}`
    return client.ppostFileData(path, file_data, onProgress)
  },
  getVideoThumbnail(task, localPath = '') {
    const path = localPath + `/api/doodle/video/thumbnail`
    return client.ppostThumbnail(path, task)
  },
  getDoodleFlags(id) {
    const path = `/api/doodle/file_association/${id}`
    return client.pget(path)
  },
  getMayaFilePath(id) {
    const path = `/api/doodle/data/asset/${id}/file/maya`
    return client.pget(path)
  },
  getUeFilePath(id) {
    const path = `/api/doodle/data/asset/${id}/file/ue`
    return client.pget(path)
  },
  getImageFilePath(id) {
    const path = `/api/doodle/data/asset/${id}/file/image`
    return client.pget(path)
  },
  getLocalLogPath(localPath = '') {
    const path = localPath + `/api/doodle/local_setting/tmp_dir/server_task`
    return client.pget(path)
  },
  getLocalWatermarkSetting(localPath = '') {
    const path = localPath + `/api/actions/tools/add-watermark`
    return client.pget(path)
  },
  previewWatermark(data, localPath = '') {
    const path = localPath + `/api/actions/tools/add-watermark`
    return client.pput(path, data)
  },
  submitCreateReview(task, data) {
    const path = `/api/actions/tasks/${task.id}/create-review`
    return client.ppost(path, data)
  },
  getCreateReview(task) {
    const path = `/api/actions/tasks/${task.id}/create-review`
    return client.pget(path)
  },
  createReview(playlists, preview_file_id, data) {
    const path = `/api/actions/playlists/${playlists.id}/preview-files/${preview_file_id}/create-review`
    return client.ppost(path, data)
  },
  submitLightTask(project_id, task, localPath = '') {
    const path = localPath + `/api/actions/project/${project_id}/sync`
    return client.ppost(path, task)
  },
  submitInspectTask(task, localPath = '') {
    const path = localPath + `/api/doodle/task/${task.task_id}/inspect`
    return client.ppost(path, task)
  },
  submitGenerateUeskTask(task, localPath = '') {
    const path =
      localPath + `/api/doodle/task/${task.task_id}/generate_uesk_file`
    return client.ppost(path, task)
  },
  submitExportAnimation(task, localPath = '') {
    const path =
      localPath +
      `/api/actions/projects/${task.project_id}/shots/${task.task_id}/export-anim-fbx`
    return client.ppost(path, task)
  },
  submitSimAbc(task, localPath = '') {
    const path =
      localPath +
      `/api/actions/projects/${task.project_id}/shots/${task.task_id}/update-sim-abc`
    return client.ppost(path, task)
  },
  updateUeFile(task, localPath = '') {
    const path = localPath + `/api/actions/local/task/${task.task_id}/update/ue`
    return client.ppost(path, task)
  },
  updateShotVideoAndSequence(task, localPath = '') {
    const path =
      localPath +
      `/api/actions/local/task/${task.task_id}/update/movie${task.compose_movie ? '/compose' : ''}`
    return client.ppost(path, task)
  },
  get_all_jobs() {
    const path = '/api/data/jobs'
    return client.pget(path)
  },
  get_one_job_info(id) {
    const path = `/api/data/jobs/${id}`
    return client.pget(path)
  },
  update_job(id, data) {
    const path = `/api/data/jobs/${id}`
    return client.pput(path, data)
  },
  get_job_log(id) {
    const path = `/api/actions/jobs/${id}/log`
    return client.pget(path)
  },
  update_job_log(id, data) {
    const path = `/api/actions/jobs/${id}/log`
    return client.pput(path, data)
  },
  get_all_computers() {
    const path = '/api/data/computers'
    return client.pget(path)
  },
  get_one_computer_info(id) {
    const path = `/api/data/computers/${id}`
    return client.pget(path)
  },
  delete_computer(id) {
    const path = `/api/data/computers/${id}`
    return client.pdel(path)
  },
  startDistributedRendering(localPath = '') {
    const path = localPath + '/api/actions/local/task/run'
    return client.ppost(path, {})
  },
  getDistributedRenderingStatus(localPath = '') {
    const path = localPath + '/api/actions/local/task/run'
    return client.pget(path)
  },
  modifyComputerInfo(computer_info) {
    const path = `/api/data/computers/${computer_info.id}`
    return client.pput(path, computer_info)
  },
  deleteJob(id) {
    const path = `/api/data/jobs/${id}`
    return client.pdel(path)
  }
}
