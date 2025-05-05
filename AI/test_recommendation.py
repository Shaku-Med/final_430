import unittest
from supabase import create_client
import os
from dotenv import load_dotenv
from recommendation_system import ContentRecommender
from analytics_system import AnalyticsSystem
from datetime import datetime, timedelta
import uuid

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

class TestRecommendationSystem(unittest.TestCase):
    def setUp(self):
        self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.recommender = ContentRecommender(self.supabase)
        self.analytics = AnalyticsSystem(self.supabase)
        
        # Generate unique IDs for test data
        self.test_user_id = str(uuid.uuid4())
        self.test_video_id = str(uuid.uuid4())
        self.test_event_id = str(uuid.uuid4())
        self.test_project_id = str(uuid.uuid4())
        
        # Create test user - using id field directly 
        self.supabase.table('users').insert({
            'id': self.test_user_id,
            'email': f'test_{uuid.uuid4()}@example.com'
        }).execute()
        
        # Create test video
        self.supabase.table('videos').insert({
            'id': self.test_video_id,
            'user_id': self.test_user_id,  # Use the user_id here
            'title': 'Test Video: Python Machine Learning',
            'description': 'A comprehensive tutorial on ML in Python',
            'url': f'https://example.com/video/{uuid.uuid4()}'
        }).execute()
        
        # Create test event
        self.supabase.table('events').insert({
            'id': self.test_event_id,
            'title': 'Test Event: AI Workshop',
            'description': 'Learn about the latest in artificial intelligence',
            'start_date': (datetime.now() + timedelta(days=7)).isoformat(),
            'end_date': (datetime.now() + timedelta(days=7, hours=3)).isoformat()
        }).execute()
        
        # Create test project
        self.supabase.table('projects').insert({
            'id': self.test_project_id,
            'title': 'Test Project: Recommendation Engine',
            'description': 'Building a machine learning recommendation system'
        }).execute()
        
        # Create interactions
        self.supabase.table('video_interactions').insert({
            'id': str(uuid.uuid4()),
            'user_id': self.test_user_id,
            'video_id': self.test_video_id,
            'interaction_type': 'view'
        }).execute()
        
        self.supabase.table('event_participants').insert({
            'id': str(uuid.uuid4()),
            'user_id': self.test_user_id,
            'event_id': self.test_event_id
        }).execute()
        
        self.supabase.table('project_members').insert({
            'id': str(uuid.uuid4()),
            'user_id': self.test_user_id,
            'project_id': self.test_project_id
        }).execute()
        
    def test_load_user_data(self):
        data = self.recommender.load_user_data()
        self.assertIn('video_interactions', data)
        self.assertIn('event_participants', data)
        self.assertIn('project_members', data)
        self.assertGreater(len(self.recommender.user_to_index), 0)
        self.assertGreaterEqual(len(self.recommender.entity_to_index.get('videos', {})), 1)
        self.assertGreaterEqual(len(self.recommender.entity_to_index.get('events', {})), 1)
        self.assertGreaterEqual(len(self.recommender.entity_to_index.get('projects', {})), 1)
        
    def test_recommendations(self):
        data = self.recommender.load_user_data()
        
        # Test video recommendations
        self.recommender.train_recommender(data['video_interactions'], 'videos')
        video_recommendations = self.recommender.get_user_recommendations(self.test_user_id, 'videos')
        self.assertIsInstance(video_recommendations, list)
        
        # Test event recommendations
        self.recommender.train_recommender(data['event_participants'], 'events')
        event_recommendations = self.recommender.get_user_recommendations(self.test_user_id, 'events')
        self.assertIsInstance(event_recommendations, list)
        
        # Test project recommendations
        self.recommender.train_recommender(data['project_members'], 'projects')
        project_recommendations = self.recommender.get_user_recommendations(self.test_user_id, 'projects')
        self.assertIsInstance(project_recommendations, list)
        
    def test_similar_entities(self):
        self.recommender.load_user_data()
        
        # Create similar video
        similar_video_id = str(uuid.uuid4())
        self.supabase.table('videos').insert({
            'id': similar_video_id,
            'user_id': self.test_user_id,  # Use the user_id here
            'title': 'Python ML Advanced Topics',
            'description': 'Advanced tutorial on ML in Python programming language',
            'url': f'https://example.com/video/{uuid.uuid4()}'
        }).execute()
        
        # Reload entity data to capture the new video
        self.recommender.load_entity_data('videos')
        
        # Check if similar videos are found
        similar_videos = self.recommender.find_similar_entities_for(self.test_video_id, 'videos')
        
        # Even if no match found, the function should return an empty list, not error
        self.assertIsInstance(similar_videos, list)
        
    def test_visitor_analytics(self):
        # Test visitor stats calculation
        self.analytics.calculate_visitor_stats()
        
        # Test trending entities
        trending_videos = self.analytics.get_trending_entities('video')
        self.assertIsInstance(trending_videos, list)
        
        trending_events = self.analytics.get_trending_entities('event')
        self.assertIsInstance(trending_events, list)
        
        trending_projects = self.analytics.get_trending_entities('project')
        self.assertIsInstance(trending_projects, list)
        
    def test_user_engagement(self):
        engagement = self.analytics.calculate_user_engagement(self.test_user_id)
        self.assertEqual(engagement['user_id'], self.test_user_id)
        self.assertEqual(engagement['video_interactions'], 1)
        self.assertEqual(engagement['event_participations'], 1)
        self.assertEqual(engagement['project_memberships'], 1)
        self.assertGreater(engagement['engagement_score'], 0)
        
    def tearDown(self):
        # Clean up all test data
        self.supabase.table('suggestions').delete().eq('user_id', self.test_user_id).execute()
        self.supabase.table('video_interactions').delete().eq('user_id', self.test_user_id).execute()
        self.supabase.table('event_participants').delete().eq('user_id', self.test_user_id).execute()
        self.supabase.table('project_members').delete().eq('user_id', self.test_user_id).execute()
        self.supabase.table('videos').delete().eq('user_id', self.test_user_id).execute()
        self.supabase.table('events').delete().eq('id', self.test_event_id).execute()
        self.supabase.table('projects').delete().eq('id', self.test_project_id).execute()
        self.supabase.table('users').delete().eq('id', self.test_user_id).execute()
        
if __name__ == '__main__':
    unittest.main()