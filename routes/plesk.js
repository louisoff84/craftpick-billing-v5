const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken, requireClient } = require('../middleware/auth');

// Plesk API Configuration
const PLESK_CONFIG = {
  url: process.env.PLESK_URL || 'https://plesk.example.com:8443',
  username: process.env.PLESK_USERNAME || 'admin',
  password: process.env.PLESK_PASSWORD || '',
  secretKey: process.env.PLESK_SECRET_KEY || ''
};

// Plesk API Client
class PleskAPI {
  constructor() {
    this.baseURL = PLESK_CONFIG.url;
    this.username = PLESK_CONFIG.username;
    this.password = PLESK_CONFIG.password;
    this.secretKey = PLESK_CONFIG.secretKey;
  }

  async request(endpoint, options = {}) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/xml',
          'HTTP_AUTH_LOGIN': this.username,
          'HTTP_AUTH_PASSWD': this.password
        },
        ...options
      };

      const response = await axios(`${this.baseURL}${endpoint}`, config);
      return response.data;
    } catch (error) {
      console.error('Plesk API Error:', error.response?.data || error.message);
      throw new Error('Plesk API request failed');
    }
  }

  // Customer Management
  async getCustomers() {
    const xml = `
      <packet version="1.6.8.0">
        <customer>
          <get>
            <filter/>
            <dataset>
              <gen_info/>
              <stat/>
            </dataset>
          </get>
        </customer>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async getCustomer(customerId) {
    const xml = `
      <packet version="1.6.8.0">
        <customer>
          <get>
            <filter>
              <id>${customerId}</id>
            </filter>
            <dataset>
              <gen_info/>
              <stat/>
              <permissions/>
            </dataset>
          </get>
        </customer>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async createCustomer(customerData) {
    const xml = `
      <packet version="1.6.8.0">
        <customer>
          <add>
            <gen_info>
              <cname>${customerData.companyName}</cname>
              <pname>${customerData.personName}</pname>
              <login>${customerData.login}</login>
              <passwd>${customerData.password}</passwd>
              <email>${customerData.email}</email>
              <phone>${customerData.phone}</phone>
              <fax>${customerData.fax || ''}</fax>
              <address>${customerData.address}</address>
              <city>${customerData.city}</city>
              <state>${customerData.state}</state>
              <pcode>${customerData.postalCode}</pcode>
              <country>${customerData.country}</country>
            </gen_info>
          </add>
        </customer>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async updateCustomer(customerId, customerData) {
    const xml = `
      <packet version="1.6.8.0">
        <customer>
          <set>
            <filter>
              <id>${customerId}</id>
            </filter>
            <values>
              <gen_info>
                ${customerData.companyName ? `<cname>${customerData.companyName}</cname>` : ''}
                ${customerData.personName ? `<pname>${customerData.personName}</pname>` : ''}
                ${customerData.email ? `<email>${customerData.email}</email>` : ''}
                ${customerData.phone ? `<phone>${customerData.phone}</phone>` : ''}
                ${customerData.address ? `<address>${customerData.address}</address>` : ''}
                ${customerData.city ? `<city>${customerData.city}</city>` : ''}
                ${customerData.state ? `<state>${customerData.state}</state>` : ''}
                ${customerData.postalCode ? `<pcode>${customerData.postalCode}</pcode>` : ''}
                ${customerData.country ? `<country>${customerData.country}</country>` : ''}
              </gen_info>
            </values>
          </set>
        </customer>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async deleteCustomer(customerId) {
    const xml = `
      <packet version="1.6.8.0">
        <customer>
          <del>
            <filter>
              <id>${customerId}</id>
            </filter>
          </del>
        </customer>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  // Subscription Management
  async getSubscriptions(customerId = null) {
    const filter = customerId ? 
      `<filter><owner-id>${customerId}</owner-id></filter>` : 
      '<filter/>';
    
    const xml = `
      <packet version="1.6.8.0">
        <webspace>
          <get>
            ${filter}
            <dataset>
              <gen_info/>
              <hosting/>
              <limits/>
              <stat/>
              <performance/>
            </dataset>
          </get>
        </webspace>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async getSubscription(subscriptionId) {
    const xml = `
      <packet version="1.6.8.0">
        <webspace>
          <get>
            <filter>
              <id>${subscriptionId}</id>
            </filter>
            <dataset>
              <gen_info/>
              <hosting/>
              <limits/>
              <stat/>
              <performance/>
              <php-settings/>
            </dataset>
          </get>
        </webspace>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async createSubscription(subscriptionData) {
    const xml = `
      <packet version="1.6.8.0">
        <webspace>
          <add>
            <gen_setup>
              <name>${subscriptionData.name}</name>
              <owner-id>${subscriptionData.ownerId}</owner-id>
              <ip_address>${subscriptionData.ipAddress}</ip_address>
              <htype>${subscriptionData.hostingType || 'vrt_hst'}</htype>
            </gen_setup>
            <hosting>
              <property>
                <name>ftp_login</name>
                <value>${subscriptionData.ftpLogin}</value>
              </property>
              <property>
                <name>ftp_password</name>
                <value>${subscriptionData.ftpPassword}</value>
              </property>
              <property>
                <name>php</name>
                <value>true</value>
              </property>
              <property>
                <name>ssl</name>
                <value>${subscriptionData.ssl || 'false'}</value>
              </property>
            </hosting>
            <limits>
              <disk_space>${subscriptionData.diskSpace || 1048576}</disk_space>
              <max_db>${subscriptionData.maxDatabases || 1}</max_db>
              <max_box>${subscriptionData.maxMailboxes || 10}</max_box>
              <max_maillists>${subscriptionData.maxMailLists || 0}</max_maillists>
              <max_dom>${subscriptionData.maxDomains || 1}</max_dom>
              <max_subdom>${subscriptionData.maxSubdomains || 5}</max_subdom>
            </limits>
          </add>
        </webspace>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async updateSubscription(subscriptionId, subscriptionData) {
    const xml = `
      <packet version="1.6.8.0">
        <webspace>
          <set>
            <filter>
              <id>${subscriptionId}</id>
            </filter>
            <values>
              <hosting>
                ${subscriptionData.ftpLogin ? `
                <property>
                  <name>ftp_login</name>
                  <value>${subscriptionData.ftpLogin}</value>
                </property>` : ''}
                ${subscriptionData.ftpPassword ? `
                <property>
                  <name>ftp_password</name>
                  <value>${subscriptionData.ftpPassword}</value>
                </property>` : ''}
                ${subscriptionData.php !== undefined ? `
                <property>
                  <name>php</name>
                  <value>${subscriptionData.php}</value>
                </property>` : ''}
                ${subscriptionData.ssl !== undefined ? `
                <property>
                  <name>ssl</name>
                  <value>${subscriptionData.ssl}</value>
                </property>` : ''}
              </hosting>
              ${subscriptionData.diskSpace ? `
              <limits>
                <disk_space>${subscriptionData.diskSpace}</disk_space>
              </limits>` : ''}
            </values>
          </set>
        </webspace>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async deleteSubscription(subscriptionId) {
    const xml = `
      <packet version="1.6.8.0">
        <webspace>
          <del>
            <filter>
              <id>${subscriptionId}</id>
            </filter>
          </del>
        </webspace>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  // Domain Management
  async getDomains(subscriptionId = null) {
    const filter = subscriptionId ? 
      `<filter><webspace-id>${subscriptionId}</webspace-id></filter>` : 
      '<filter/>';
    
    const xml = `
      <packet version="1.6.8.0">
        <domain>
          <get>
            ${filter}
            <dataset>
              <gen_info/>
              <hosting/>
              <stat/>
            </dataset>
          </get>
        </domain>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async createDomain(domainData) {
    const xml = `
      <packet version="1.6.8.0">
        <domain>
          <add>
            <gen_setup>
              <name>${domainData.name}</name>
              <webspace-id>${domainData.webspaceId}</webspace-id>
              <ip_address>${domainData.ipAddress}</ip_address>
              <status>0</status>
            </gen_setup>
            <hosting>
              <property>
                <name>www</name>
                <value>${domainData.www || 'false'}</value>
              </property>
            </hosting>
          </add>
        </domain>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  // Database Management
  async getDatabases(subscriptionId = null) {
    const filter = subscriptionId ? 
      `<filter><webspace-id>${subscriptionId}</webspace-id></filter>` : 
      '<filter/>';
    
    const xml = `
      <packet version="1.6.8.0">
        <database>
          <get-db>
            ${filter}
            <dataset>
              <gen_info/>
            </dataset>
          </get-db>
        </database>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async createDatabase(databaseData) {
    const xml = `
      <packet version="1.6.8.0">
        <database>
          <add-db>
            <webspace-id>${databaseData.webspaceId}</webspace-id>
            <type>${databaseData.type || 'mysql'}</type>
            <name>${databaseData.name}</name>
            <db-server-id>${databaseData.serverId || 1}</db-server-id>
            <default-user id="${databaseData.userId || 'new'}">
              <login>${databaseData.userLogin}</login>
              <password>${databaseData.userPassword}</password>
            </default-user>
          </add-db>
        </database>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async deleteDatabase(databaseId) {
    const xml = `
      <packet version="1.6.8.0">
        <database>
          <del-db>
            <filter>
              <id>${databaseId}</id>
            </filter>
          </del-db>
        </database>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  // Email Management
  async getMailAccounts(subscriptionId = null) {
    const filter = subscriptionId ? 
      `<filter><webspace-id>${subscriptionId}</webspace-id></filter>` : 
      '<filter/>';
    
    const xml = `
      <packet version="1.6.8.0">
        <mail>
          <get_info>
            ${filter}
            <dataset>
              <gen_info/>
              <mailbox/>
            </dataset>
          </get_info>
        </mail>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async createMailAccount(mailData) {
    const xml = `
      <packet version="1.6.8.0">
        <mail>
          <create>
            <filter>
              <webspace-id>${mailData.webspaceId}</webspace-id>
            </filter>
            <mailbox>
              <name>${mailData.name}</name>
              <password>${mailData.password}</password>
              <mailbox_quota>${mailData.quota || -1}</mailbox_quota>
            </mailbox>
          </create>
        </mail>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  // SSL Certificate Management
  async getSSLCertificates(subscriptionId = null) {
    const filter = subscriptionId ? 
      `<filter><webspace-id>${subscriptionId}</webspace-id></filter>` : 
      '<filter/>';
    
    const xml = `
      <packet version="1.6.8.0">
        <certificate>
          <get>
            ${filter}
            <dataset>
              <gen_info/>
            </dataset>
          </get>
        </certificate>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async installSSLCertificate(subscriptionId, certificateData) {
    const xml = `
      <packet version="1.6.8.0">
        <certificate>
          <install>
            <webspace-id>${subscriptionId}</webspace-id>
            <name>${certificateData.name}</name>
            <certificate>${certificateData.certificate}</certificate>
            <private_key>${certificateData.privateKey}</private_key>
            <csr>${certificateData.csr || ''}</csr>
            <ca>${certificateData.ca || ''}</ca>
            <ip_address>${certificateData.ipAddress || ''}</ip_address>
          </install>
        </certificate>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  // Backup Management
  async getBackups(subscriptionId = null) {
    const filter = subscriptionId ? 
      `<filter><webspace-id>${subscriptionId}</webspace-id></filter>` : 
      '<filter/>';
    
    const xml = `
      <packet version="1.6.8.0">
        <backup-manager>
          <get>
            ${filter}
            <dataset>
              <backup/>
            </dataset>
          </get>
        </backup-manager>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async createBackup(subscriptionId, backupData) {
    const xml = `
      <packet version="1.6.8.0">
        <backup-manager>
          <backup>
            <webspace-id>${subscriptionId}</webspace-id>
            <type>${backupData.type || 'server'}</type>
            <description>${backupData.description || ''}</description>
            <splitting>${backupData.splitting || 'false'}</splitting>
            <prefix>${backupData.prefix || ''}</prefix>
            <compress>${backupData.compress || 'true'}</compress>
            <content>
              <webspace>${backupData.includeWebspace || 'true'}</webspace>
              <configuration>${backupData.includeConfig || 'true'}</configuration>
              <content>${backupData.includeContent || 'true'}</content>
              <logs>${backupData.includeLogs || 'false'}</logs>
              <databases>${backupData.includeDatabases || 'true'}</databases>
              <mail>${backupData.includeMail || 'false'}</mail>
            </content>
          </backup>
        </backup-manager>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  // Statistics and Monitoring
  async getTrafficStats(subscriptionId, period = 'day') {
    const xml = `
      <packet version="1.6.8.0">
        <traffic>
          <get>
            <filter>
              <webspace-id>${subscriptionId}</webspace-id>
            </filter>
            <dataset>
              <stat/>
            </dataset>
          </get>
        </traffic>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async getResourceUsage(subscriptionId) {
    const xml = `
      <packet version="1.6.8.0">
        <resource-usage>
          <get>
            <filter>
              <webspace-id>${subscriptionId}</webspace-id>
            </filter>
            <dataset>
              <resource_usage/>
            </dataset>
          </get>
        </resource-usage>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  // Server Information
  async getServerInfo() {
    const xml = `
      <packet version="1.6.8.0">
        <server>
          <get>
            <filter/>
            <dataset>
              <gen_info/>
              <stat/>
              <prefs/>
              <templates/>
            </dataset>
          </get>
        </server>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }

  async getIPAddresses() {
    const xml = `
      <packet version="1.6.8.0">
        <ip>
          <get>
            <filter/>
            <dataset>
              <ip_info/>
            </dataset>
          </get>
        </ip>
      </packet>
    `;
    
    return this.request('/enterprise/control/agent.php', {
      method: 'POST',
      data: xml
    });
  }
}

const pleskAPI = new PleskAPI();

// Routes

// Customer Management
router.get('/customers', authenticateToken, async (req, res) => {
  try {
    const customers = await pleskAPI.getCustomers();
    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/customers/:customerId', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await pleskAPI.getCustomer(customerId);
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/customers', authenticateToken, async (req, res) => {
  try {
    const customerData = req.body;
    const customer = await pleskAPI.createCustomer(customerData);
    res.json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Subscription Management
router.get('/subscriptions', authenticateToken, requireClient, async (req, res) => {
  try {
    const { customerId } = req.query;
    const subscriptions = await pleskAPI.getSubscriptions(customerId);
    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/subscriptions/:subscriptionId', authenticateToken, requireClient, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = await pleskAPI.getSubscription(subscriptionId);
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const subscriptionData = req.body;
    const subscription = await pleskAPI.createSubscription(subscriptionData);
    res.json({
      success: true,
      data: subscription,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Domain Management
router.get('/domains', authenticateToken, requireClient, async (req, res) => {
  try {
    const { subscriptionId } = req.query;
    const domains = await pleskAPI.getDomains(subscriptionId);
    res.json({
      success: true,
      data: domains
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/domains', authenticateToken, requireClient, async (req, res) => {
  try {
    const domainData = req.body;
    const domain = await pleskAPI.createDomain(domainData);
    res.json({
      success: true,
      data: domain,
      message: 'Domain created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Database Management
router.get('/databases', authenticateToken, requireClient, async (req, res) => {
  try {
    const { subscriptionId } = req.query;
    const databases = await pleskAPI.getDatabases(subscriptionId);
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

router.post('/databases', authenticateToken, requireClient, async (req, res) => {
  try {
    const databaseData = req.body;
    const database = await pleskAPI.createDatabase(databaseData);
    res.json({
      success: true,
      data: database,
      message: 'Database created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Email Management
router.get('/mail-accounts', authenticateToken, requireClient, async (req, res) => {
  try {
    const { subscriptionId } = req.query;
    const mailAccounts = await pleskAPI.getMailAccounts(subscriptionId);
    res.json({
      success: true,
      data: mailAccounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/mail-accounts', authenticateToken, requireClient, async (req, res) => {
  try {
    const mailData = req.body;
    const mailAccount = await pleskAPI.createMailAccount(mailData);
    res.json({
      success: true,
      data: mailAccount,
      message: 'Mail account created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// SSL Certificates
router.get('/ssl-certificates', authenticateToken, requireClient, async (req, res) => {
  try {
    const { subscriptionId } = req.query;
    const certificates = await pleskAPI.getSSLCertificates(subscriptionId);
    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/ssl-certificates/:subscriptionId/install', authenticateToken, requireClient, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const certificateData = req.body;
    const result = await pleskAPI.installSSLCertificate(subscriptionId, certificateData);
    res.json({
      success: true,
      data: result,
      message: 'SSL certificate installed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Backup Management
router.get('/backups', authenticateToken, requireClient, async (req, res) => {
  try {
    const { subscriptionId } = req.query;
    const backups = await pleskAPI.getBackups(subscriptionId);
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

router.post('/backups/:subscriptionId', authenticateToken, requireClient, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const backupData = req.body;
    const backup = await pleskAPI.createBackup(subscriptionId, backupData);
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

// Statistics
router.get('/stats/traffic/:subscriptionId', authenticateToken, requireClient, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { period = 'day' } = req.query;
    const stats = await pleskAPI.getTrafficStats(subscriptionId, period);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/stats/resources/:subscriptionId', authenticateToken, requireClient, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const usage = await pleskAPI.getResourceUsage(subscriptionId);
    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Server Information
router.get('/server/info', authenticateToken, async (req, res) => {
  try {
    const serverInfo = await pleskAPI.getServerInfo();
    res.json({
      success: true,
      data: serverInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/server/ip-addresses', authenticateToken, async (req, res) => {
  try {
    const ipAddresses = await pleskAPI.getIPAddresses();
    res.json({
      success: true,
      data: ipAddresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
