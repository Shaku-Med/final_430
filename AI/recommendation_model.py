import torch
import torch.nn as nn
import numpy as np
from datetime import datetime, timedelta
import uuid
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class EntityRecommendationModel(nn.Module):
    def __init__(self, total_users, total_entities, feature_size=64):
        super(EntityRecommendationModel, self).__init__()
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

class EntityRecommender:
    def __init__(self, database_client):
        self.database = database_client
        self.models = {}
        self.user_to_index = {}
        self.index_to_user = {}
        self.entity_to_index = {}
        self.index_to_entity = {}
        self.similar_entities = {}
        
    def load_user_data(self):
        user_interactions = self.database.table('video_interactions').select('*').execute()
        event_participants = self.database.table('event_participants').select('*').execute()
        project_members = self.database.table('project_members').select('*').execute()
        
        unique_users = set(interaction['user_id'] for interaction in user_interactions.data)
        unique_users.update(participant['user_id'] for participant in event_participants.data)
        unique_users.update(member['user_id'] for member in project_members.data)
        
        for position, user_id in enumerate(unique_users):
            self.user_to_index[user_id] = position
            self.index_to_user[position] = user_id
            
        self.load_entity_data('videos')
        self.load_entity_data('events')
        self.load_entity_data('projects')
        
        return {
            'video_interactions': user_interactions.data,
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
        for entity in entities:
            title = entity.get('title', '')
            description = entity.get('description', '')
            if title or description:
                entity_texts.append(f"{title} {description}".strip())
                
        if not entity_texts:
            return
            
        text_analyzer = TfidfVectorizer()
        text_vectors = text_analyzer.fit_transform(entity_texts)
        similarity_scores = cosine_similarity(text_vectors)
        
        for current_entity, entity_id in enumerate(self.entity_to_index[entity_type].keys()):
            self.similar_entities[entity_type][entity_id] = {
                self.index_to_entity[entity_type][other_entity]: score 
                for other_entity, score in enumerate(similarity_scores[current_entity])
                if other_entity != current_entity and score > 0.2
            }
        
    def train_recommender(self, interactions, entity_type, training_rounds=10):
        self.models[entity_type] = EntityRecommendationModel(
            len(self.user_to_index), 
            len(self.entity_to_index[entity_type])
        )
        optimizer = torch.optim.Adam(self.models[entity_type].parameters())
        loss_function = nn.BCELoss()
        
        for round in range(training_rounds):
            for interaction in interactions:
                if interaction['user_id'] not in self.user_to_index:
                    continue
                    
                entity_id = interaction.get(f'{entity_type[:-1]}_id')
                if not entity_id or entity_id not in self.entity_to_index[entity_type]:
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
        if user_id not in self.user_to_index:
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
        if entity_id not in self.similar_entities[entity_type]:
            return []
            
        similar_entities = list(self.similar_entities[entity_type][entity_id].items())
        similar_entities.sort(key=lambda x: x[1], reverse=True)
        return similar_entities[:max_suggestions]
        
    def save_user_recommendations(self, user_id, recommendations, entity_type):
        for entity_id, score in recommendations:
            self.database.table('suggestions').insert({
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'entity_id': entity_id,
                'entity_type': entity_type,
                'score': score,
                'expires_at': (datetime.now() + timedelta(days=7)).isoformat()
            }).execute()
            
    def save_similar_entities(self, entity_id, similar_entities, entity_type):
        for similar_id, score in similar_entities:
            self.database.table('suggestions').insert({
                'id': str(uuid.uuid4()),
                'user_id': 'system',
                'entity_id': similar_id,
                'entity_type': f'related_{entity_type[:-1]}',
                'score': score,
                'expires_at': (datetime.now() + timedelta(days=7)).isoformat()
            }).execute() 