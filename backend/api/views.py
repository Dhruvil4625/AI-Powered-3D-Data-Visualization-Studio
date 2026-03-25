from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import pandas as pd
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def upload_data(request):
    if request.method == 'POST':
        try:
            # Check if file was uploaded
            if 'file' not in request.FILES:
                return JsonResponse({'error': 'No file uploaded'}, status=400)
            
            uploaded_file = request.FILES['file']
            file_name = uploaded_file.name
            
            # Use Pandas to process the CSV/JSON
            if file_name.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
            elif file_name.endswith('.json'):
                df = pd.read_json(uploaded_file)
            else:
                return JsonResponse({'error': 'Unsupported file format, use CSV or JSON'}, status=400)
            
            # Ensure required numeric columns exist to map to 3D coords
            # Typically x, y, z are ideal, but we can synthesize them if missing
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            
            if len(numeric_cols) < 3:
                # Synthesize geometric data for testing if missing
                df['x'] = [i for i in range(len(df))]
                df['y'] = df[numeric_cols[0]] if len(numeric_cols) > 0 else 0
                df['z'] = df[numeric_cols[1]] if len(numeric_cols) > 1 else 0
            else:
                # Alias first 3 numeric to x, y, z
                df = df.rename(columns={numeric_cols[0]: 'x', numeric_cols[1]: 'y', numeric_cols[2]: 'z'})

            # "Smart Clean" Backend Logic: Outline simple outliers in Z axis payload
            mean_z = df['z'].mean()
            std_z = df['z'].std()
            df['is_outlier'] = df['z'] > (mean_z + 2 * std_z)

            # Limit to 1000 nodes for react-three-fiber performance out of the gate
            if len(df) > 1000:
                df = df.sample(n=1000, random_state=42)

            # Format the output for WebGL
            records = df.to_dict(orient='records')
            
            return JsonResponse({
                'status': 'success',
                'dataset_name': file_name,
                'rows_processed': len(records),
                'data': records,
                'numeric_columns': numeric_cols
            }, status=200)

        except Exception as e:
            logger.error(f"Error processing file: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
