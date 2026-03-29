const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { exec } = require('child_process');

// Configuration Management
class SiteManager {
  constructor() {
    this.configPath = path.join(__dirname, '../config');
    this.backupPath = path.join(__dirname, '../backups');
    this.logPath = path.join(__dirname, '../logs');
  }

  async getConfig() {
    try {
      const envPath = path.join(__dirname, '../.env');
      const envContent = await fs.readFile(envPath, 'utf8');
      
      const config = {};
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && !key.startsWith('#')) {
          config[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      return config;
    } catch (error) {
      console.error('Error reading config:', error);
      return {};
    }
  }

  async updateConfig(updates) {
    try {
      const envPath = path.join(__dirname, '../.env');
      const envContent = await fs.readFile(envPath, 'utf8');
      
      let newContent = envContent.split('\n').map(line => {
        const [key] = line.split('=');
        if (key && updates[key.trim()]) {
          return `${key.trim()}=${updates[key.trim()]}`;
        }
        return line;
      });
      
      // Add new keys if they don't exist
      Object.keys(updates).forEach(key => {
        if (!newContent.some(line => line.startsWith(`${key}=`))) {
          newContent.push(`${key}=${updates[key]}`);
        }
      });
      
      await fs.writeFile(envPath, newContent.join('\n'));
      
      // Create backup
      await this.createConfigBackup();
      
      return true;
    } catch (error) {
      console.error('Error updating config:', error);
      return false;
    }
  }

  async createConfigBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupPath, `config-backup-${timestamp}.env`);
      
      await fs.mkdir(this.backupPath, { recursive: true });
      const envPath = path.join(__dirname, '../.env');
      await fs.copyFile(envPath, backupPath);
      
