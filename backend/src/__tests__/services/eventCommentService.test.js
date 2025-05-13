const eventCommentService = require('../../services/eventCommentService');
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
    range: jest.fn()
  }))
}));

describe('Event Comment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    const mockComment = {
      event_id: 'event123',
      user_id: 'user123',
      content: 'Test comment'
    };

    it('should create a comment successfully', async () => {
      const mockResponse = { ...mockComment, id: '123', created_at: '2024-03-20T00:00:00Z' };
      supabase.from().insert().select().single.mockResolvedValueOnce({ data: mockResponse, error: null });

      const result = await eventCommentService.createComment(mockComment);
      expect(result).toEqual(mockResponse);
      expect(supabase.from).toHaveBeenCalledWith('event_comments');
    });

    it('should throw error when comment creation fails', async () => {
      supabase.from().insert().select().single.mockResolvedValueOnce({ data: null, error: new Error('DB Error') });

      await expect(eventCommentService.createComment(mockComment))
        .rejects.toThrow('Failed to create comment');
    });
  });

  describe('getEventComments', () => {
    it('should get event comments with pagination', async () => {
      const mockComments = [
        { 
          id: '1', 
          content: 'Comment 1',
          users: { user_id: 'user123', firstname: 'Test', lastname: 'User' }
        },
        { 
          id: '2', 
          content: 'Comment 2',
          users: { user_id: 'user456', firstname: 'Another', lastname: 'User' }
        }
      ];
      supabase.from().select().eq().order().range.mockResolvedValueOnce({ 
        data: mockComments, 
        error: null,
        count: 2 
      });

      const result = await eventCommentService.getEventComments('event123', { limit: 10, offset: 0 });
      expect(result.comments).toEqual(mockComments);
      expect(result.total).toBe(2);
      expect(supabase.from).toHaveBeenCalledWith('event_comments');
    });

    it('should throw error when fetching comments fails', async () => {
      supabase.from().select().eq().order().range.mockResolvedValueOnce({ 
        data: null, 
        error: new Error('DB Error') 
      });

      await expect(eventCommentService.getEventComments('event123', { limit: 10, offset: 0 }))
        .rejects.toThrow('Failed to fetch comments');
    });
  });

  describe('updateComment', () => {
    const mockUpdates = {
      content: 'Updated comment'
    };

    it('should update comment successfully', async () => {
      const mockComment = { 
        id: '123', 
        user_id: 'user123',
        event_id: 'event123',
        content: 'Original comment'
      };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockComment, error: null });
      supabase.from().update().eq().select().single.mockResolvedValueOnce({ 
        data: { ...mockComment, ...mockUpdates }, 
        error: null 
      });

      const result = await eventCommentService.updateComment('user123', '123', mockUpdates);
      expect(result.content).toBe('Updated comment');
      expect(supabase.from).toHaveBeenCalledWith('event_comments');
    });

    it('should throw error when comment not found', async () => {
      supabase.from().select().eq().single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await expect(eventCommentService.updateComment('user123', '123', mockUpdates))
        .rejects.toThrow('Comment not found');
    });

    it('should throw error when not authorized', async () => {
      const mockComment = { id: '123', user_id: 'otherUser' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockComment, error: null });

      await expect(eventCommentService.updateComment('user123', '123', mockUpdates))
        .rejects.toThrow('Not authorized to update this comment');
    });
  });

  describe('deleteComment', () => {
    it('should delete comment successfully', async () => {
      const mockComment = { id: '123', user_id: 'user123' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockComment, error: null });
      supabase.from().delete().eq().mockResolvedValueOnce({ error: null });

      await expect(eventCommentService.deleteComment('user123', '123')).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledWith('event_comments');
    });

    it('should throw error when comment not found', async () => {
      supabase.from().select().eq().single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await expect(eventCommentService.deleteComment('user123', '123'))
        .rejects.toThrow('Comment not found');
    });

    it('should throw error when not authorized', async () => {
      const mockComment = { id: '123', user_id: 'otherUser' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockComment, error: null });

      await expect(eventCommentService.deleteComment('user123', '123'))
        .rejects.toThrow('Not authorized to delete this comment');
    });
  });
}); 