import client from '@/store/api/client.js'

export default {
  getWorkingFilesFromSequence(project_id, sequence_id) {
    return client.pget(
      `/api/actions/projects/${project_id}/sequences/${sequence_id}/working-file`
    )
  }
}
