const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken, requireClient } = require('../middleware/auth');

// Pterodactyl API Configuration
const PTERODACTYL_CONFIG = {
  url: process.env.PTERODACTYL_URL || 'https://panel.example.com',
  apiKey: process.env.PTERODACTYL_API_KEY || '',
  clientKey: process.env.PTERODACTYL_CLIENT_KEY || ''
};

// Pterodactyl API Client
class PterodactylAPI {
  constructor() {
    this.baseURL = PTERODACTYL_CONFIG.url;
    this.apiKey = PTERODACTYL_CONFIG.apiKey;
    this.clientKey = PTERODACTYL_CONFIG.clientKey;
  }

  async request(endpoint, options = {}) {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        ...options
      };

      const response = await axios(`${this.baseURL}/api/application${endpoint}`, config);
      return response.data;
    } catch (error) {
      console.error('Pterodactyl API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errors?.[0]?.detail || 'API request failed');
    }
  }

  async clientRequest(endpoint, options = {}) {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${this.clientKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        ...options
      };

      const response = await axios(`${this.baseURL}/api/client${endpoint}`, config);
      return response.data;
    } catch (error) {
      console.error('Pterodactyl Client API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errors?.[0]?.detail || 'Client API request failed');
    }
  }

  // Server Management
  async getServers() {
    return this.request('/servers');
  }

  async getServer(serverId) {
    return this.request(`/servers/${serverId}`);
  }

  async createServer(serverData) {
    return this.request('/servers', {
      method: 'POST',
      data: serverData
    });
  }

  async updateServer(serverId, serverData) {
    return this.request(`/servers/${serverId}`, {
      method: 'PATCH',
      data: serverData
    });
  }

  async deleteServer(serverId) {
    return this.request(`/servers/${serverId}`, {
      method: 'DELETE'
    });
  }

  async suspendServer(serverId) {
    return this.request(`/servers/${serverId}/suspend`, {
      method: 'POST'
    });
  }

  async unsuspendServer(serverId) {
    return this.request(`/servers/${serverId}/unsuspend`, {
      method: 'POST'
    });
  }

  async reinstallServer(serverId) {
    return this.request(`/servers/${serverId}/reinstall`, {
      method: 'POST'
    });
  }

  // Power Management
  async powerAction(serverId, action) {
    return this.clientRequest(`/servers/${serverId}/power`, {
      method: 'POST',
      data: { signal: action }
    });
  }

  async startServer(serverId) {
    return this.powerAction(serverId, 'start');
  }

  async stopServer(serverId) {
    return this.powerAction(serverId, 'stop');
  }

  async restartServer(serverId) {
    return this.powerAction(serverId, 'restart');
  }

  async killServer(serverId) {
    return this.powerAction(serverId, 'kill');
  }

  // Server Resources
  async getResources(serverId) {
    return this.clientRequest(`/servers/${serverId}/resources`);
  }

  async getConsole(serverId) {
    return this.clientRequest(`/servers/${serverId}/console`);
  }

  async sendCommand(serverId, command) {
    return this.clientRequest(`/servers/${serverId}/command`, {
      method: 'POST',
      data: { command }
    });
  }

  // Backups
  async getBackups(serverId) {
    return this.clientRequest(`/servers/${serverId}/backups`);
  }

  async createBackup(serverId, backupData) {
    return this.clientRequest(`/servers/${serverId}/backups`, {
      method: 'POST',
      data: backupData
    });
  }

  async deleteBackup(serverId, backupId) {
    return this.clientRequest(`/servers/${serverId}/backups/${backupId}`, {
      method: 'DELETE'
    });
  }

  // Databases
  async getDatabases(serverId) {
    return this.clientRequest(`/servers/${serverId}/databases`);
  }

  async createDatabase(serverId, databaseData) {
    return this.clientRequest(`/servers/${serverId}/databases`, {
      method: 'POST',
      data: databaseData
    });
  }

  async deleteDatabase(serverId, databaseId) {
    return this.clientRequest(`/servers/${serverId}/databases/${databaseId}`, {
      method: 'DELETE'
    });
  }

  // Schedules
  async getSchedules(serverId) {
    return this.clientRequest(`/servers/${serverId}/schedules`);
  }

  async createSchedule(serverId, scheduleData) {
    return this.clientRequest(`/servers/${serverId}/schedules`, {
      method: 'POST',
      data: scheduleData
    });
  }

  async updateSchedule(serverId, scheduleId, scheduleData) {
    return this.clientRequest(`/servers/${serverId}/schedules/${scheduleId}`, {
      method: 'POST',
      data: scheduleData
    });
  }

  async deleteSchedule(serverId, scheduleId) {
    return this.clientRequest(`/servers/${serverId}/schedules/${scheduleId}`, {
      method: 'DELETE'
    });
  }

  async executeSchedule(serverId, scheduleId) {
    return this.clientRequest(`/servers/${serverId}/schedules/${scheduleId}/execute`, {
      method: 'POST'
    });
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      data: userData
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      data: userData
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE'
    });
  }

  // Nodes
  async getNodes() {
    return this.request('/nodes');
  }

  async getNode(nodeId) {
    return this.request(`/nodes/${nodeId}`);
  }

  async getNodeAllocations(nodeId) {
    return this.request(`/nodes/${nodeId}/allocations`);
  }

  // Locations
  async getLocations() {
    return this.request('/locations');
  }

  // Nests (Eggs)
  async getNests() {
    return this.request('/nests');
  }

  async getNestEggs(nestId) {
    return this.request(`/nests/${nestId}/eggs`);
  }

  async getEgg(eggId) {
    return this.request(`/eggs/${eggId}`);
  }
}

