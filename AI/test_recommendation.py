import unittest
from supabase import create_client
import os
from dotenv import load_dotenv
from recommendation_model import VideoRecommender
from datetime import datetime, timedelta
import uuid

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

class TestRecommendationSystem(unittest.TestCase):
    def setUp(self):
        self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.recommender = VideoRecommender(self.supabase)
        self.test_user_id = str(uuid.uuid4())
        self.test_video_id = str(uuid.uuid4())
        
        self.supabase.table('users').insert({
            'id': self.test_user_id,
            'email': 'test@example.com'
        }).execute()
        
        self.supabase.table('videos').insert({
            'id': self.test_video_id,
            'user_id': self.test_user_id,
            'title': 'Python Machine Learning Tutorial',
            'description': 'Learn how to build ML models in Python',
            'url': 'https://example.com/video1'
        }).execute()
        
        self.supabase.table('video_interactions').insert({
            'id': str(uuid.uuid4()),
            'user_id': self.test_user_id,
            'video_id': self.test_video_id,
            'interaction_type': 'like'
        }).execute()
        
    def test_user_suggestions(self):
        interactions = self.recommender.prepare_data()
        self.recommender.train_model(interactions)
        
        suggestions = self.recommender.generate_suggestions(self.test_user_id)
        self.assertIsNotNone(suggestions)
        self.assertGreater(len(suggestions), 0)
        
    def test_related_content(self):
        interactions = self.recommender.prepare_data()
        self.recommender.train_model(interactions)
        
        related = self.recommender.get_related_content(self.test_video_id)
        self.assertIsNotNone(related)
        self.assertGreater(len(related), 0)
        
    def test_content_similarity(self):
        video2_id = str(uuid.uuid4())
        self.supabase.table('videos').insert({
            'id': video2_id,
            'user_id': self.test_user_id,
            'title': 'Advanced Python ML Techniques',
            'description': 'Deep dive into ML algorithms in Python',
            'url': 'https://example.com/video2'
        }).execute()
        
        interactions = self.recommender.prepare_data()
        self.recommender.train_model(interactions)
        
        related = self.recommender.get_related_content(self.test_video_id)
        found = False
        for related_id, score in related:
            if related_id == video2_id:
                found = True
                break
        self.assertTrue(found)
        
    def test_suggestion_expiration(self):
        interactions = self.recommender.prepare_data()
        self.recommender.train_model(interactions)
        
        suggestions = self.recommender.generate_suggestions(self.test_user_id)
        self.recommender.save_suggestions(self.test_user_id, suggestions)
        
        db_suggestions = self.supabase.table('suggestions').select('*').eq('user_id', self.test_user_id).execute()
        self.assertGreater(len(db_suggestions.data), 0)
        
        for suggestion in db_suggestions.data:
            expires_at = datetime.fromisoformat(suggestion['expires_at'])
            self.assertGreater(expires_at, datetime.now())
            
    def tearDown(self):
        self.supabase.table('suggestions').delete().eq('user_id', self.test_user_id).execute()
        self.supabase.table('video_interactions').delete().eq('user_id', self.test_user_id).execute()
        self.supabase.table('videos').delete().eq('user_id', self.test_user_id).execute()
        self.supabase.table('users').delete().eq('id', self.test_user_id).execute()

if __name__ == '__main__':
    unittest.main() 