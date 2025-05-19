const notificationService = require('../../services/notificationService');
const supabase = require('../../config/supabase');

jest.mock('../../config/supabase', () => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn(),
    is: jest.fn().mockReturnThis()
  }))
}));

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    const mockNotification = {
      user_id: 'user123',
      type: 'event_invitation',
      message: 'You have been invited to an event',
      related_id: 'event123'
    };

    it('should create a notification successfully', async () => {
      const mockResponse = { ...mockNotification, id: '123', created_at: '2024-03-20T00:00:00Z' };
      supabase.from().insert().select().single.mockResolvedValueOnce({ data: mockResponse, error: null });

      const result = await notificationService.createNotification(mockNotification);
      expect(result).toEqual(mockResponse);
      expect(supabase.from).toHaveBeenCalledWith('notifications');
    });

    it('should throw error when notification creation fails', async () => {
      supabase.from().insert().select().single.mockResolvedValueOnce({ data: null, error: new Error('DB Error') });

      await expect(notificationService.createNotification(mockNotification))
        .rejects.toThrow('Failed to create notification');
    });
  });

  describe('getUserNotifications', () => {
    it('should get user notifications with pagination', async () => {
      const mockNotifications = [
        { id: '1', message: 'Notification 1' },
        { id: '2', message: 'Notification 2' }
      ];
      supabase.from().select().eq().order().range.mockResolvedValueOnce({ 
        data: mockNotifications, 
        error: null,
        count: 2 
      });

      const result = await notificationService.getUserNotifications('user123', { limit: 10, offset: 0 });
      expect(result.notifications).toEqual(mockNotifications);
      expect(result.total).toBe(2);
      expect(supabase.from).toHaveBeenCalledWith('notifications');
    });

    it('should throw error when fetching notifications fails', async () => {
      supabase.from().select().eq().order().range.mockResolvedValueOnce({ 
        data: null, 
        error: new Error('DB Error') 
      });

      await expect(notificationService.getUserNotifications('user123', { limit: 10, offset: 0 }))
        .rejects.toThrow('Failed to fetch notifications');
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const mockNotification = { 
        id: '123', 
        user_id: 'user123',
        read: false 
      };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockNotification, error: null });
      supabase.from().update().eq().select().single.mockResolvedValueOnce({ 
        data: { ...mockNotification, read: true }, 
        error: null 
      });

      const result = await notificationService.markNotificationAsRead('user123', '123');
      expect(result.read).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('notifications');
    });

    it('should throw error when notification not found', async () => {
      supabase.from().select().eq().single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await expect(notificationService.markNotificationAsRead('user123', '123'))
        .rejects.toThrow('Notification not found');
    });

    it('should throw error when not authorized', async () => {
      const mockNotification = { id: '123', user_id: 'otherUser' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockNotification, error: null });

      await expect(notificationService.markNotificationAsRead('user123', '123'))
        .rejects.toThrow('Not authorized to update this notification');
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const mockNotification = { id: '123', user_id: 'user123' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockNotification, error: null });
      supabase.from().delete().eq().mockResolvedValueOnce({ error: null });

      await expect(notificationService.deleteNotification('user123', '123')).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledWith('notifications');
    });

    it('should throw error when notification not found', async () => {
      supabase.from().select().eq().single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await expect(notificationService.deleteNotification('user123', '123'))
        .rejects.toThrow('Notification not found');
    });

    it('should throw error when not authorized', async () => {
      const mockNotification = { id: '123', user_id: 'otherUser' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockNotification, error: null });

      await expect(notificationService.deleteNotification('user123', '123'))
        .rejects.toThrow('Not authorized to delete this notification');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      supabase.from().update().eq().is().mockResolvedValueOnce({ error: null });

      await expect(notificationService.markAllNotificationsAsRead('user123')).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledWith('notifications');
    });

    it('should throw error when update fails', async () => {
      supabase.from().update().eq().is().mockResolvedValueOnce({ error: new Error('DB Error') });

      await expect(notificationService.markAllNotificationsAsRead('user123'))
        .rejects.toThrow('Failed to mark notifications as read');
    });
  });
}); 