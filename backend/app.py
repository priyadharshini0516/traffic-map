from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/alerts")
def get_alerts():
    alerts = [
        {"type": "High Traffic", "lat": 13.0827, "lng": 80.2707, "message": "Heavy traffic in Chennai"},
        {"type": "Animal Crossing", "lat": 13.07, "lng": 80.24, "message": "Watch for animals"},
        {"type": "Speed Breaker", "lat": 13.1, "lng": 80.28, "message": "Speed breaker ahead"},
    ]
    return jsonify(alerts)

if __name__ == "__main__":
    app.run(debug=True)
