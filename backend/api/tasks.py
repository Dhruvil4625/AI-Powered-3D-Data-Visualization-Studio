# from celery import shared_task
from .models import MLTask, Dataset
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
import json
import logging

logger = logging.getLogger(__name__)

# Remove @shared_task since we will run it synchronously if celery is not used
# @shared_task
def train_ml_model(task_id):
    try:
        task = MLTask.objects.get(id=task_id)
        task.status = 'processing'
        task.save()
        
        dataset = task.dataset
        df = pd.read_csv(dataset.file_path.path)
        
        # Performance optimization: Sample data for faster evaluation if it's too large
        # We reduce the sample size further to 10k rows to ensure the synchronous evaluation is extremely fast (<1s)
        # while still providing a statistically significant baseline.
        if len(df) > 10000:
            df = df.sample(n=10000, random_state=42)
            logger.info(f"Sampled dataset to 10k rows for faster ML evaluation (task {task_id})")
        
        # ML Logic
        numeric_df = df.select_dtypes(include=['number'])
        # Drop non-informative or highly missing columns
        numeric_df = numeric_df.dropna(axis=1, thresh=int(0.5 * len(numeric_df)))
        
        cols_to_drop = ['x', 'y', 'z', 'is_outlier', 'id', 'ID']
        for col in cols_to_drop:
            # Case-insensitive column dropping for common IDs
            matching_cols = [c for c in numeric_df.columns if c.lower() == col.lower()]
            numeric_df = numeric_df.drop(columns=matching_cols)
        
        if len(numeric_df.columns) < 2:
            task.status = 'failed'
            task.error = "At least 2 numeric features required to train the ML Simulator."
            task.save()
            return
            
        target_col = numeric_df.columns[-1]
        X = numeric_df.drop(columns=[target_col]).fillna(0)
        y = numeric_df[target_col].fillna(0)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Decide Regressor vs Classifier
        # We use a very shallow tree to ensure hyper-fast training times for the UI
        if len(y.unique()) < 10:
            model = RandomForestClassifier(n_estimators=10, max_depth=5, n_jobs=-1, random_state=42)
            fit_type = "Classification"
        else:
            model = RandomForestRegressor(n_estimators=10, max_depth=5, n_jobs=-1, random_state=42)
            fit_type = "Regression"
            
        model.fit(X_train, y_train)
        score = model.score(X_test, y_test)
        
        task.status = 'completed'
        task.result = {
            'score': score,
            'model_type': fit_type,
            'features': list(X.columns),
            'target': target_col
        }
        task.save()
        
    except Exception as e:
        logger.error(f"Error in ML task {task_id}: {str(e)}")
        try:
            task = MLTask.objects.get(id=task_id)
            task.status = 'failed'
            task.error = str(e)
            task.save()
        except:
            pass
