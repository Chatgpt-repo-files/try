// State
let currentCountry = null;
let currentCity = null;
let currentDistrict = null;
let map = null;

const views = {
  main: document.getElementById('main-menu'),
  country: document.getElementById('country-view'),
  city: document.getElementById('city-view'),
  district: document.getElementById('district-view'),
  game: document.getElementById('game-view'),
  help: document.getElementById('help-overlay')
};

function showView(name) {
  Object.values(views).forEach(v => v.classList.add('hidden'));
  views[name].classList.remove('hidden');
}

// Event bindings

document.getElementById('start-btn').addEventListener('click', loadCountries);
document.getElementById('help-btn').addEventListener('click', () => views.help.classList.remove('hidden'));
document.getElementById('close-help').addEventListener('click', () => views.help.classList.add('hidden'));
document.getElementById('country-back').addEventListener('click', () => showView('main'));
document.getElementById('city-back').addEventListener('click', () => loadCountries());
document.getElementById('district-back').addEventListener('click', () => loadCities(currentCountry));
document.getElementById('game-back').addEventListener('click', () => loadDistricts(currentCity));

// Load countries and create map
function loadCountries() {
  fetch('/api/countries')
    .then(r => r.json())
    .then(countries => {
      const list = document.getElementById('countries-list');
      list.innerHTML = '';

      if (map) {
        map.remove();
      }
      map = L.map('map').setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
      }).addTo(map);

      countries.forEach(country => {
        const btn = document.createElement('button');
        btn.textContent = country.name;
        btn.className = 'country';
        if (!country.unlocked) {
          btn.classList.add('locked');
        } else {
          btn.addEventListener('click', () => {
            currentCountry = country.id;
            loadCities(country.id);
          });
        }
        list.appendChild(btn);

        const marker = L.marker([country.lat, country.lng]).addTo(map);
        marker.bindPopup(country.name);
        if (country.unlocked) {
          marker.on('click', () => {
            currentCountry = country.id;
            loadCities(country.id);
          });
        }
      });
      showView('country');
    });
}

function loadCities(countryId) {
  fetch(`/api/countries/${countryId}/cities`)
    .then(r => r.json())
    .then(cities => {
      const container = document.getElementById('cities-container');
      container.innerHTML = '';
      cities.forEach(city => {
        const btn = document.createElement('button');
        btn.textContent = city.name;
        btn.className = 'city';
        if (!city.unlocked) {
          btn.classList.add('locked');
        } else {
          btn.addEventListener('click', () => {
            currentCity = city.id;
            loadDistricts(city.id);
          });
        }
        container.appendChild(btn);
      });
      showView('city');
    });
}

function loadDistricts(cityId) {
  fetch(`/api/cities/${cityId}/districts`)
    .then(r => r.json())
    .then(districts => {
      const container = document.getElementById('districts-container');
      container.innerHTML = '';
      districts.forEach(d => {
        const btn = document.createElement('button');
        btn.textContent = d.name;
        btn.className = 'district';
        if (!d.unlocked) {
          btn.classList.add('locked');
        } else {
          btn.addEventListener('click', () => startGame(d));
        }
        container.appendChild(btn);
      });
      showView('district');
    });
}

function startGame(district) {
  currentDistrict = district;
  document.getElementById('game-question').textContent = district.question;
  const ans = document.getElementById('answer-buttons');
  ans.innerHTML = '';
  district.options.forEach((opt, idx) => {
    const b = document.createElement('button');
    b.textContent = opt;
    b.addEventListener('click', () => checkAnswer(idx));
    ans.appendChild(b);
  });
  showView('game');
}

function checkAnswer(idx) {
  const correct = idx === currentDistrict.answer;
  const view = document.getElementById('game-view');
  if (correct) {
    const msg = document.createElement('div');
    msg.textContent = 'Correct!';
    view.insertBefore(msg, view.firstChild);
    fetch(`/api/districts/${currentDistrict.id}/complete`, { method: 'POST' })
      .finally(() => {
        setTimeout(() => {
          msg.remove();
          loadDistricts(currentCity);
        }, 1000);
      });
  } else {
    view.classList.add('shake');
    setTimeout(() => view.classList.remove('shake'), 500);
  }
}
