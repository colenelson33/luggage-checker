import sqlite3
import requests
from bs4 import BeautifulSoup

def init_db():
    conn = sqlite3.connect('airport_luggage.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Airports (
            id INTEGER PRIMARY KEY,
            code TEXT UNIQUE NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ProhibitedItems (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS AirportProhibitedItems (
            airport_id INTEGER,
            item_id INTEGER,
            FOREIGN KEY (airport_id) REFERENCES Airports(id),
            FOREIGN KEY (item_id) REFERENCES ProhibitedItems(id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def scrape_tsa_prohibited_items():
    url = 'https://www.tsa.gov/travel/security-screening/whatcanibring/all'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    items = []
    for item in soup.find_all('div', class_='views-row'):
        name = item.find('div', class_='views-field-title').get_text(strip=True)
        category = item.find('div', class_='views-field-field-category').get_text(strip=True)
        permitted = item.find('div', class_='views-field-field-permitted').get_text(strip=True)
        items.append({'name': name, 'category': category, 'permitted': permitted})

    return items

def populate_db():
    conn = sqlite3.connect('airport_luggage.db')
    cursor = conn.cursor()
    
    # Add airports
    airports = [('JFK',), ('LAX',), ('LHR',),('PHL',)]
    for code in airports:
        cursor.executemany('INSERT OR IGNORE INTO Airports (code) VALUES (?)', code)
    
    # Add prohibited items
    items = scrape_tsa_prohibited_items()
    for item in items:
        cursor.execute('INSERT OR IGNORE INTO ProhibitedItems (name, category, permitted) VALUES (?, ?, ?)', 
                       (item['name'], item['category'], item['permitted']))
    
    # Link prohibited items to airports
    airport_items = [(1, 1), (1, 2), (2, 2), (2, 3), (3, 1), (3, 3), (4, 1), (4, 2), (4, 3)]
    for airport_id, item_id in airport_items:
        cursor.executemany('INSERT OR IGNORE INTO AirportProhibitedItems (airport_id, item_id) VALUES (?, ?)', (airport_id,item_id))
    
    conn.commit()
    conn.close()



populate_db()