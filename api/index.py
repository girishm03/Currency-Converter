import sys
import os

# Ensure python_service and app directories are in sys.path for Vercel Serverless runtime
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
python_service_dir = os.path.join(root_dir, "python_service")

for p in [root_dir, python_service_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from python_service.app.main import app
except ImportError:
    from app.main import app
