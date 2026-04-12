import os
import subprocess
import shlex

def run(cmd):
    return subprocess.check_output(cmd, shell=True, text=True).strip()

status_output = run("git status -s --porcelain")
lines = status_output.split('\n')

for line in lines:
    if not line:
        continue
    state = line[:2]
    filepath = line[3:]
    
    # Strip quotes if present
    if filepath.startswith('"') and filepath.endswith('"'):
        filepath = filepath[1:-1].encode('utf-8').decode('unicode_escape')
        
    if ' -> ' in filepath:
        filepath = filepath.split(' -> ')[-1]
        if filepath.startswith('"'):
            filepath = filepath[1:-1].encode('utf-8').decode('unicode_escape')

    filename = os.path.basename(filepath)
    
    if filepath.startswith("backend/"):
        scope = "backend"
    elif filepath.startswith("src/components/views/"):
        scope = "views"
    elif filepath.startswith("src/components/charts/"):
        scope = "charts"
    elif filepath.startswith("src/components/"):
        scope = "components"
    elif filepath.startswith("src/"):
        scope = "frontend"
    else:
        scope = "config"
        
    action = "Add" if state == "??" else "Update"
    if 'D' in state:
        action = "Delete"
    
    msg = f"{action} {filename} in {scope}"
    
    print(f"Committing {filepath} as '{msg}'...")
    try:
        run(f'git add "{filepath}"')
        run(f'git commit -m "{msg}"')
    except subprocess.CalledProcessError:
        pass

print("Pushing to remote...")
run('git push -f -u origin main')
print("Done!")
