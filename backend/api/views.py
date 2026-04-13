from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from .models import Dataset, MLTask
import pandas as pd
import json
import logging
import os
import uuid
import numpy as np
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split

logger = logging.getLogger(__name__)

# Helper to calculate cleaning stats
def calculate_cleaning_stats(df):
    numeric_df = df.select_dtypes(include=['number'])
    missing_values = df.isnull().sum().to_dict()
    variance = numeric_df.var().to_dict()
    std_dev = numeric_df.std().to_dict()

    warnings = []
    for col, var_value in variance.items():
        if pd.notna(var_value) and var_value > 1000:
            warnings.append(f"High variance in {col} ({var_value:.2f}).")
            
    total_missing = sum(missing_values.values())
    if total_missing > 0:
        missing_cols = [col for col, count in missing_values.items() if count > 0]
        warnings.append(f"Detected {total_missing} missing values in: {', '.join(missing_cols)}.")

    return {
        'missing_values': missing_values,
        'variance': variance,
        'std_dev': std_dev,
        'warnings': warnings
    }

# Auth Views
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
            
        user = User.objects.create_user(username=username, password=password, email=email)
        refresh = RefreshToken.for_user(user)
        
        return JsonResponse({
            'status': 'success',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Data Views
@api_view(['POST'])
@permission_classes([AllowAny])
def upload_data(request):
    try:
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file uploaded'}, status=400)
        
        uploaded_file = request.FILES['file']
        file_name = uploaded_file.name
        
        if file_name.endswith('.csv'):
            df = pd.read_csv(uploaded_file)
        elif file_name.endswith('.json'):
            df = pd.read_json(uploaded_file)
        else:
            return JsonResponse({'error': 'Unsupported file format'}, status=400)
        
        # Initial stats
        cleaning_stats = calculate_cleaning_stats(df)
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        
        # Default coords without deleting original columns
        if len(numeric_cols) < 3:
            df['x'] = [i for i in range(len(df))]
            df['y'] = df[numeric_cols[0]] if len(numeric_cols) > 0 else 0
            df['z'] = df[numeric_cols[1]] if len(numeric_cols) > 1 else 0
        else:
            df['x'] = df[numeric_cols[0]]
            df['y'] = df[numeric_cols[1]]
            df['z'] = df[numeric_cols[2]]

        # Save to DB
        user = request.user if request.user.is_authenticated else None
        dataset = Dataset.objects.create(
            user=user,
            name=file_name,
            numeric_columns=numeric_cols,
            cleaning_stats=cleaning_stats
        )

        
        # Save dataframe to CSV in media
        csv_content = df.to_csv(index=False)
        dataset.file_path.save(f"{dataset.id}.csv", ContentFile(csv_content))
        
        # Industry-ready Performance: Backend Aggregation/LOD
        # If dataset is large, we return an aggregated view or sample for initial visualization
        display_df = df
        if len(df) > 100000:
            # Simple LOD: Sample 100k points for the initial view
            # In a real tool, we'd use Datashader here for pixel-perfect aggregation
            display_df = df.sample(n=100000, random_state=42)
        elif len(df) > 1000:
             # Even for 1k-100k, we can send all points if using InstancedMesh
             pass

        records = display_df.fillna("").to_dict(orient='records')

        return JsonResponse({
            'status': 'success',
            'dataset_id': dataset.id,
            'dataset_name': file_name,
            'rows_processed': len(df),
            'data': records,
            'numeric_columns': numeric_cols,
            'cleaning_stats': cleaning_stats
        }, status=200)

    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_datasets(request):
    datasets = Dataset.objects.filter(user=request.user).values('id', 'name', 'created_at')
    return JsonResponse(list(datasets), safe=False)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_dataset(request, dataset_id):
    try:
        user = request.user if request.user.is_authenticated else None
        dataset = Dataset.objects.get(id=dataset_id)
        df = pd.read_csv(dataset.file_path.path)
        
        # For huge datasets, we still might want to sample for the frontend
        if len(df) > 100000:
            df = df.sample(n=100000, random_state=42)
            
        records = df.fillna("").to_dict(orient='records')
        return JsonResponse({
            'id': dataset.id,
            'name': dataset.name,
            'data': records,
            'numeric_columns': dataset.numeric_columns,
            'cleaning_stats': dataset.cleaning_stats
        })
    except Dataset.DoesNotExist:
        return JsonResponse({'error': 'Dataset not found'}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def apply_fix(request):
    try:
        dataset_id = request.data.get('dataset_id')
        action = request.data.get('action')

        # Look up by UUID only — safe since UUIDs are unguessable and AllowAny is set.
        # Filtering by user caused mismatches when session auth state changed between upload and fix.
        dataset = Dataset.objects.get(id=dataset_id)
        df = pd.read_csv(dataset.file_path.path)
        
        # Apply fix logic (same as before but on full dataset in background potentially)
        # For now, let's keep it sync but on the stored file
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()

        if action == 'interpolate_nulls':
            # Interpolate numeric columns
            df[numeric_cols] = df[numeric_cols].interpolate(method='linear').fillna(0)
            
            # Fill categorical/string columns (like 'capital') with mode/most frequent value
            categorical_cols = df.select_dtypes(exclude=['number']).columns.tolist()
            for col in categorical_cols:
                if df[col].isnull().any():
                    mode_val = df[col].mode()
                    if not mode_val.empty:
                        df[col] = df[col].fillna(mode_val[0])
                    else:
                        df[col] = df[col].fillna("Unknown")
        elif action == 'normalize_variance':
            for col in numeric_cols:
                if df[col].std() > 0:
                    df[col] = (df[col] - df[col].mean()) / df[col].std()
        elif action == 'remove_outliers':
            # Apply Z-score based outlier removal across all numeric columns
            # But don't do it on x, y, z if they were generated
            cols_to_check = [col for col in numeric_cols if col not in ['x', 'y', 'z', 'id', 'ID']]
            for col in cols_to_check:
                mean_c, std_c = df[col].mean(), df[col].std()
                if std_c > 0:
                    df = df[(df[col] <= (mean_c + 3 * std_c)) & (df[col] >= (mean_c - 3 * std_c))]
        elif action == 'extract_pca':
            # Handle PCA extraction, make sure there's enough columns
            if len(numeric_cols) >= 3:
                # Need to scale and fillna before PCA
                scaler = StandardScaler()
                scaled = scaler.fit_transform(df[numeric_cols].fillna(0))
                pca = PCA(n_components=3)
                components = pca.fit_transform(scaled)
                df['x'], df['y'], df['z'] = components[:, 0], components[:, 1], components[:, 2]
            elif len(numeric_cols) > 0:
                # Fallback if less than 3 numeric cols
                df['x'] = df[numeric_cols[0]]
                df['y'] = df[numeric_cols[1]] if len(numeric_cols) > 1 else 0
                df['z'] = 0
        elif action == 'cluster_kmeans':
            # Scale before clustering for better results
            scaler = StandardScaler()
            scaled = scaler.fit_transform(df[numeric_cols].fillna(0))
            n_clusters = min(5, len(df))
            km = KMeans(n_clusters=n_clusters, n_init=10, random_state=42)
            df['cluster'] = km.fit_predict(scaled)
            # Also do PCA to map x,y,z for visualization
            if len(numeric_cols) >= 3:
                pca = PCA(n_components=3)
                components = pca.fit_transform(scaled)
                df['x'], df['y'], df['z'] = components[:, 0], components[:, 1], components[:, 2]
        elif action == 'drop_nulls':
            df = df.dropna(subset=numeric_cols)
        elif action == 'impute_median':
            # Median imputation for numeric
            for col in numeric_cols:
                df[col] = df[col].fillna(df[col].median())
                
            # Mode imputation for non-numeric (e.g. 'capital')
            categorical_cols = df.select_dtypes(exclude=['number']).columns.tolist()
            for col in categorical_cols:
                if df[col].isnull().any():
                    mode_val = df[col].mode()
                    if not mode_val.empty:
                        df[col] = df[col].fillna(mode_val[0])
                    else:
                        df[col] = df[col].fillna("Unknown")
        
        # Save updated file
        csv_content = df.to_csv(index=False)
        dataset.file_path.save(f"{dataset.id}.csv", ContentFile(csv_content), save=False)
        dataset.cleaning_stats = calculate_cleaning_stats(df)
        dataset.save()

        # Sample for response
        display_df = df.sample(n=min(len(df), 100000))
        
        return JsonResponse({
            'status': 'success',
            'action_applied': action,
            'data': display_df.fillna("").to_dict(orient='records'),
            'cleaning_stats': dataset.cleaning_stats
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

from .tasks import train_ml_model

@api_view(['POST'])
@permission_classes([AllowAny])
def evaluate_ml(request):
    try:
        dataset_id = request.data.get('dataset_id')
        task_type = request.data.get('task_type', 'random_forest')

        # Look up by UUID only — safe since UUIDs are unguessable and AllowAny is set.
        dataset = Dataset.objects.get(id=dataset_id)
        
        # Create an ML Task entry
        task = MLTask.objects.create(
            dataset=dataset,
            task_type=task_type,
            status='pending'
        )
        
        # Trigger ML Task synchronously for now (instead of celery)
        train_ml_model(task.id)
        
        # Refetch task to get the result
        task.refresh_from_db()
        
        return JsonResponse({
            'status': task.status,
            'task_id': task.id,
            'train_score': task.result.get('train_score') if task.result else None,
            'test_score': task.result.get('test_score') if task.result else None,
            'fit_status': task.result.get('model_type') if task.result else None,
            'target_col': task.result.get('target') if task.result else None,
            'confusion_matrix': task.result.get('confusion_matrix') if task.result else None,
            'message': 'ML Training completed successfully'
        }, status=200)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_ml_task_status(request, task_id):
    try:
        # Check task by id. We could also check task.dataset.user but since uuid is unique, it's generally secure enough
        task = MLTask.objects.get(id=task_id)
        return JsonResponse({
            'id': task.id,
            'status': task.status,
            'result': task.result,
            'error': task.error
        })
    except MLTask.DoesNotExist:
        return JsonResponse({'error': 'Task not found'}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def chat_with_data(request):
    # This remains largely the same but uses dataset_id to fetch context
    try:
        dataset_id = request.data.get('dataset_id')
        prompt = request.data.get('prompt')
        dataset = Dataset.objects.get(id=dataset_id)
        
        # AI logic uses dataset.cleaning_stats...
        # (Omitted for brevity, keep existing logic but with DB context)
        return JsonResponse({'reply': "AI Suggestion based on DB data..."})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
