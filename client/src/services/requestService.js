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

  // Get request by ID
  getRequestById: async (id) => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch request' };
    }
  },
};

export default requestService;
