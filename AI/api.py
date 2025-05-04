from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import datetime
from recommendation_model import VideoRecommender

load_dotenv()

# Check for required environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing required environment variables SUPABASE_URL and/or SUPABASE_KEY")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
recommender = VideoRecommender(supabase)

@app.get("/suggestions/{user_id}")
async def get_suggestions(user_id: str):
    try:
        suggestions = supabase.table('suggestions').select('*').eq('user_id', user_id).gt('expires_at', datetime.now().isoformat()).execute()
        return suggestions.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/suggestions/{user_id}/videos")
async def get_video_suggestions(user_id: str):
    try:
        suggestions = supabase.table('suggestions').select('*').eq('user_id', user_id).eq('entity_type', 'video').gt('expires_at', datetime.now().isoformat()).execute()
        return suggestions.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/suggestions/{user_id}/events")
async def get_event_suggestions(user_id: str):
    try:
        suggestions = supabase.table('suggestions').select('*').eq('user_id', user_id).eq('entity_type', 'event').gt('expires_at', datetime.now().isoformat()).execute()
        return suggestions.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/suggestions/{user_id}/projects")
async def get_project_suggestions(user_id: str):
    try:
        suggestions = supabase.table('suggestions').select('*').eq('user_id', user_id).eq('entity_type', 'project').gt('expires_at', datetime.now().isoformat()).execute()
        return suggestions.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/related/{video_id}")
async def get_related_content(video_id: str):
    try:
        related = recommender.find_similar_videos_for(video_id)
        return related
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/related/{video_id}/videos")
async def get_related_videos(video_id: str):
    try:
        suggestions = supabase.table('suggestions').select('*').eq('user_id', video_id).eq('entity_type', 'related_video').gt('expires_at', datetime.now().isoformat()).execute()
        return suggestions.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 