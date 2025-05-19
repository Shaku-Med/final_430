const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Project Management API',
    description: 'API for managing projects, events, and user profiles',
    version: '1.0.0',
  },
  host: process.env.API_URL || 'localhost:5000',
  schemes: ['http', 'https'],
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  },
  security: [{
    bearerAuth: []
  }],
  definitions: {
    User: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        isVerified: { type: 'boolean' },
        isSuspended: { type: 'boolean' },
        accountType: { type: 'string', enum: ['user', 'admin'] }
      }
    },
    Project: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
        createdBy: { type: 'string', format: 'uuid' }
      }
    },
    Event: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        description: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        createdBy: { type: 'string', format: 'uuid' }
      }
    },
    Notification: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        type: { type: 'string' },
        message: { type: 'string' },
        isRead: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/routes/*.js'];

swaggerAutogen(outputFile, endpointsFiles, doc); 