from supabase import create_client
import os
from dotenv import load_dotenv
from recommendation_model import EntityRecommender
from visitor_analytics import VisitorAnalytics
import uvicorn
import threading
import time
from datetime import datetime

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def update_suggestions():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    recommender = EntityRecommender(supabase)
    interactions = recommender.load_user_data()
    
    entity_interactions = {
        'videos': interactions['video_interactions'],
        'events': interactions['event_participants'],
        'projects': interactions['project_members']
    }
    
    for entity_type, interaction_data in entity_interactions.items():
        recommender.train_recommender(interaction_data, entity_type)
        
    users = supabase.table('users').select('id').execute()
    for user in users.data:
        for entity_type in ['videos', 'events', 'projects']:
            recommendations = recommender.get_user_recommendations(user['id'], entity_type)
            recommender.save_user_recommendations(user['id'], recommendations, entity_type)
        
    videos = supabase.table('videos').select('id').execute()
    for video in videos.data:
        similar = recommender.find_similar_entities_for(video['id'], 'videos')
        recommender.save_similar_entities(video['id'], similar, 'videos')

def scheduler():
    while True:
        update_suggestions()
        time.sleep(3600)

def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    visitor_analytics = VisitorAnalytics(supabase)
    visitor_analytics.calculate_visitor_stats()
    
    scheduler_thread = threading.Thread(target=scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    
    uvicorn.run("api:app", host="0.0.0.0", port=8000)

if __name__ == '__main__':
    main() 