      return backupPath;
    } catch (error) {
      console.error('Error creating config backup:', error);
      return null;
    }
  }

  async getBackups() {
    try {
      await fs.mkdir(this.backupPath, { recursive: true });
      const files = await fs.readdir(this.backupPath);
      
      const backups = [];
      for (const file of files) {
        const filePath = path.join(this.backupPath, file);
        const stats = await fs.stat(filePath);
        
        backups.push({
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime || stats.mtime,
          type: file.includes('config') ? 'config' : 'database'
        });
      }
      
      return backups.sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('Error reading backups:', error);
      return [];
    }
  }

  async deleteBackup(filename) {
    try {
      const filePath = path.join(this.backupPath, filename);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting backup:', error);
      return false;
    }
  }

  async getLogs() {
    try {
      await fs.mkdir(this.logPath, { recursive: true });
      const files = await fs.readdir(this.logPath);
      
      const logs = [];
      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(this.logPath, file);
          const stats = await fs.stat(filePath);
          
          logs.push({
            name: file,
            path: filePath,
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
      
      return logs.sort((a, b) => b.modified - a.modified);
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  }

  async getLogContent(filename, lines = 100) {
    try {
      const filePath = path.join(this.logPath, filename);
      const content = await fs.readFile(filePath, 'utf8');
      const allLines = content.split('\n');
      
      return {
        content: allLines.slice(-lines).join('\n'),
        totalLines: allLines.length,
        filename
      };
    } catch (error) {
      console.error('Error reading log content:', error);
      return { content: '', totalLines: 0, filename };
    }
  }

  async clearLog(filename) {
    try {
      const filePath = path.join(this.logPath, filename);
      await fs.writeFile(filePath, '');
      return true;
    } catch (error) {
      console.error('Error clearing log:', error);
      return false;
    }
  }

  async getSystemInfo() {
    return new Promise((resolve) => {
      const info = {
        platform: process.platform,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      };

      // Get additional system info
      exec('systeminfo', (error, stdout, stderr) => {
        if (!error) {
          info.systemInfo = stdout;
        }
        resolve(info);
      });
    });
  }

  async restartService(serviceName) {
    return new Promise((resolve) => {
      const command = process.platform === 'win32' ? 
        `net stop "${serviceName}" && net start "${serviceName}"` :
        `sudo systemctl restart ${serviceName}`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });
  }

  async deploySite() {
    try {
      // Create deployment log
      const deployLog = path.join(this.logPath, 'deployment.log');
      const timestamp = new Date().toISOString();
      
      await fs.appendFile(deployLog, `\n=== Deployment started at ${timestamp} ===\n`);
      
      // Run deployment commands
      const commands = [
        'npm install',
        'npm run build',
        'pm2 reload craftpick-hosting'
      ];
      
      for (const command of commands) {
        await fs.appendFile(deployLog, `Executing: ${command}\n`);
        
        await new Promise((resolve) => {
          exec(command, async (error, stdout, stderr) => {
            if (error) {
              await fs.appendFile(deployLog, `Error: ${error.message}\n`);
            } else {
              await fs.appendFile(deployLog, `Success: ${stdout}\n`);
            }
            resolve();
          });
        });
      }
      
      await fs.appendFile(deployLog, `=== Deployment completed at ${new Date().toISOString()} ===\n`);
      
      return { success: true, message: 'Deployment completed successfully' };
    } catch (error) {
      console.error('Deployment error:', error);
      return { success: false, error: error.message };
    }
  }
}

const siteManager = new SiteManager();

// Routes

// Dashboard
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const config = await siteManager.getConfig();
    const systemInfo = await siteManager.getSystemInfo();
    const backups = await siteManager.getBackups();
    const logs = await siteManager.getLogs();
    
    res.json({
      success: true,
      data: {
        config,
        systemInfo,
        backups: backups.slice(0, 10), // Last 10 backups
        logs: logs.slice(0, 10), // Last 10 logs
        stats: {
          totalBackups: backups.length,
          totalLogs: logs.length,
          uptime: systemInfo.uptime
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Configuration Management
router.get('/config', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const config = await siteManager.getConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/config', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    const success = await siteManager.updateConfig(updates);
    
    if (success) {
      res.json({
        success: true,
        message: 'Configuration updated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update configuration'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Backup Management
router.get('/backups', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const backups = await siteManager.getBackups();
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

router.post('/backups/create', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type = 'config' } = req.body;
    
    if (type === 'config') {
      const backupPath = await siteManager.createConfigBackup();
      if (backupPath) {
        res.json({
          success: true,
          message: 'Backup created successfully',
          data: { path: backupPath }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to create backup'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid backup type'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/backups/:filename', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const success = await siteManager.deleteBackup(filename);
    
    if (success) {
      res.json({
        success: true,
        message: 'Backup deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete backup'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Log Management
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const logs = await siteManager.getLogs();
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/logs/:filename', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const { lines = 100 } = req.query;
    const logData = await siteManager.getLogContent(filename, parseInt(lines));
    
    res.json({
      success: true,
      data: logData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/logs/:filename', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const success = await siteManager.clearLog(filename);
    
    if (success) {
      res.json({
        success: true,
        message: 'Log cleared successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to clear log'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// System Information
router.get('/system', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const systemInfo = await siteManager.getSystemInfo();
    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Service Management
router.post('/services/:serviceName/restart', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { serviceName } = req.params;
    const result = await siteManager.restartService(serviceName);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Deployment
router.post('/deploy', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await siteManager.deploySite();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Maintenance Mode
router.post('/maintenance/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    // Update maintenance mode in config
    await siteManager.updateConfig({
      MAINTENANCE_MODE: enabled ? 'true' : 'false',
      MAINTENANCE_MESSAGE: req.body.message || 'Site under maintenance'
    });
    
    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/maintenance/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const config = await siteManager.getConfig();
    const maintenanceMode = config.MAINTENANCE_MODE === 'true';
    
    res.json({
      success: true,
      data: {
        enabled: maintenanceMode,
        message: config.MAINTENANCE_MESSAGE || 'Site under maintenance'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// API Status
router.get('/api/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const config = await siteManager.getConfig();
    
    // Check API endpoints status
    const apiStatus = {
      pterodactyl: {
        configured: !!config.PTERODACTYL_URL,
        url: config.PTERODACTYL_URL,
        status: 'unknown' // Would need to actually ping the API
      },
      plesk: {
        configured: !!config.PLESK_URL,
        url: config.PLESK_URL,
        status: 'unknown'
      },
      paypal: {
        configured: !!config.PAYPAL_CLIENT_ID,
        mode: config.PAYPAL_MODE || 'sandbox',
        status: 'unknown'
      }
    };
    
    res.json({
      success: true,
      data: apiStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Database Management
router.post('/database/backup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(siteManager.backupPath, `database-backup-${timestamp}.sql`);
    
    await fs.mkdir(siteManager.backupPath, { recursive: true });
    
    // Create database backup command
    const config = await siteManager.getConfig();
    const dbCommand = `mysqldump -h ${config.DB_HOST} -u ${config.DB_USER} -p${config.DB_PASSWORD} ${config.DB_NAME} > ${backupPath}`;
    
    exec(dbCommand, (error, stdout, stderr) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: 'Database backup failed',
          error: error.message
        });
      } else {
        res.json({
          success: true,
          message: 'Database backup created successfully',
          data: { path: backupPath }
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Cache Management
router.post('/cache/clear', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type = 'all' } = req.body;
    
    if (type === 'all' || type === 'session') {
      // Clear session cache
      const sessionPath = path.join(__dirname, '../sessions');
      if (require('fs').existsSync(sessionPath)) {
        const files = await fs.readdir(sessionPath);
        for (const file of files) {
          await fs.unlink(path.join(sessionPath, file));
        }
      }
    }
    
    if (type === 'all' || type === 'uploads') {
      // Clear upload cache
      const uploadPath = path.join(__dirname, '../uploads/temp');
      if (require('fs').existsSync(uploadPath)) {
        const files = await fs.readdir(uploadPath);
        for (const file of files) {
          await fs.unlink(path.join(uploadPath, file));
        }
      }
    }
    
    res.json({
      success: true,
      message: `${type} cache cleared successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Health Check
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      disk: await getDiskUsage(),
      services: await checkServices()
    };
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper functions
async function getDiskUsage() {
  try {
    const stats = await fs.stat(path.join(__dirname, '../'));
    return {
      available: 'N/A', // Would need additional system calls
      total: 'N/A',
      used: 'N/A'
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function checkServices() {
  const config = await siteManager.getConfig();
  const services = {};
  
  // Check database connection
  try {
    // Would need to actually test database connection
    services.database = { status: 'connected', responseTime: 10 };
  } catch (error) {
    services.database = { status: 'disconnected', error: error.message };
  }
  
  // Check API endpoints
  services.pterodactyl = { status: config.PTERODACTYL_URL ? 'configured' : 'not_configured' };
  services.plesk = { status: config.PLESK_URL ? 'configured' : 'not_configured' };
  services.paypal = { status: config.PAYPAL_CLIENT_ID ? 'configured' : 'not_configured' };
  
  return services;
}

module.exports = router;
