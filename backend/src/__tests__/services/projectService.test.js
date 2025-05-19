const projectService = require('../../services/projectService');
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

describe('Project Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    const mockProject = {
      name: 'Test Project',
      description: 'Test Description',
      startDate: '2024-03-20T00:00:00Z',
      endDate: '2024-04-20T00:00:00Z',
      status: 'pending'
    };

    it('should create a project successfully', async () => {
      const mockResponse = { ...mockProject, id: '123', created_by: 'user123' };
      supabase.from().insert().select().single.mockResolvedValueOnce({ data: mockResponse, error: null });

      const result = await projectService.createProject('user123', mockProject);
      expect(result).toEqual(mockResponse);
      expect(supabase.from).toHaveBeenCalledWith('projects');
    });

    it('should throw error when project creation fails', async () => {
      supabase.from().insert().select().single.mockResolvedValueOnce({ data: null, error: new Error('DB Error') });

      await expect(projectService.createProject('user123', mockProject)).rejects.toThrow('DB Error');
    });
  });

  describe('listProjects', () => {
    it('should list projects with pagination', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1' },
        { id: '2', name: 'Project 2' }
      ];
      supabase.from().select().order().range.mockResolvedValueOnce({ data: mockProjects, error: null });

      const result = await projectService.listProjects({ limit: 10, offset: 0 });
      expect(result).toEqual(mockProjects);
      expect(supabase.from).toHaveBeenCalledWith('projects');
    });

    it('should throw error when listing projects fails', async () => {
      supabase.from().select().order().range.mockResolvedValueOnce({ data: null, error: new Error('DB Error') });

      await expect(projectService.listProjects({ limit: 10, offset: 0 })).rejects.toThrow('DB Error');
    });
  });

  describe('getProjectById', () => {
    it('should get project by id successfully', async () => {
      const mockProject = { id: '123', name: 'Test Project' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockProject, error: null });

      const result = await projectService.getProjectById('123');
      expect(result).toEqual(mockProject);
      expect(supabase.from).toHaveBeenCalledWith('projects');
    });

    it('should throw error when project not found', async () => {
      supabase.from().select().eq().single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await expect(projectService.getProjectById('123')).rejects.toThrow('Project not found');
    });
  });

  describe('updateProject', () => {
    const mockUpdates = {
      name: 'Updated Project',
      description: 'Updated Description',
      status: 'in_progress'
    };

    it('should update project successfully', async () => {
      const mockResponse = { id: '123', ...mockUpdates };
      supabase.from().update().eq().select().single.mockResolvedValueOnce({ data: mockResponse, error: null });

      const result = await projectService.updateProject('123', mockUpdates);
      expect(result).toEqual(mockResponse);
      expect(supabase.from).toHaveBeenCalledWith('projects');
    });

    it('should throw error when update fails', async () => {
      supabase.from().update().eq().select().single.mockResolvedValueOnce({ data: null, error: new Error('DB Error') });

      await expect(projectService.updateProject('123', mockUpdates)).rejects.toThrow('DB Error');
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      const mockProject = { id: '123', name: 'Test Project' };
      supabase.from().select().eq().single.mockResolvedValueOnce({ data: mockProject, error: null });
      supabase.from().delete().eq().mockResolvedValueOnce({ error: null });

      const result = await projectService.deleteProject('123');
      expect(result).toEqual(mockProject);
      expect(supabase.from).toHaveBeenCalledWith('projects');
    });

    it('should throw error when project not found', async () => {
      supabase.from().select().eq().single.mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      await expect(projectService.deleteProject('123')).rejects.toThrow('Project not found');
    });
  });

  describe('Project Members', () => {
    describe('addProjectMember', () => {
      it('should add project member successfully', async () => {
        const mockMember = { project_id: '123', user_id: 'user123', role: 'member' };
        supabase.from().insert().select().single.mockResolvedValueOnce({ data: mockMember, error: null });

        const result = await projectService.addProjectMember('123', 'user123', 'member');
        expect(result).toEqual(mockMember);
        expect(supabase.from).toHaveBeenCalledWith('project_members');
      });
    });

    describe('removeProjectMember', () => {
      it('should remove project member successfully', async () => {
        supabase.from().delete().eq().eq().mockResolvedValueOnce({ error: null });

        await expect(projectService.removeProjectMember('123', 'user123')).resolves.not.toThrow();
        expect(supabase.from).toHaveBeenCalledWith('project_members');
      });
    });

    describe('listProjectMembers', () => {
      it('should list project members successfully', async () => {
        const mockMembers = [
          { user_id: 'user123', role: 'member', profiles: { id: 'user123', username: 'test' } }
        ];
        supabase.from().select().eq().mockResolvedValueOnce({ data: mockMembers, error: null });

        const result = await projectService.listProjectMembers('123');
        expect(result).toEqual(mockMembers);
        expect(supabase.from).toHaveBeenCalledWith('project_members');
      });
    });
  });
}); 