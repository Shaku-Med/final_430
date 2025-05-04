from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import datetime
from recommendation_system import ContentRecommender
from analytics_system import AnalyticsSystem
import httpx
import threading
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

load_dotenv()

# Check for required environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
VERIFYING_API = os.getenv('VERIFYING_API')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing required environment variables SUPABASE_URL and/or SUPABASE_KEY")

app = FastAPI(title="Content Recommendation API")
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def verify_request(request: Request):
    try:
        cookies = request.cookies
        headers = dict(request.headers)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                VERIFYING_API | "",
                json={"cookies": cookies, "headers": headers}
            )
            
            if response.status_code != 200:
                return False
                
            return response.json().get("verified", False)
    except Exception:
        return False

@app.middleware("http")
async def verify_middleware(request: Request, call_next):
    if not await verify_request(request):
        return JSONResponse(
            status_code=404,
            content={"detail": "Not found"}
        )
    return await call_next(request)

# Database connection
def get_db():
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# Recommendation system
def get_recommender(db=Depends(get_db)):
    return ContentRecommender(db)

# Analytics system
def get_analytics(db=Depends(get_db)):
    return AnalyticsSystem(db)

class RecommendationResponse(BaseModel):
    entity_id: str
    entity_type: str
    score: float
    title: Optional[str] = None
    description: Optional[str] = None

class TrendingResponse(BaseModel):
    entity_id: str
    total_engagement: int
    title: Optional[str] = None
    description: Optional[str] = None

class PredictionResponse(BaseModel):
    date: str
    predicted_count: int

class EngagementResponse(BaseModel):
    user_id: str
    video_interactions: int
    event_participations: int
    project_memberships: int
    engagement_score: float

@app.get("/", response_model=Dict[str, str])
def root():
    return {"status": "online", "message": "Content Recommendation API is running"}

