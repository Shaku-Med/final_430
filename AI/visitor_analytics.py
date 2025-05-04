from datetime import datetime, timedelta
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import uuid
from datetime import timezone

class VisitorAnalytics:
    def __init__(self, supabase_client):
        self.client = supabase_client
        
    def calculate_visitor_stats(self):
        two_months_ago = datetime.now(timezone.utc) - timedelta(days=60)
        
        events = self.client.table('event_participants').select('*').execute()
        projects = self.client.table('project_members').select('*').execute()
        
        event_stats = {}
        project_stats = {}
        
        for event in events.data:
            if datetime.fromisoformat(event['joined_at']) >= two_months_ago:
                event_id = event['event_id']
                event_stats[event_id] = event_stats.get(event_id, 0) + 1
                
        for project in projects.data:
            if datetime.fromisoformat(project['joined_at']) >= two_months_ago:
                project_id = project['project_id']
                project_stats[project_id] = project_stats.get(project_id, 0) + 1
                
        self.save_stats(event_stats, 'event')
        self.save_stats(project_stats, 'project')
        
    def save_stats(self, stats, entity_type):
        today = datetime.now().date()
        
        for entity_id, count in stats.items():
            self.client.table('status').insert({
                'id': str(uuid.uuid4()),
                'entity_type': entity_type,
                'entity_id': entity_id,
                'visitor_count': count,
                'date': today.isoformat()
            }).execute()
            
    def predict_future_visitors(self, entity_type, entity_id):
        historical_data = self.client.table('status').select('*').eq('entity_type', entity_type).eq('entity_id', entity_id).execute()
        
        if not historical_data.data:
            return 0
            
        df = pd.DataFrame(historical_data.data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        X = pd.get_dummies(df['date'].dt.dayofweek)
        y = df['visitor_count']
        
        model = RandomForestRegressor()
        model.fit(X, y)
        
        future_dates = pd.date_range(start=datetime.now(), periods=7)
        future_X = pd.get_dummies(future_dates.dayofweek)
        
        predictions = model.predict(future_X)
        return predictions.mean() 