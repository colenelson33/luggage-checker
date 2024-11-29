document.addEventListener('DOMContentLoaded', function() {
    const data = [
        {"code": "JFK", "name": "John F. Kennedy International Airport"},
        {"code": "LAX", "name": "Los Angeles International Airport"},
        {"code": "ORD", "name": "O'Hare International Airport"},
        {"code": "ATL", "name": "Hartsfield-Jackson Atlanta International Airport"},
        {"code": "CPH", "name": "Copenhagen Airport"},
        {"code": "KEF", "name": "Keflavik Airport"},
        {"code": "MEL", "name": "Melbourne Airport"},
        {"code": "SYD", "name": "Sydney Airport"},
        {"code": "FRA", "name": "Frankfurt Airport"},
        {"code": "LHR", "name": "Heathrow Airport"},
        {"code": "MAD", "name": "Madrid-Barajas Airport"},
        {"code": "DFW", "name": "Dallas/Fort Worth International Airport"},
        {"code": "CDG", "name": "Charles de Gaulle Airport"},
        {"code": "SIN", "name": "Singapore Changi Airport"},
        {"code": "SCE", "name": "State College Airport"},
        {"code": "PHL", "name": "Philadelphia International Airport"},
        {"code": "HND", "name": "Tokyo Haneda Airport"}
    ];
    
    const select = document.getElementById('from-airport');
    data.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport.code;
        option.textContent = `${airport.name} (${airport.code})`;
        select.appendChild(option);
    });

    const select2 = document.getElementById('to-airport');
    data.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport.code;
        option.textContent = `${airport.name} (${airport.code})`;
        select2.appendChild(option);
    });
})
.catch(error => console.error('Error fetching the airport data:', error));
