import torch
import torch.nn as nn
import numpy as np
from datetime import datetime, timedelta
import uuid
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RecommendationModel(nn.Module):
    def __init__(self, total_users, total_entities, feature_size=64):
        super(RecommendationModel, self).__init__()
        self.user_features = nn.Embedding(total_users, feature_size)
        self.entity_features = nn.Embedding(total_entities, feature_size)
        self.recommendation_network = nn.Sequential(
            nn.Linear(feature_size * 2, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
    def forward(self, user_indices, entity_indices):
        user_vectors = self.user_features(user_indices)
        entity_vectors = self.entity_features(entity_indices)
        combined_features = torch.cat([user_vectors, entity_vectors], dim=1)
        return self.recommendation_network(combined_features)

class ContentRecommender:
    def __init__(self, database_client):
        self.database = database_client
        self.models = {}
        self.user_to_index = {}
        self.index_to_user = {}
        self.entity_to_index = {}
        self.index_to_entity = {}
        self.similar_entities = {}
        
    def load_user_data(self):
        video_interactions = self.database.table('video_interactions').select('*').execute()
        event_participants = self.database.table('event_participants').select('*').execute()
        project_members = self.database.table('project_members').select('*').execute()
        
        unique_users = set()
        
        for interaction in video_interactions.data:
            unique_users.add(interaction['user_id'])
            
        for participant in event_participants.data:
            unique_users.add(participant['user_id'])
            
        for member in project_members.data:
            unique_users.add(member['user_id'])
        
        for position, user_id in enumerate(unique_users):
            self.user_to_index[user_id] = position
            self.index_to_user[position] = user_id
            
        self.load_entity_data('videos')
        self.load_entity_data('events')
        self.load_entity_data('projects')
        
        return {
            'video_interactions': video_interactions.data,
            'event_participants': event_participants.data,
            'project_members': project_members.data
        }
        
    def load_entity_data(self, entity_type):
        self.entity_to_index[entity_type] = {}
        self.index_to_entity[entity_type] = {}
        entities = self.database.table(entity_type).select('*').execute()
        
        for position, entity in enumerate(entities.data):
            self.entity_to_index[entity_type][entity['id']] = position
            self.index_to_entity[entity_type][position] = entity['id']
            
        self.find_similar_entities(entities.data, entity_type)
        
    def find_similar_entities(self, entities, entity_type):
        self.similar_entities[entity_type] = {}
        if not entities:
            return
            
        entity_texts = []
        entity_ids = []
        
        for entity in entities:
            title = entity.get('title', '')
            description = entity.get('description', '')
            
            if title or description:
                entity_texts.append(f"{title} {description}".strip())
                entity_ids.append(entity['id'])
                
        if not entity_texts:
            return
            
        text_analyzer = TfidfVectorizer()
        text_vectors = text_analyzer.fit_transform(entity_texts)
        similarity_scores = cosine_similarity(text_vectors)
        
        for i, entity_id in enumerate(entity_ids):
            self.similar_entities[entity_type][entity_id] = {
                entity_ids[j]: score 
                for j, score in enumerate(similarity_scores[i])
                if i != j and score > 0.2
            }
        
    def train_recommender(self, interactions, entity_type, training_rounds=10):
        if len(self.user_to_index) == 0 or len(self.entity_to_index.get(entity_type, {})) == 0:
            return
            
        self.models[entity_type] = RecommendationModel(
            len(self.user_to_index), 
            len(self.entity_to_index[entity_type])
        )
        optimizer = torch.optim.Adam(self.models[entity_type].parameters())
        loss_function = nn.BCELoss()
        
        for round in range(training_rounds):
            for interaction in interactions:
                if interaction['user_id'] not in self.user_to_index:
                    continue
                    
                entity_id_key = f"{entity_type[:-1]}_id"
                if entity_id_key not in interaction:
                    continue
                    
                entity_id = interaction[entity_id_key]
                if entity_id not in self.entity_to_index[entity_type]:
                    continue
                    
                user_position = torch.tensor([self.user_to_index[interaction['user_id']]])
                entity_position = torch.tensor([self.entity_to_index[entity_type][entity_id]])
                user_preference = torch.tensor([[1.0]])
                
                optimizer.zero_grad()
                prediction = self.models[entity_type](user_position, entity_position)
                loss = loss_function(prediction, user_preference)
                loss.backward()
                optimizer.step()
                
    def get_user_recommendations(self, user_id, entity_type, max_recommendations=5):
        if user_id not in self.user_to_index or entity_type not in self.models:
            return []
            
        user_position = self.user_to_index[user_id]
        recommendations = []
        
        for entity_id, entity_position in self.entity_to_index[entity_type].items():
            with torch.no_grad():
                preference_score = self.models[entity_type](
                    torch.tensor([user_position]), 
                    torch.tensor([entity_position])
                )
                recommendations.append((entity_id, preference_score.item()))
                
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations[:max_recommendations]
        
    def find_similar_entities_for(self, entity_id, entity_type, max_suggestions=5):
        if entity_type not in self.similar_entities or entity_id not in self.similar_entities[entity_type]:
            return []
            
        similar_entities = list(self.similar_entities[entity_type][entity_id].items())
        similar_entities.sort(key=lambda x: x[1], reverse=True)
        return similar_entities[:max_suggestions]
        
    def save_user_recommendations(self, user_id, recommendations, entity_type):
        if not recommendations:
            return
            
        self.database.table('suggestions').delete().eq('user_id', user_id).eq('entity_type', entity_type).execute()
        
        for entity_id, score in recommendations:
            self.database.table('suggestions').insert({
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'entity_id': entity_id,
                'entity_type': entity_type,
                'score': float(score),
                'expires_at': (datetime.now() + timedelta(days=7)).isoformat()
            }).execute()
            
    def save_similar_entities(self, entity_id, similar_entities, entity_type):
        if not similar_entities:
            return
            
        # Get all users from the database
        users = self.database.table('users').select('id').execute()
        if not users.data:
            return
            
        # For each similar entity and each user, save a suggestion
        for user in users.data:
            user_id = user['id']
            
            # Delete existing similar entity suggestions for this entity type
            self.database.table('suggestions').delete()\
                .eq('user_id', user_id)\
                .eq('entity_type', f'related_{entity_type[:-1]}')\
                .eq('entity_id', entity_id)\
                .execute()
            
            # Insert new similar entity suggestions
            for similar_id, score in similar_entities:
                self.database.table('suggestions').insert({
                    'id': str(uuid.uuid4()),
                    'user_id': user_id,
                    'entity_id': similar_id,  # This is the ID of the similar entity
                    'entity_type': f'related_{entity_type[:-1]}',
                    'score': float(score),
                    'expires_at': (datetime.now() + timedelta(days=7)).isoformat(),
                    'original_entity_id': entity_id  # Store the original entity ID in a custom field
                }).execute()
            
    def generate_all_recommendations(self):
        user_data = self.load_user_data()
        
        self.train_recommender(user_data['video_interactions'], 'videos')
        self.train_recommender(user_data['event_participants'], 'events')
        self.train_recommender(user_data['project_members'], 'projects')
        
        for user_id in self.user_to_index:
            video_recommendations = self.get_user_recommendations(user_id, 'videos')
            event_recommendations = self.get_user_recommendations(user_id, 'events')
            project_recommendations = self.get_user_recommendations(user_id, 'projects')
            
            self.save_user_recommendations(user_id, video_recommendations, 'videos')
            self.save_user_recommendations(user_id, event_recommendations, 'events')
            self.save_user_recommendations(user_id, project_recommendations, 'projects')
            
        for entity_type in ['videos', 'events', 'projects']:
            for entity_id in self.entity_to_index[entity_type]:
                similar_entities = self.find_similar_entities_for(entity_id, entity_type)
                self.save_similar_entities(entity_id, similar_entities, entity_type)