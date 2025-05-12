from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allows access from React frontend

# Default route (optional)
@app.route('/')
def home():
    return '✅ Flask backend is running. Visit /alerts to get traffic alerts.'

# Traffic alert data route
@app.route('/alerts')
def get_alerts():
    return jsonify([
        {
            "lat": 13.072,
            "lng": 80.270,
            "type": "Animal Crossing",
            "message": "⚠️ Animal zone ahead"
        },
        {
            "lat": 13.067,
            "lng": 80.255,
            "type": "Speed Breaker",
            "message": "🚧 Speed breaker in 50m"
        },
        {
            "lat": 13.065,
            "lng": 80.245,
            "type": "Accident Zone",
            "message": "🛑 Frequent accidents reported"
        }
    ])

if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend to fetch data

@app.route('/alerts')
def alerts():
    return jsonify([
        {"lat": 13.072, "lng": 80.270, "type": "Animal Crossing", "message": "⚠️ Animal zone ahead"},
        {"lat": 13.067, "lng": 80.255, "type": "Speed Breaker", "message": "🚧 Speed breaker in 50m"},
        {"lat": 13.065, "lng": 80.245, "type": "Accident Zone", "message": "🛑 Frequent accidents reported"}
    ])

if __name__ == '__main__':
    app.run(debug=True)
