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
    
    const populateDropdown = (dropdown) => {
        data.forEach(airport => {
            const option = document.createElement('option');
            option.value = airport.code;
            option.textContent = `${airport.name} (${airport.code})`;
            dropdown.appendChild(option);
        });
    };

    const fromSelect = document.getElementById('from-airport');
    const fromInput = document.getElementById('from-custom');
    const toSelect = document.getElementById('to-airport');
    const toInput = document.getElementById('to-custom');

    populateDropdown(fromSelect);
    populateDropdown(toSelect);

    // Toggle input field for custom entry
    const toggleCustomInput = (select, input) => {
        select.addEventListener('change', () => {
            if (select.value === 'custom') {
                input.classList.remove('hidden');
                input.focus();
            } else {
                input.classList.add('hidden');
                input.value = ''; // Reset custom input
            }
        });
    };

    toggleCustomInput(fromSelect, fromInput);
    toggleCustomInput(toSelect, toInput);

    // Validate 3-letter airport code input
    const validateInput = (input) => {
        input.addEventListener('input', () => {
            input.value = input.value.toUpperCase().slice(0, 3); // Limit to 3 uppercase characters
        });
    };

    validateInput(fromInput);
    validateInput(toInput);
});
