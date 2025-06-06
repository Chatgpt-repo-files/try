const mainMenu = document.getElementById('main-menu');
const countryView = document.getElementById('country-view');
const cityView = document.getElementById('city-view');
const districtView = document.getElementById('district-view');
const gameView = document.getElementById('game-view');
const helpOverlay = document.getElementById('help-overlay');

let currentCountry = null;
let currentCity = null;
let currentDistrict = null;

function showView(view) {
  [mainMenu, countryView, cityView, districtView, gameView].forEach(v => v.classList.add('hidden'));
  view.classList.remove('hidden');
}

// Main Menu Buttons
document.getElementById('start-btn').addEventListener('click', loadCountries);
document.getElementById('help-btn').addEventListener('click', () => helpOverlay.classList.remove('hidden'));
document.getElementById('close-help').addEventListener('click', () => helpOverlay.classList.add('hidden'));

document.getElementById('settings-btn').addEventListener('click', () => alert('Settings coming soon!'));

function loadCountries() {
  fetch('/api/countries')
    .then(res => res.json())
    .then(countries => {
      countryView.innerHTML = '<h2>Select a Country</h2>';
      countries.forEach(c => {
        const btn = document.createElement('div');
        btn.textContent = c.name;
        btn.className = 'country' + (c.unlocked ? '' : ' locked');
        if (c.unlocked) {
          btn.addEventListener('click', () => loadCities(c));
        }
        countryView.appendChild(btn);
      });
      showView(countryView);
    });
}

function loadCities(country) {
  currentCountry = country;
  fetch(`/api/countries/${country.id}/cities`)
    .then(res => res.json())
    .then(cities => {
      cityView.innerHTML = `<h2>${country.name} - Cities</h2>`;
      cities.forEach(c => {
        const btn = document.createElement('div');
        btn.textContent = c.name;
        btn.className = 'city' + (c.unlocked ? '' : ' locked');
        if (c.unlocked) {
          btn.addEventListener('click', () => loadDistricts(c));
        }
        cityView.appendChild(btn);
      });
      showView(cityView);
    });
}

function loadDistricts(city) {
  currentCity = city;
  fetch(`/api/cities/${city.id}/districts`)
    .then(res => res.json())
    .then(districts => {
      districtView.innerHTML = `<h2>${city.name} - Districts</h2>`;
      districts.forEach(d => {
        const btn = document.createElement('div');
        btn.textContent = d.name;
        btn.className = 'district' + (d.unlocked ? '' : ' locked');
        if (d.unlocked) {
          btn.addEventListener('click', () => startGame(d));
        }
        districtView.appendChild(btn);
      });
      showView(districtView);
    });
}

function startGame(district) {
  currentDistrict = district;
  gameView.innerHTML = `<h2>${district.name}</h2><p>${district.concept}</p>`;
  const correctAnswer = 4;
  const question = document.createElement('div');
  question.textContent = 'How many objects?';
  const answerInput = document.createElement('input');
  answerInput.type = 'number';
  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Answer';
  submitBtn.addEventListener('click', () => {
    if (parseInt(answerInput.value, 10) === correctAnswer) {
      alert('Well done!');
      fetch(`/api/districts/${district.id}/complete`, { method: 'POST' })
        .then(() => loadDistricts(currentCity));
    } else {
      answerInput.classList.add('shake');
      setTimeout(() => answerInput.classList.remove('shake'), 500);
      alert('Try again!');
    }
  });
  const practiceBtn = document.createElement('button');
  practiceBtn.textContent = 'Practice';
  practiceBtn.addEventListener('click', () => alert('Practice level!'));
  gameView.appendChild(question);
  gameView.appendChild(answerInput);
  gameView.appendChild(submitBtn);
  gameView.appendChild(practiceBtn);
  showView(gameView);
}
