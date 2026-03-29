const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  excerpt: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metaTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metaDescription: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft'
  },
  isHomePage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  template: {
    type: DataTypes.STRING,
    defaultValue: 'default'
  },
  featuredImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'pages',
  hooks: {
    beforeCreate: (page) => {
      if (!page.slug) {
        page.slug = page.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      if (page.status === 'published' && !page.publishedAt) {
        page.publishedAt = new Date();
      }
    },
    beforeUpdate: (page) => {
      if (page.changed('status') && page.status === 'published' && !page.publishedAt) {
        page.publishedAt = new Date();
      }
    }
  }
});

module.exports = Page;