@app.get("/recommendations/{user_id}", response_model=Dict[str, List[RecommendationResponse]])
@limiter.limit("60/minute")
async def get_recommendations(
    request: Request, 
    user_id: str,
    recommender: ContentRecommender = Depends(get_recommender),
    db=Depends(get_db)
):
    try:
        results = {}
        for entity_type in ['videos', 'events', 'projects']:
            suggestions = db.table('suggestions').select('*')\
                .eq('user_id', user_id)\
                .eq('entity_type', entity_type)\
                .gt('expires_at', datetime.now().isoformat())\
                .execute()
                
            if suggestions.data:
                enhanced_suggestions = []
                for suggestion in suggestions.data:
                    entity_details = db.table(entity_type).select('title,description')\
                        .eq('id', suggestion['entity_id'])\
                        .execute()
                    
                    enhanced_suggestion = {
                        'entity_id': suggestion['entity_id'],
                        'entity_type': suggestion['entity_type'],
                        'score': suggestion['score']
                    }
                    
                    if entity_details.data:
                        enhanced_suggestion['title'] = entity_details.data[0].get('title')
                        enhanced_suggestion['description'] = entity_details.data[0].get('description')
                        
                    enhanced_suggestions.append(enhanced_suggestion)
                
                results[entity_type] = enhanced_suggestions
            else:
                # Generate new recommendations if none exist
                new_recommendations = recommender.get_user_recommendations(user_id, entity_type)
                recommender.save_user_recommendations(user_id, new_recommendations, entity_type)
                
                enhanced_recommendations = []
                for entity_id, score in new_recommendations:
                    entity_details = db.table(entity_type).select('title,description')\
                        .eq('id', entity_id)\
                        .execute()
                    
                    enhanced_recommendation = {
                        'entity_id': entity_id,
                        'entity_type': entity_type,
                        'score': score
                    }
                    
                    if entity_details.data:
                        enhanced_recommendation['title'] = entity_details.data[0].get('title')
                        enhanced_recommendation['description'] = entity_details.data[0].get('description')
                        
                    enhanced_recommendations.append(enhanced_recommendation)
                
                results[entity_type] = enhanced_recommendations
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recommendations/{user_id}/{entity_type}", response_model=List[RecommendationResponse])
@limiter.limit("100/minute")
async def get_entity_recommendations(
    request: Request, 
    user_id: str, 
    entity_type: str,
    recommender: ContentRecommender = Depends(get_recommender),
    db=Depends(get_db)
):
    try:
        if entity_type not in ['videos', 'events', 'projects']:
            raise HTTPException(status_code=400, detail="Invalid entity type")
            
        suggestions = db.table('suggestions').select('*')\
            .eq('user_id', user_id)\
            .eq('entity_type', entity_type)\
            .gt('expires_at', datetime.now().isoformat())\
            .execute()
            
        if suggestions.data:
            enhanced_suggestions = []
            for suggestion in suggestions.data:
                entity_details = db.table(entity_type).select('title,description')\
                    .eq('id', suggestion['entity_id'])\
                    .execute()
                
                enhanced_suggestion = {
                    'entity_id': suggestion['entity_id'],
                    'entity_type': suggestion['entity_type'],
                    'score': suggestion['score']
                }
                
                if entity_details.data:
                    enhanced_suggestion['title'] = entity_details.data[0].get('title')
                    enhanced_suggestion['description'] = entity_details.data[0].get('description')
                    
                enhanced_suggestions.append(enhanced_suggestion)
            
            return enhanced_suggestions
        else:
            # Generate new recommendations if none exist
            new_recommendations = recommender.get_user_recommendations(user_id, entity_type)
            recommender.save_user_recommendations(user_id, new_recommendations, entity_type)
            
            enhanced_recommendations = []
            for entity_id, score in new_recommendations:
                entity_details = db.table(entity_type).select('title,description')\
                    .eq('id', entity_id)\
                    .execute()
                
                enhanced_recommendation = {
                    'entity_id': entity_id,
                    'entity_type': entity_type,
                    'score': score
                }
                
                if entity_details.data:
                    enhanced_recommendation['title'] = entity_details.data[0].get('title')
                    enhanced_recommendation['description'] = entity_details.data[0].get('description')
                    
                enhanced_recommendations.append(enhanced_recommendation)
            
            return enhanced_recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/related/{entity_type}/{entity_id}", response_model=List[RecommendationResponse])
@limiter.limit("100/minute")
async def get_related_entities(
    request: Request, 
    entity_type: str, 
    entity_id: str,
    user_id: Optional[str] = None,
    recommender: ContentRecommender = Depends(get_recommender),
    db=Depends(get_db)
):
    try:
        if entity_type not in ['videos', 'events', 'projects']:
            raise HTTPException(status_code=400, detail="Invalid entity type")
            
        singular_type = entity_type[:-1]
        
        # If no user_id provided, get the first user from the database
        if not user_id:
            users = db.table('users').select('id').limit(1).execute()
            if users.data:
                user_id = users.data[0]['id']
            else:
                raise HTTPException(status_code=404, detail="No users found in database")
        
        # Get suggestions for this entity, looking for related entities
        suggestions = db.table('suggestions').select('*')\
            .eq('user_id', user_id)\
            .eq('entity_type', f'related_{singular_type}')\
            .eq('original_entity_id', entity_id)\
            .gt('expires_at', datetime.now().isoformat())\
            .execute()
            
        if not suggestions.data:
            # Try without the original_entity_id field (for compatibility)
            query = db.table('suggestions')\
                .select('*')\
                .eq('user_id', user_id)\
                .eq('entity_type', f'related_{singular_type}')\
                .gt('expires_at', datetime.now().isoformat())
                
            suggestions = query.execute()
            
        if suggestions.data:
            # Process existing suggestions
            enhanced_suggestions = []
            for suggestion in suggestions.data:
                # Get the entity ID from the suggestion
                similar_entity_id = suggestion['entity_id']
                
                # Get details for the entity
                entity_details = db.table(entity_type).select('title,description')\
                    .eq('id', similar_entity_id)\
                    .execute()
                
                enhanced_suggestion = {
                    'entity_id': similar_entity_id,
                    'entity_type': entity_type,
                    'score': suggestion['score']
                }
                
                if entity_details.data:
                    enhanced_suggestion['title'] = entity_details.data[0].get('title')
                    enhanced_suggestion['description'] = entity_details.data[0].get('description')
                    
                enhanced_suggestions.append(enhanced_suggestion)
            
            return enhanced_suggestions
        else:
            # Generate new recommendations if none exist
            similar_entities = recommender.find_similar_entities_for(entity_id, entity_type)
            recommender.save_similar_entities(entity_id, similar_entities, entity_type)
            
            enhanced_recommendations = []
            for similar_id, score in similar_entities:
                entity_details = db.table(entity_type).select('title,description')\
                    .eq('id', similar_id)\
                    .execute()
                
                enhanced_recommendation = {
                    'entity_id': similar_id,
                    'entity_type': entity_type,
                    'score': score
                }
                
                if entity_details.data:
                    enhanced_recommendation['title'] = entity_details.data[0].get('title')
                    enhanced_recommendation['description'] = entity_details.data[0].get('description')
                    
                enhanced_recommendations.append(enhanced_recommendation)
            
            return enhanced_recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/trending/{entity_type}", response_model=List[TrendingResponse])
