import requests
import json
import pandas as pd

# Create dummy csv
df = pd.DataFrame({
    'col1': [1, 2, 3, 4, 5, 100, 1, 2, 3, 4],
    'col2': [2, 3, 4, 5, 6, 200, 2, 3, 4, 5],
    'col3': [3, 4, 5, 6, 7, 300, 3, 4, 5, 6],
})
df.to_csv('test.csv', index=False)

# Upload
with open('test.csv', 'rb') as f:
    res = requests.post('http://localhost:8000/api/upload/', files={'file': f})
    
print("UPLOAD STATUS:", res.status_data if not res.ok else res.status_code)
data = res.json()
print("UPLOAD RESPONSE:", json.dumps(data)[:200])

# Apply fix (PCA)
res_pca = requests.post('http://localhost:8000/api/apply-fix/', json={
    'action': 'extract_pca',
    'data': data['data']
})

print("PCA STATUS:", res_pca.status_code)
if res_pca.ok:
    print("PCA COLUMNS:", res_pca.json()['numeric_columns'])
else:
    print("PCA ERROR:", res_pca.text)

# Apply fix (KMeans)
res_km = requests.post('http://localhost:8000/api/apply-fix/', json={
    'action': 'cluster_kmeans',
    'data': data['data']
})

print("KMEANS STATUS:", res_km.status_code)
if res_km.ok:
    print("KMEANS COLUMNS:", res_km.json()['numeric_columns'])
else:
    print("KMEANS ERROR:", res_km.text)
