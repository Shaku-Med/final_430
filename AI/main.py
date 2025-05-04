from supabase import create_client
import os
from dotenv import load_dotenv
from recommendation_model import RecommenderSystem
from visitor_analytics import VisitorAnalytics

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    visitor_analytics = VisitorAnalytics(supabase)
    visitor_analytics.calculate_visitor_stats()
    
    recommender = RecommenderSystem(supabase)
    interactions = recommender.prepare_data()
    recommender.train_model(interactions)
    
    users = supabase.table('users').select('id').execute()
    for user in users.data:
        suggestions = recommender.generate_suggestions(user['id'])
        recommender.save_suggestions(user['id'], suggestions)

if __name__ == '__main__':
    main() 