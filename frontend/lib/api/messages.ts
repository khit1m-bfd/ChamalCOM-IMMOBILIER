import { api } from './client'

export const messagesApi = {
  conversations:      (params?: Record<string, any>) => api.get('/conversations',                   { params }),
  getConversation:    (id: string)                   => api.get(`/conversations/${id}`),
  createConversation: (data: { recipient_id: string; property_id?: string; message: string }) => api.post('/conversations', data),
  getMessages:        (conversationId: string, params?: Record<string, any>) =>
                        api.get(`/conversations/${conversationId}/messages`, { params }),
  sendMessage:        (conversationId: string, content: string) =>
                        api.post(`/conversations/${conversationId}/messages`, { message: content }),
  markRead:           (conversationId: string) => api.post(`/conversations/${conversationId}/read`),
}
