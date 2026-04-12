from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Data
    path('upload/', views.upload_data, name='upload_data'),
    path('datasets/', views.list_datasets, name='list_datasets'),
    path('datasets/<uuid:dataset_id>/', views.get_dataset, name='get_dataset'),
    path('apply-fix/', views.apply_fix, name='apply_fix'),
    path('chat-with-data/', views.chat_with_data, name='chat_with_data'),
    path('evaluate-ml/', views.evaluate_ml, name='evaluate_ml'),
    path('ml-tasks/<uuid:task_id>/', views.get_ml_task_status, name='get_ml_task_status'),
]
