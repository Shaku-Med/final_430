<!--This read me was written by AI I just gave it the code idea so it can explain it better.-->

# Content Recommendation System

A machine learning-based recommendation system for videos, events, and projects using PyTorch and FastAPI.

## Features

- **Personalized Recommendations**: Uses neural networks to generate tailored recommendations for users
- **Content Similarity**: Identifies similar content based on text similarity using TF-IDF and cosine similarity
- **Visitor Analytics**: Tracks user engagement and predicts future trends
- **REST API**: Provides easy integration with web and mobile applications
- **Scheduled Updates**: Automatically refreshes recommendations and analytics

## Components

- `recommendation_system.py`: Neural network recommendation model
- `analytics_system.py`: Analytics and prediction system
- `api.py`: FastAPI-based REST API
- `main.py`: Main application service with background tasks
- `test_recommendation.py`: Unit tests

## Tech Stack

- **PyTorch**: Machine learning framework for recommendation models
- **FastAPI**: High-performance API framework
- **Supabase**: PostgreSQL database with API integration
- **scikit-learn**: ML tools for text similarity and visitor prediction
- **pandas**: Data manipulation and analysis

## Setup

### Prerequisites

- Python 3.9+
- PostgreSQL database (Supabase recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/content-recommendation-system.git
cd content-recommendation-system
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

4. Initialize the database:
```bash
psql -U postgres -d your_database -f database_schema.sql
```

## Usage

### Start the API Server

```bash
python main.py
```

This will:
- Initialize the recommendation and analytics systems
- Start the background scheduler for updates
- Launch the FastAPI server on http://localhost:8000

### API Endpoints

- `GET /recommendations/{user_id}`: Get personalized recommendations for a user
- `GET /recommendations/{user_id}/{entity_type}`: Get specific type recommendations
- `GET /related/{entity_type}/{entity_id}`: Get similar content
- `GET /trending/{entity_type}`: Get trending content
- `GET /predict/{entity_type}/{entity_id}`: Predict future engagement
- `GET /engagement/{user_id}`: Get user engagement metrics
- `POST /trigger-update`: Manually trigger system updates

### Run Tests

```bash
python -m unittest test_recommendation.py
```

## Database Schema

The system relies on the following tables:
- `users`: User information
- `videos`: Video content
- `events`: Event information
- `projects`: Project details
- `video_interactions`: User interactions with videos
- `event_participants`: User participation in events
- `project_members`: User membership in projects
- `suggestions`: Generated recommendations
- `status`: Engagement analytics

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request