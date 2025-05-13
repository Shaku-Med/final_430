const { signup, verifyCode, login } = require('../../services/authService');
const supabase = require('../../config/supabase');

// Mock Supabase client
jest.mock('../../config/supabase', () => ({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn()
  }))
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com'
      };

      supabase.auth.signUp.mockResolvedValueOnce({ user: mockUser, error: null });
      supabase.from().select().single.mockResolvedValueOnce({ data: null, error: null });
      supabase.from().insert.mockResolvedValueOnce({ error: null });
      supabase.from().insert.mockResolvedValueOnce({ error: null });

      const result = await signup({
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      });

      expect(result).toEqual(mockUser);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123'
      });
    });

    it('should throw error if email already exists', async () => {
      supabase.from().select().single.mockResolvedValueOnce({
        data: { email: 'test@example.com' },
        error: null
      });

      await expect(signup({
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      })).rejects.toThrow('Email already registered');
    });
  });

  describe('verifyCode', () => {
    it('should successfully verify code and update user', async () => {
      const mockCode = '123456';
      const mockEmail = 'test@example.com';
      const mockUser = { id: '123' };

      supabase.from().select().single.mockResolvedValueOnce({
        data: { code: mockCode, expires_at: new Date(Date.now() + 10000).toISOString() },
        error: null
      });
      supabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
      supabase.from().update.mockResolvedValueOnce({ error: null });
      supabase.from().delete.mockResolvedValueOnce({ error: null });

      const result = await verifyCode({ email: mockEmail, code: mockCode });

      expect(result).toEqual(mockUser);
      expect(supabase.from().update).toHaveBeenCalledWith(
        { isVerified: true },
        { returning: 'minimal' }
      );
    });

    it('should throw error for expired code', async () => {
      supabase.from().select().single.mockResolvedValueOnce({
        data: { code: '123456', expires_at: new Date(Date.now() - 10000).toISOString() },
        error: null
      });

      await expect(verifyCode({
        email: 'test@example.com',
        code: '123456'
      })).rejects.toThrow('Verification code has expired');
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com'
      };
      const mockUserData = {
        isVerified: true,
        isSuspended: false
      };

      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: {} },
        error: null
      });
      supabase.from().select().single.mockResolvedValueOnce({
        data: mockUserData,
        error: null
      });

      const result = await login({
        email: 'test@example.com',
        password: 'Password123'
      });

      expect(result.user).toEqual(mockUser);
      expect(result.userData).toEqual(mockUserData);
    });

    it('should throw error for unverified email', async () => {
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: '123' }, session: {} },
        error: null
      });
      supabase.from().select().single.mockResolvedValueOnce({
        data: { isVerified: false },
        error: null
      });

      await expect(login({
        email: 'test@example.com',
        password: 'Password123'
      })).rejects.toThrow('Email not verified');
    });
  });
}); 