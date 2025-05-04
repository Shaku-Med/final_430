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
    recommender.train_recommender(interactions)
    
    users = supabase.table('users').select('id').execute()
    for user in users.data:
        recommendations = recommender.get_user_recommendations(user['id'])
        recommender.save_user_recommendations(user['id'], recommendations)
        
    videos = supabase.table('videos').select('id').execute()
    for video in videos.data:
        similar = recommender.find_similar_videos_for(video['id'])
        recommender.save_similar_videos(video['id'], similar)

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