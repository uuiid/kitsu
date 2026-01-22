import client from '@/store/api/client.js'

export default {
  getEpibolyAuthorization(project_id) {
    return client.pget(`/api/data/projects/${project_id}/authorization`)
  },
  addEpibolyAuthorization(project_id, data) {
    return client.ppost(`/api/data/projects/${project_id}/authorization`, data)
  },
  deleteEpibolyAuthorization(project_id, authorization_id) {
    return client.pdel(
      `/api/data/projects/${project_id}/authorization/${authorization_id}`
    )
  }
}
