import sqlite3
import requests
from bs4 import BeautifulSoup

class Airport_Database:

    def _init_():
        airports = {} #placeholder, should be filled with every airport code
        luggage_items = []
        prohibited_items_by_airport = []
        prohibited_items = {}

        conn = sqlite3.connect('airport_luggage.db')  
        cursor = conn.cursor() #I'm not totally familiar with this code, but I believe it creates database tables for:
                                                #the airports, prohibited items, and items prohibited by each airport specifically
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

    def scrape_airports(self): #this method *should* scrape a wikipedia page to create a dictionary of international airports by their code
        url = 'https://en.wikipedia.org/wiki/List_of_international_airports_by_country'
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        tables = soup.find_all('table', {'class': 'wikitable'})

        for table in tables:
            for row in table.find_all('tr')[1:]:  # Skip the header row
                columns = row.find_all('td')
                if len(columns) >= 2:
                    airport_name = columns[0].text.strip()
                    airport_code = columns[1].text.strip()
                    self.airports[airport_code] = airport_name

    def scrape_tsa_prohibited_items(self): #this method *should* scrape all the items prohibited by TSA and place them in a list
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

    def populate_db(self): #this method fills the databases
        conn = sqlite3.connect('airport_luggage.db')
        cursor = conn.cursor()
        
        # Add airports to database
        self.scrape_airports()
        for code, name in self.airports.items():
                cursor.execute('''INSERT OR IGNORE INTO Airports (code, name) VALUES (?, ?)''', (code, name))
        
        # Add prohibited items to database
        items = self.scrape_tsa_prohibited_items()
        for item in items:
            cursor.execute('INSERT OR IGNORE INTO ProhibitedItems (name, category, permitted) VALUES (?, ?, ?)', 
                        (item['name'], item['category'], item['permitted']))
        
        # Link prohibited items to airports in a database and a dictionary (the dictionary could be removed, I just don't know how to use databases)
        self.prohibited_items_by_airport = [(1, 1), (1, 2), (2, 2), (2, 3), (3, 1), (3, 3), (4, 1), (4, 2), (4, 3)]
        for airport_id, item_id in self.prohibited_items_by_airport:
            cursor.executemany('INSERT OR IGNORE INTO AirportProhibitedItems (airport_id, item_id) VALUES (?, ?)', (airport_id,item_id))
            self.prohibited_items[airport_id] = items[item_id]
        
        conn.commit()
        conn.close()

def item_check(db, airport, contraband): #checks items in the luggage against the prohibited item list
    for item in db.luggage_items:
        if item in db.prohibited_items[airport]:
            contraband += [item]

def output(airport, contraband): #prints a basic statement for each prohibited item at each airport
    for item in contraband:
        print("\n" + item + " is prohibited through " + airport)

#everything after this can be removed, but a contraband list must be created somewhere at some point
air_db = Airport_Database()
contraband = []

air_db.populate_db()
item_check(air_db, "JFK", contraband)
output("JFK", contraband)

