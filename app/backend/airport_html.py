import sqlite3

# Connect to the SQLite database
conn = sqlite3.connect('airport_luggage.db')
cursor = conn.cursor()

# Query to select all airports from the database
cursor.execute('SELECT code, name FROM airports')
airports = cursor.fetchall()

conn.close()

# Function to generate the HTML content
def generate_html(airports):
    html_content = '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Airport Cards</title>
        <style>
            .airport-card {
                border: 1px solid #ccc;
                padding: 10px;
                margin: 10px;
                border-radius: 5px;
                box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
            }
        </style>
    </head>
    <body>
    '''

    for code, name in airports:
        city = name.split('/')[0] if '/' in name else name.split(' ')[0]
        html_content += f'''
        <div class="airport-card" data-name="{name} ({code})">
            <h2>{code} - {city}</h2>
            <p>{name}</p>
        </div>
        '''

    html_content += '''
    </body>
    </html>
    '''
    return html_content

# Generate the HTML content
html_content = generate_html(airports)

print(html_content)