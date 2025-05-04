from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import datetime
from recommendation_model import EntityRecommender
import httpx
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

# Check for required environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing required environment variables SUPABASE_URL and/or SUPABASE_KEY")

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
recommender = EntityRecommender(supabase)

async def verify_request(request: Request):
    try:
        cookies = request.cookies
        headers = dict(request.headers)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "YOUR_VERIFICATION_API_URL",
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

@app.get("/suggestions/{user_id}")
@limiter.limit("100/minute")
async def get_suggestions(request: Request, user_id: str):
    try:
        suggestions = supabase.table('suggestions').select('*').eq('user_id', user_id).gt('expires_at', datetime.now().isoformat()).execute()
        return suggestions.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/suggestions/{user_id}/videos")
@limiter.limit("100/minute")
async def get_video_suggestions(request: Request, user_id: str):
    try:
        suggestions = supabase.table('suggestions').select('*').eq('user_id', user_id).eq('entity_type', 'video').gt('expires_at', datetime.now().isoformat()).execute()
        return suggestions.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/suggestions/{user_id}/events")
@limiter.limit("100/minute")
async def get_event_suggestions(request: Request, user_id: str):
    try:
        suggestions = supabase.table('suggestions').select('*').eq('user_id', user_id).eq('entity_type', 'event').gt('expires_at', datetime.now().isoformat()).execute()
        return suggestions.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/suggestions/{user_id}/projects")
@limiter.limit("100/minute")
async def get_project_suggestions(request: Request, user_id: str):
    try:
        suggestions = supabase.table('suggestions').select('*').eq('user_id', user_id).eq('entity_type', 'project').gt('expires_at', datetime.now().isoformat()).execute()
        return suggestions.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/related/{video_id}")
@limiter.limit("100/minute")
async def get_related_content(request: Request, video_id: str):
    try:
        related = recommender.find_similar_videos_for(video_id)
        return related
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/related/{video_id}/videos")
@limiter.limit("100/minute")
async def get_related_videos(request: Request, video_id: str):
    try:
        suggestions = supabase.table('suggestions').select('*').eq('user_id', video_id).eq('entity_type', 'related_video').gt('expires_at', datetime.now().isoformat()).execute()
        return suggestions.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 