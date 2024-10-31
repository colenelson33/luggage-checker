from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

def query_db(query, args=(), one=False):
    conn = sqlite3.connect('airport_luggage.db')
    cursor = conn.cursor()
    cursor.execute(query, args)
    rv = cursor.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv

@app.route('/check-luggage', methods=['POST'])
def check_luggage():
    data = request.get_json()
    departure_airport = data['departureAirport']
    arrival_airport = data['arrivalAirport']
    items = data['items']

    prohibited_items = []

    for airport in [departure_airport, arrival_airport]:
        airport_id = query_db('SELECT id FROM Airports WHERE code = ?', [airport], one=True)
        if airport_id:
            airport_id = airport_id[0]
            for item in items:
                item_id = query_db('SELECT id FROM ProhibitedItems WHERE name = ?', [item], one=True)
                if item_id:
                    item_id = item_id[0]
                    is_prohibited = query_db('SELECT 1 FROM AirportProhibitedItems WHERE airport_id = ? AND item_id = ?', [airport_id, item_id], one=True)
                    if is_prohibited:
                        prohibited_items.append({
                            'item': item,
                            'airport': airport,
                            'reason': 'Prohibited at this airport'
                        })

    return jsonify({'prohibitedItems': prohibited_items})



if __name__ == '__main__':
    app.run(debug=True)
