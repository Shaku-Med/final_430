# AI Recommendation and Analytics System

This system provides two main functionalities:
1. Visitor analytics for events and projects
2. Personalized recommendations for videos, events, and projects

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

3. Run the database migrations from `database_schema.sql`

## Usage

Run the main script:
```bash
python main.py
```

This will:
- Calculate visitor statistics for the past 2 months
- Train the recommendation model
- Generate and save personalized suggestions for all users

## Components

- `recommendation_model.py`: Neural network for generating personalized recommendations
- `visitor_analytics.py`: Analytics system for tracking and predicting visitor counts
- `main.py`: Main script that orchestrates the entire system 