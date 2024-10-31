document.getElementById('search-bar').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const airports = document.querySelectorAll('.airport-card');

    airports.forEach(airport => {
        const name = airport.getAttribute('data-name').toLowerCase();
        if (name.includes(query)) {
            airport.style.display = 'block';
        } else {
            airport.style.display = 'none';
        }
    });
});
