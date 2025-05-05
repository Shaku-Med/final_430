from datetime import datetime, timedelta
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import uuid

class AnalyticsSystem:
    def __init__(self, database_client):
        self.database = database_client
        
    def calculate_visitor_stats(self):
        events = self.database.table('event_participants').select('*').execute()
        projects = self.database.table('project_members').select('*').execute()
        videos = self.database.table('video_interactions').select('*').execute()
        
        entity_stats = {
            'event': {},
            'project': {},
            'video': {}
        }
        
        for participant in events.data:
            entity_id = participant['event_id']
            entity_stats['event'][entity_id] = entity_stats['event'].get(entity_id, 0) + 1
                
        for member in projects.data:
            entity_id = member['project_id']
            entity_stats['project'][entity_id] = entity_stats['project'].get(entity_id, 0) + 1
                
        for interaction in videos.data:
            entity_id = interaction['video_id']
            entity_stats['video'][entity_id] = entity_stats['video'].get(entity_id, 0) + 1
                
        for entity_type, stats in entity_stats.items():
            self.save_stats(stats, entity_type)
        
    def save_stats(self, stats, entity_type):
        today = datetime.now().date()
        
        for entity_id, count in stats.items():
            self.database.table('status').insert({
                'id': str(uuid.uuid4()),
                'entity_type': entity_type,
                'entity_id': entity_id,
                'visitor_count': count,
                'date': today.isoformat()
            }).execute()
            
    def predict_future_engagement(self, entity_type, entity_id, days=7):
        historical_data = self.database.table('status').select('*')\
            .eq('entity_type', entity_type)\
            .eq('entity_id', entity_id)\
            .execute()
        
        if not historical_data.data or len(historical_data.data) < 3:
            return []
            
        df = pd.DataFrame(historical_data.data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        X = pd.DataFrame({
            'dayofweek': df['date'].dt.dayofweek,
            'day': df['date'].dt.day,
            'month': df['date'].dt.month,
        })
        y = df['visitor_count']
        
        model = RandomForestRegressor(n_estimators=100)
        model.fit(X, y)
        
        future_dates = pd.date_range(start=datetime.now(), periods=days)
        future_X = pd.DataFrame({
            'dayofweek': future_dates.dayofweek,
            'day': future_dates.day,
            'month': future_dates.month,
        })
        
        predictions = model.predict(future_X)
        
        return [
            {
                'date': date.strftime('%Y-%m-%d'),
                'predicted_count': max(0, int(round(count)))
            }
            for date, count in zip(future_dates, predictions)
        ]
        
    def get_trending_entities(self, entity_type, days_back=7, limit=5):
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days_back)
        
        recent_stats = self.database.table('status').select('*')\
            .eq('entity_type', entity_type)\
            .gte('date', start_date.isoformat())\
            .lte('date', end_date.isoformat())\
            .execute()
            
        if not recent_stats.data:
            return []
            
        df = pd.DataFrame(recent_stats.data)
        entity_totals = df.groupby('entity_id')['visitor_count'].sum().reset_index()
        trending = entity_totals.sort_values('visitor_count', ascending=False).head(limit)
        
        return [
            {
                'entity_id': row['entity_id'],
                'total_engagement': int(row['visitor_count'])
            }
            for _, row in trending.iterrows()
        ]
        
    def calculate_user_engagement(self, user_id):
        video_interactions = self.database.table('video_interactions').select('*')\
            .eq('user_id', user_id).execute()
        event_participations = self.database.table('event_participants').select('*')\
            .eq('user_id', user_id).execute()
        project_memberships = self.database.table('project_members').select('*')\
            .eq('user_id', user_id).execute()
            
        engagement_score = len(video_interactions.data) * 1.0 + \
                          len(event_participations.data) * 2.0 + \
                          len(project_memberships.data) * 3.0
                          
        return {
            'user_id': user_id,
            'video_interactions': len(video_interactions.data),
            'event_participations': len(event_participations.data),
            'project_memberships': len(project_memberships.data),
            'engagement_score': engagement_score
        }