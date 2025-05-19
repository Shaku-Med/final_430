const eventService = require('../../services/eventService');
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
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis()
  }))
}));

describe('Event Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    const mockEvent = {
      title: 'Test Event',
      description: 'Test Description',
      date: '2024-03-20T00:00:00Z',
      location: 'Test Location'
    };

    it('should create an event successfully', async () => {
      const mockResponse = { ...mockEvent, id: '123', created_by: 'user123' };
      supabase.from().insert().select().single.mockResolvedValueOnce({ data: mockResponse, error: null });

      const result = await eventService.createEvent('user123', mockEvent);
      expect(result).toEqual(mockResponse);
      expect(supabase.from).toHaveBeenCalledWith('events');
    });

    it('should throw error when event creation fails', async () => {
      supabase.from().insert().select().single.mockResolvedValueOnce({ data: null, error: new Error('DB Error') });

      await expect(eventService.createEvent('user123', mockEvent)).rejects.toThrow('Failed to create event');
    });
  });

  describe('getEvents', () => {
    it('should list events with pagination and filters', async () => {
      const mockEvents = [
        { id: '1', title: 'Event 1' },
        { id: '2', title: 'Event 2' }
      ];
      supabase.from().select().order().range.mockResolvedValueOnce({ 
        data: mockEvents, 
        error: null,
        count: 2 
      });

      const result = await eventService.getEvents({ 
        limit: 10, 
        offset: 0,
        startDate: '2024-03-01',
        endDate: '2024-04-01'
      });
      expect(result.events).toEqual(mockEvents);
      expect(result.total).toBe(2);
      expect(supabase.from).toHaveBeenCalledWith('events');
    });

    it('should throw error when listing events fails', async () => {
      supabase.from().select().order().range.mockResolvedValueOnce({ data: null, error: new Error('DB Error') });

      await expect(eventService.getEvents({ limit: 10, offset: 0 })).rejects.toThrow('Failed to fetch events');
    });
  });

  describe('getEventById', () => {
    it('should get event by id successfully', async () => {
      const mockEvent = { 
        id: '123', 
        title: 'Test Event',
        users: { user_id: 'user123', firstname: 'Test', lastname: 'User' }
      };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockEvent, error: null });

      const result = await eventService.getEventById('123');
      expect(result).toEqual(mockEvent);
      expect(supabase.from).toHaveBeenCalledWith('events');
    });

    it('should throw error when event not found', async () => {
      supabase.from().select().eq().single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await expect(eventService.getEventById('123')).rejects.toThrow('Event not found');
    });
  });

  describe('updateEvent', () => {
    const mockUpdates = {
      title: 'Updated Event',
      description: 'Updated Description',
      date: '2024-04-20T00:00:00Z'
    };

    it('should update event successfully', async () => {
      const mockEvent = { id: '123', created_by: 'user123' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockEvent, error: null });
      supabase.from().update().eq().select().single.mockResolvedValueOnce({ 
        data: { ...mockEvent, ...mockUpdates }, 
        error: null 
      });

      const result = await eventService.updateEvent('user123', '123', mockUpdates);
      expect(result).toEqual({ ...mockEvent, ...mockUpdates });
      expect(supabase.from).toHaveBeenCalledWith('events');
    });

    it('should throw error when not authorized', async () => {
      const mockEvent = { id: '123', created_by: 'otherUser' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockEvent, error: null });

      await expect(eventService.updateEvent('user123', '123', mockUpdates))
        .rejects.toThrow('Not authorized to update this event');
    });
  });

  describe('deleteEvent', () => {
    it('should delete event successfully', async () => {
      const mockEvent = { id: '123', created_by: 'user123' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockEvent, error: null });
      supabase.from().delete().eq().mockResolvedValueOnce({ error: null });

      await expect(eventService.deleteEvent('user123', '123')).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledWith('events');
    });

    it('should throw error when not authorized', async () => {
      const mockEvent = { id: '123', created_by: 'otherUser' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockEvent, error: null });

      await expect(eventService.deleteEvent('user123', '123'))
        .rejects.toThrow('Not authorized to delete this event');
    });
  });

  describe('Event Registration', () => {
    describe('registerForEvent', () => {
      it('should register for event successfully', async () => {
        const mockRegistration = { event_id: '123', user_id: 'user123' };
        supabase.from().insert().single.mockResolvedValueOnce({ data: mockRegistration, error: null });

        const result = await eventService.registerForEvent('123', 'user123');
        expect(result).toEqual(mockRegistration);
        expect(supabase.from).toHaveBeenCalledWith('event_registrations');
      });
    });

    describe('listEventRegistrations', () => {
      it('should list event registrations successfully', async () => {
        const mockRegistrations = [
          { 
            user_id: 'user123', 
            registered_at: '2024-03-20T00:00:00Z',
            profiles: { id: 'user123', username: 'test' }
          }
        ];
        supabase.from().select().eq().mockResolvedValueOnce({ data: mockRegistrations, error: null });

        const result = await eventService.listEventRegistrations('123');
        expect(result).toEqual(mockRegistrations);
        expect(supabase.from).toHaveBeenCalledWith('event_registrations');
      });
    });

    describe('unregisterFromEvent', () => {
      it('should unregister from event successfully', async () => {
        supabase.from().delete().eq().eq().mockResolvedValueOnce({ error: null });

        await expect(eventService.unregisterFromEvent('123', 'user123')).resolves.not.toThrow();
        expect(supabase.from).toHaveBeenCalledWith('event_registrations');
      });
    });
  });
}); 