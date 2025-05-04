import torch
import torch.nn as nn
import numpy as np
from datetime import datetime, timedelta
import uuid
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class VideoRecommendationModel(nn.Module):
    def __init__(self, total_users, total_videos, feature_size=64):
        super(VideoRecommendationModel, self).__init__()
        self.user_features = nn.Embedding(total_users, feature_size)
        self.video_features = nn.Embedding(total_videos, feature_size)
        self.recommendation_network = nn.Sequential(
            nn.Linear(feature_size * 2, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
    def forward(self, user_indices, video_indices):
        user_vectors = self.user_features(user_indices)
        video_vectors = self.video_features(video_indices)
        combined_features = torch.cat([user_vectors, video_vectors], dim=1)
        return self.recommendation_network(combined_features)

class VideoRecommender:
    def __init__(self, database_client):
        self.database = database_client
        self.model = None
        self.user_to_index = {}
        self.video_to_index = {}
        self.index_to_user = {}
        self.index_to_video = {}
        self.similar_videos = {}
        
    def load_user_data(self):
        user_interactions = self.database.table('video_interactions').select('*').execute()
        all_users = self.database.table('users').select('id').execute()
        all_videos = self.database.table('videos').select('*').execute()
        
        for position, user in enumerate(all_users.data):
            self.user_to_index[user['id']] = position
            self.index_to_user[position] = user['id']
            
        for position, video in enumerate(all_videos.data):
            self.video_to_index[video['id']] = position
            self.index_to_video[position] = video['id']
            
        self.find_similar_videos(all_videos.data)
        return user_interactions.data
        
    def find_similar_videos(self, videos):
        video_texts = [f"{video['title']} {video['description']}" for video in videos]
        text_analyzer = TfidfVectorizer()
        text_vectors = text_analyzer.fit_transform(video_texts)
        similarity_scores = cosine_similarity(text_vectors)
        
        for current_video, video_id in enumerate(self.video_to_index.keys()):
            self.similar_videos[video_id] = {
                self.index_to_video[other_video]: score 
                for other_video, score in enumerate(similarity_scores[current_video])
                if other_video != current_video and score > 0.2
            }
        
    def train_recommender(self, user_interactions, training_rounds=10):
        self.model = VideoRecommendationModel(len(self.user_to_index), len(self.video_to_index))
        optimizer = torch.optim.Adam(self.model.parameters())
        loss_function = nn.BCELoss()
        
        for round in range(training_rounds):
            for interaction in user_interactions:
                user_position = torch.tensor([self.user_to_index[interaction['user_id']]])
                video_position = torch.tensor([self.video_to_index[interaction['video_id']]])
                user_preference = torch.tensor([1.0 if interaction['interaction_type'] == 'like' else 0.0])
                
                optimizer.zero_grad()
                prediction = self.model(user_position, video_position)
                loss = loss_function(prediction, user_preference)
                loss.backward()
                optimizer.step()
                
    def get_user_recommendations(self, user_id, max_recommendations=5):
        if user_id not in self.user_to_index:
            return []
            
        user_position = self.user_to_index[user_id]
        recommendations = []
        
        for video_id, video_position in self.video_to_index.items():
            with torch.no_grad():
                preference_score = self.model(torch.tensor([user_position]), torch.tensor([video_position]))
                recommendations.append((video_id, preference_score.item()))
                
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations[:max_recommendations]
        
    def find_similar_videos_for(self, video_id, max_suggestions=5):
        if video_id not in self.similar_videos:
            return []
            
        similar = self.similar_videos[video_id]
        sorted_similar = sorted(similar.items(), key=lambda x: x[1], reverse=True)
        return sorted_similar[:max_suggestions]
        
    def save_user_recommendations(self, user_id, recommendations):
        expiration_date = datetime.now() + timedelta(days=7)
        
        for video_id, score in recommendations:
            self.database.table('suggestions').insert({
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'entity_type': 'video',
                'entity_id': video_id,
                'score': score,
                'expires_at': expiration_date.isoformat()
            }).execute()
            
    def save_similar_videos(self, video_id, similar_videos):
        expiration_date = datetime.now() + timedelta(days=7)
        
        for similar_id, score in similar_videos:
            self.database.table('suggestions').insert({
                'id': str(uuid.uuid4()),
                'user_id': video_id,
                'entity_type': 'related_video',
                'entity_id': similar_id,
                'score': score,
                'expires_at': expiration_date.isoformat()
            }).execute() 