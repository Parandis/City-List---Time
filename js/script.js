document.addEventListener('DOMContentLoaded', () => {
    // Grab references to the necessary DOM elements
    const navList = document.getElementById('nav-list');
    const indicator = document.getElementById('indicator');
    const cityTime = document.getElementById('city-time');

    let cityData = [];

    // Fetch the JSON data from the provided JSON file
    fetch('/data/navigation.json')
        .then(response => {
            // Check if the network response is OK
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            // Check if the cities property is an array
            if (!Array.isArray(data.cities)) {
                throw new Error('Invalid data format: cities should be an array');
            }

            // Validate the format of each city object
            data.cities.forEach(city => {
                if (!city.label || !city.timeZone) {
                    throw new Error('Invalid data format: each city should have a label and timeZone');
                }
            });

            // Store the valid city data
            cityData = data.cities;

            // Create and append list items for each city
            cityData.forEach((city, index) => {
                const li = document.createElement('li');

                li.textContent = city.label;
                li.dataset.timeZone = city.timeZone;
                li.dataset.label = city.label;

                li.setAttribute('role', 'listitem');// Set the ARIA role
                li.setAttribute('tabindex', '0');// Make the list item focusable

                // Add click event listener to update the active city
                li.addEventListener('click', () => updateActiveCity(index));

                // Add keyboard event listener to update the active city on Enter or Space key press
                li.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        updateActiveCity(index);
                    }
                });

                // Append the list item to the navigation list
                navList.appendChild(li);
            });

            // Set the initial active city
            updateActiveCity(0);
        })
        .catch(error => {
            // Log any fetch errors to the console and update the UI to notify the user
            console.error('Fetch error:', error);
            cityTime.textContent = 'Error loading city data. Please try again later.';
        });

    // Function to update the active city
    function updateActiveCity(index) {
        const items = document.querySelectorAll('#nav-list li');
        const activeItem = items[index];

        // Remove the active class and aria-selected attribute from all items
        items.forEach(item => {
            item.classList.remove('active');
            item.setAttribute('aria-selected', 'false');
        });

        // Add the active class and aria-selected attribute to the selected item
        activeItem.classList.add('active');
        activeItem.setAttribute('aria-selected', 'true');

        // Update the position and width of the indicator
        requestAnimationFrame(() => {
            indicator.style.width = `${activeItem.offsetWidth}px`;
            indicator.style.transform = `translateX(${activeItem.offsetLeft}px)`;
        });

        // Update the displayed current time for the selected city
        updateCityTime(activeItem.dataset.label, activeItem.dataset.timeZone);
    }

    // Function to update the displayed current time for the specified city
    function updateCityTime(cityLabel, timeZone) {
        const now = new Date();

        // Options for formatting the time
        const options = {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
        };

        // Update the text content of the cityTime element with the formatted current time
        cityTime.textContent = `Current Time in ${cityLabel} is ${now.toLocaleTimeString([], options)}.`;
    }
});