@limiter.limit("100/minute")
async def get_trending_entities(
    request: Request, 
    entity_type: str,
    days: int = 7,
    limit: int = 5,
    analytics: AnalyticsSystem = Depends(get_analytics),
    db=Depends(get_db)
):
    try:
        if entity_type not in ['event', 'project', 'video']:
            raise HTTPException(status_code=400, detail="Invalid entity type")
            
        trending = analytics.get_trending_entities(entity_type, days, limit)
        
        enhanced_trending = []
        for item in trending:
            entity_details = db.table(f"{entity_type}s").select('title,description')\
                .eq('id', item['entity_id'])\
                .execute()
                
            enhanced_item = {
                'entity_id': item['entity_id'],
                'total_engagement': item['total_engagement']
            }
            
            if entity_details.data:
                enhanced_item['title'] = entity_details.data[0].get('title')
                enhanced_item['description'] = entity_details.data[0].get('description')
                
            enhanced_trending.append(enhanced_item)
            
        return enhanced_trending
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predict/{entity_type}/{entity_id}", response_model=List[PredictionResponse])
@limiter.limit("50/minute")
async def predict_future_engagement(
    request: Request, 
    entity_type: str, 
    entity_id: str,
    days: int = 7,
    analytics: AnalyticsSystem = Depends(get_analytics)
):
    try:
        if entity_type not in ['event', 'project', 'video']:
            raise HTTPException(status_code=400, detail="Invalid entity type")
            
        predictions = analytics.predict_future_engagement(entity_type, entity_id, days)
        if not predictions:
            return []
            
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/engagement/{user_id}", response_model=EngagementResponse)
@limiter.limit("100/minute")
async def get_user_engagement(
    request: Request, 
    user_id: str,
    analytics: AnalyticsSystem = Depends(get_analytics)
):
    try:
        engagement = analytics.calculate_user_engagement(user_id)
        return engagement
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/trigger-update")
@limiter.limit("10/hour")
async def trigger_update(
    request: Request,
    recommender: ContentRecommender = Depends(get_recommender),
    analytics: AnalyticsSystem = Depends(get_analytics)
):
    try:
        # Update recommendations in background thread
        recommendation_thread = threading.Thread(target=recommender.generate_all_recommendations)
        recommendation_thread.daemon = True
        recommendation_thread.start()
        
        # Update analytics
        analytics_thread = threading.Thread(target=analytics.calculate_visitor_stats)
        analytics_thread.daemon = True
        analytics_thread.start()
        
        return {"status": "update_triggered", "message": "Update processes started in background"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)