const pterodactylAPI = new PterodactylAPI();

// Routes

// Get all servers (client)
router.get('/servers', authenticateToken, requireClient, async (req, res) => {
  try {
    const servers = await pterodactylAPI.getServers();
    res.json({
      success: true,
      data: servers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get server details
router.get('/servers/:serverId', authenticateToken, requireClient, async (req, res) => {
  try {
    const { serverId } = req.params;
    const server = await pterodactylAPI.getServer(serverId);
    res.json({
      success: true,
      data: server
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new server (admin)
router.post('/servers', authenticateToken, async (req, res) => {
  try {
    const serverData = req.body;
    const server = await pterodactylAPI.createServer(serverData);
    res.json({
      success: true,
      data: server,
      message: 'Server created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Power actions
router.post('/servers/:serverId/power/:action', authenticateToken, requireClient, async (req, res) => {
  try {
    const { serverId, action } = req.params;
    const validActions = ['start', 'stop', 'restart', 'kill'];
    
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid power action'
      });
    }

    await pterodactylAPI.powerAction(serverId, action);
    res.json({
      success: true,
      message: `Server ${action} action initiated`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get server resources
router.get('/servers/:serverId/resources', authenticateToken, requireClient, async (req, res) => {
  try {
    const { serverId } = req.params;
    const resources = await pterodactylAPI.getResources(serverId);
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get server console
router.get('/servers/:serverId/console', authenticateToken, requireClient, async (req, res) => {
  try {
    const { serverId } = req.params;
    const consoleData = await pterodactylAPI.getConsole(serverId);
    res.json({
      success: true,
      data: consoleData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Send command to server
router.post('/servers/:serverId/command', authenticateToken, requireClient, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        message: 'Command is required'
      });
    }

    await pterodactylAPI.sendCommand(serverId, command);
    res.json({
      success: true,
      message: 'Command sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Backups
router.get('/servers/:serverId/backups', authenticateToken, requireClient, async (req, res) => {
  try {
    const { serverId } = req.params;
    const backups = await pterodactylAPI.getBackups(serverId);
    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/servers/:serverId/backups', authenticateToken, requireClient, async (req, res) => {
  try {
    const { serverId } = req.params;
    const backupData = req.body;
    const backup = await pterodactylAPI.createBackup(serverId, backupData);
    res.json({
      success: true,
      data: backup,
      message: 'Backup created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Databases
router.get('/servers/:serverId/databases', authenticateToken, requireClient, async (req, res) => {
  try {
    const { serverId } = req.params;
    const databases = await pterodactylAPI.getDatabases(serverId);
    res.json({
      success: true,
      data: databases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Schedules
router.get('/servers/:serverId/schedules', authenticateToken, requireClient, async (req, res) => {
  try {
    const { serverId } = req.params;
    const schedules = await pterodactylAPI.getSchedules(serverId);
    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get available locations
router.get('/locations', authenticateToken, async (req, res) => {
  try {
    const locations = await pterodactylAPI.getLocations();
    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get available nests and eggs
router.get('/nests', authenticateToken, async (req, res) => {
  try {
    const nests = await pterodactylAPI.getNests();
    res.json({
      success: true,
      data: nests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/nests/:nestId/eggs', authenticateToken, async (req, res) => {
  try {
    const { nestId } = req.params;
    const eggs = await pterodactylAPI.getNestEggs(nestId);
    res.json({
      success: true,
      data: eggs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Minecraft specific endpoints
router.get('/minecraft/templates', authenticateToken, async (req, res) => {
  try {
    // Get Minecraft specific templates
    const nests = await pterodactylAPI.getNests();
    const minecraftNest = nests.find(nest => 
      nest.name.toLowerCase().includes('minecraft') || 
      nest.description.toLowerCase().includes('minecraft')
    );
    
    if (!minecraftNest) {
      return res.json({
        success: true,
        data: []
      });
    }

    const eggs = await pterodactylAPI.getNestEggs(minecraftNest.id);
    res.json({
      success: true,
      data: eggs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Webhook for Pterodactyl events
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    console.log('Pterodactyl Webhook Event:', event);
    
    // Process different event types
    switch (event.type) {
      case 'server.started':
        console.log(`Server ${event.server_id} started`);
        break;
      case 'server.stopped':
        console.log(`Server ${event.server_id} stopped`);
        break;
      case 'backup.completed':
        console.log(`Backup completed for server ${event.server_id}`);
        break;
      default:
        console.log('Unknown event type:', event.type);
    }
    
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

module.exports = router;
