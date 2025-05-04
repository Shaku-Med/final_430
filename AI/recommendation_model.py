import torch
import torch.nn as nn
import numpy as np
from datetime import datetime, timedelta
import uuid

class RecommendationModel(nn.Module):
    def __init__(self, num_users, num_items, embedding_dim=64):
        super(RecommendationModel, self).__init__()
        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.item_embedding = nn.Embedding(num_items, embedding_dim)
        self.fc = nn.Sequential(
            nn.Linear(embedding_dim * 2, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
    def forward(self, user_ids, item_ids):
        user_emb = self.user_embedding(user_ids)
        item_emb = self.item_embedding(item_ids)
        combined = torch.cat([user_emb, item_emb], dim=1)
        return self.fc(combined)

class RecommenderSystem:
    def __init__(self, supabase_client):
        self.client = supabase_client
        self.model = None
        self.user_map = {}
        self.item_map = {}
        self.reverse_user_map = {}
        self.reverse_item_map = {}
        
    def prepare_data(self):
        interactions = self.client.table('video_interactions').select('*').execute()
        users = self.client.table('users').select('id').execute()
        items = self.client.table('videos').select('id').execute()
        
        for idx, user in enumerate(users.data):
            self.user_map[user['id']] = idx
            self.reverse_user_map[idx] = user['id']
            
        for idx, item in enumerate(items.data):
            self.item_map[item['id']] = idx
            self.reverse_item_map[idx] = item['id']
            
        return interactions.data
        
    def train_model(self, interactions, num_epochs=10):
        self.model = RecommendationModel(len(self.user_map), len(self.item_map))
        optimizer = torch.optim.Adam(self.model.parameters())
        criterion = nn.BCELoss()
        
        for epoch in range(num_epochs):
            for interaction in interactions:
                user_id = torch.tensor([self.user_map[interaction['user_id']]])
                item_id = torch.tensor([self.item_map[interaction['video_id']]])
                target = torch.tensor([1.0 if interaction['interaction_type'] == 'like' else 0.0])
                
                optimizer.zero_grad()
                output = self.model(user_id, item_id)
                loss = criterion(output, target)
                loss.backward()
                optimizer.step()
                
    def generate_suggestions(self, user_id, num_suggestions=5):
        if user_id not in self.user_map:
            return []
            
        user_idx = self.user_map[user_id]
        suggestions = []
        
        for item_id, item_idx in self.item_map.items():
            with torch.no_grad():
                score = self.model(torch.tensor([user_idx]), torch.tensor([item_idx]))
                suggestions.append((item_id, score.item()))
                
        suggestions.sort(key=lambda x: x[1], reverse=True)
        return suggestions[:num_suggestions]
        
    def save_suggestions(self, user_id, suggestions):
        expires_at = datetime.now() + timedelta(days=7)
        
        for item_id, score in suggestions:
            self.client.table('suggestions').insert({
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'entity_type': 'video',
                'entity_id': item_id,
                'score': score,
                'expires_at': expires_at.isoformat()
            }).execute() 