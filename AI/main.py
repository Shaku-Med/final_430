from supabase import create_client
import os
from dotenv import load_dotenv
from recommendation_system import ContentRecommender
from analytics_system import AnalyticsSystem
import uvicorn
import threading
import time
from datetime import datetime
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing required environment variables SUPABASE_URL and/or SUPABASE_KEY")

def update_recommendations():
    try:
        logger.info("Starting recommendation update process")
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        recommender = ContentRecommender(supabase)
        recommender.generate_all_recommendations()
        logger.info("Recommendation update process completed")
    except Exception as e:
        logger.error(f"Error in recommendation update: {str(e)}")

def update_analytics():
    try:
        logger.info("Starting analytics update process")
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        analytics = AnalyticsSystem(supabase)
        analytics.calculate_visitor_stats()
        logger.info("Analytics update process completed")
    except Exception as e:
        logger.error(f"Error in analytics update: {str(e)}")

def scheduler():
    while True:
        try:
            current_hour = datetime.now().hour
            
            # Run recommendations update at specific times
            if current_hour in [2, 14]:  # 2 AM and 2 PM
                update_recommendations()
                
            # Run analytics more frequently
            if current_hour % 4 == 0:  # Every 4 hours
                update_analytics()
                
            # Sleep for an hour before checking again
            time.sleep(3600)
        except Exception as e:
            logger.error(f"Error in scheduler: {str(e)}")
            time.sleep(300)  # Sleep for 5 minutes on error

def main():
    try:
        logger.info("Starting application")
        
        # Initial update of both systems
        update_recommendations()
        update_analytics()
        
        # Start scheduler in background thread
        scheduler_thread = threading.Thread(target=scheduler)
        scheduler_thread.daemon = True
        scheduler_thread.start()
        
        # Start API server
        logger.info("Starting API server")
        uvicorn.run("api:app", host="0.0.0.0", port=8000)
    except Exception as e:
        logger.error(f"Critical error in main application: {str(e)}")

if __name__ == '__main__':
    main()