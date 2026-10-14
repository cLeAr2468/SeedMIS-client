import api from './api';

const requestService = {
  // Get all client requests
  getMyRequests: async () => {
    try {
      const response = await api.get('/client/requests');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch requests' };
    }
  },

  // Get available seedlings
  getAvailableSeedlings: async () => {
    try {
      const response = await api.get('/requests/available-seedlings');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch seedlings' };
    }
  },

  // Create new request
  createRequest: async (requestData) => {
    try {
      const response = await api.post('/requests', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create request' };
    }
  },

  // Update request
  updateRequest: async (id, requestData) => {
    try {
      const response = await api.put(`/requests/${id}`, requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update request' };
    }
  },

  // Cancel/Delete request
  cancelRequest: async (id) => {
    try {
      const response = await api.delete(`/requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to cancel request' };
    }
  },
};

export default requestService;
