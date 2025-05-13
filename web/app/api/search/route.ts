import { NextResponse } from 'next/server';
import db from '@/app/Database/Supabase/Base1';
import IsAuth from '@/app/Auth/IsAuth/IsAuth';

interface SearchResult {
  id: string;
  title: string;
  type: 'project' | 'team' | 'document' | 'task' | 'video' | 'event' | 'user';
  description?: string;
  score: number;
  metadata?: Record<string, any>;
}

interface Task {
  task_id: string;
  title: string;
  description: string | null;
  tags: string[];
  privacy: string;
  user_id: string;
  assignee: string;
}

interface AuthUser {
  user_id: string;
  email: string;
  name: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Get authenticated user
    const user = await IsAuth() as AuthUser;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: SearchResult[] = [];

    // Search across multiple tables in parallel
    const searchPromises = [
      // Search tasks
      db.from('tasks')
        .select('task_id, title, description, tags, privacy, user_id, assignee')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .or(`privacy.eq.public,privacy.eq.team`)
        .or(`user_id.eq.${user.user_id},assignee.eq.${user.user_id}`)
        .limit(5)
        .then(data => data.data?.map((task: Task) => ({
          id: task.task_id,
          title: task.title,
          type: 'task' as const,
          description: task.description,
          score: calculateRelevanceScore(task.title, task.description, query),
          metadata: { 
            tags: task.tags,
            privacy: task.privacy,
            isAssigned: task.assignee === user.user_id,
            isCreated: task.user_id === user.user_id
          }
        }))),

      // Search projects
      db.from('projects')
        .select('id, title, description, status, privacy')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .or(`privacy.eq.public,privacy.eq.team`)
        .limit(5)
        .then(data => data.data?.map(project => ({
          id: project.id,
          title: project.title,
          type: 'project' as const,
          description: project.description,
          score: calculateRelevanceScore(project.title, project.description, query),
          metadata: { status: project.status, privacy: project.privacy }
        }))),

      // Search videos
      db.from('videos')
        .select('id, title, description, privacy')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .or(`privacy.eq.public,privacy.eq.team`)
        .limit(5)
        .then(data => data.data?.map(video => ({
          id: video.id,
          title: video.title,
          type: 'video' as const,
          description: video.description,
          score: calculateRelevanceScore(video.title, video.description, query),
          metadata: { privacy: video.privacy }
        }))),

      // Search users (only public profiles)
      db.from('users')
        .select(`
          user_id, 
          name, 
          firstname, 
          lastname, 
          privacy,
          profile,
          bio,
          followers!followers_follower_id_fkey(follower_id),
          followers_count:followers!followers_follower_id_fkey(count)
        `)
        .or(`name.ilike.%${query}%,firstname.ilike.%${query}%,lastname.ilike.%${query}%`)
        .eq('privacy', 'public')
        .limit(5)
        .then(data => data.data?.map(user => ({
          id: user.user_id,
          title: `${user.firstname} ${user.lastname}`,
          type: 'user' as const,
          description: user.bio || '',
          score: calculateRelevanceScore(user.name, `${user.firstname} ${user.lastname}`, query),
          metadata: { 
            privacy: user.privacy,
            firstname: user.firstname,
            lastname: user.lastname,
            profile: user.profile,
            bio: user.bio,
            isFollowing: user.followers?.some((f: any) => f.follower_id === user.user_id) || false,
            followerCount: user.followers_count || 0
          }
        }))),

      // Search events (only public events)
      db.from('event_participants')
        .select('event_id, events!inner(title, description, privacy)')
        .or(`events.title.ilike.%${query}%,events.description.ilike.%${query}%`)
        .or(`events.privacy.eq.public,events.privacy.eq.team`)
        .limit(5)
        .then(data => data.data?.map(event => ({
          id: event.event_id,
          title: event.events[0].title,
          type: 'event' as const,
          description: event.events[0].description,
          score: calculateRelevanceScore(event.events[0].title, event.events[0].description, query),
          metadata: { privacy: event.events[0].privacy }
        })))
    ];

    // Wait for all searches to complete
    const searchResults = await Promise.all(searchPromises);
    
    // Combine and sort results by relevance score
    const allResults = searchResults
      .flat()
      .filter((result): result is NonNullable<typeof result> => result !== undefined)
      .sort((a, b) => b.score - a.score) as SearchResult[];

    // Apply graph-based ranking
    const rankedResults = await applyGraphRanking(allResults, (user as any).user_id);

    return NextResponse.json({ results: rankedResults });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateRelevanceScore(title: string, description: string | null, query: string): number {
  let score = 0;
  
  // Title matches are more important
  if (title.toLowerCase().includes(query)) {
    score += 2;
  }
  
  // Description matches
  if (description?.toLowerCase().includes(query)) {
    score += 1;
  }
  
  // Exact matches get bonus points
  if (title.toLowerCase() === query) {
    score += 3;
  }
  
  return score;
}

async function applyGraphRanking(results: SearchResult[], userId: string): Promise<SearchResult[]> {
  // Get user's interaction history
  const { data: interactions } = await db
    .from('video_interactions')
    .select('video_id, interaction_type')
    .eq('user_id', userId);

  // Get user's task assignments
  const { data: tasks } = await db
    .from('tasks')
    .select('task_id')
    .eq('assignee', userId);

  // Get user's event participations
  const { data: events } = await db
    .from('event_participants')
    .select('event_id')
    .eq('user_id', userId);

  // Create a map of user's interactions
  const userInteractions = new Map<string, number>();
  
  // Add video interactions
  interactions?.forEach(interaction => {
    userInteractions.set(interaction.video_id, (userInteractions.get(interaction.video_id) || 0) + 1);
  });

  // Add task assignments
  tasks?.forEach(task => {
    userInteractions.set(task.task_id, (userInteractions.get(task.task_id) || 0) + 2);
  });

  // Add event participations
  events?.forEach(event => {
    userInteractions.set(event.event_id, (userInteractions.get(event.event_id) || 0) + 1.5);
  });

  // Apply graph-based ranking
  return results.map(result => {
    const interactionScore = userInteractions.get(result.id) || 0;
    return {
      ...result,
      score: result.score * (1 + (interactionScore * 0.2)) // Boost score based on user interactions
    };
  }).sort((a, b) => b.score - a.score);
} 