document.addEventListener('DOMContentLoaded', () => {
  const views = {
    main: document.getElementById('main-menu'),
    country: document.getElementById('country-view'),
    city: document.getElementById('city-view'),
    district: document.getElementById('district-view'),
    game: document.getElementById('game-view')
  };
  const helpOverlay = document.getElementById('help-overlay');

  const fallbackData = {
    countries: [
      { id: 1, name: 'AlphaLand', description: 'Welcome to AlphaLand!', unlocked: true },
      { id: 2, name: 'BetaLand', description: 'Welcome to BetaLand!', unlocked: false }
    ],
    cities: [
      { id: 1, countryId: 1, name: 'Alphaville', unlocked: true },
      { id: 2, countryId: 1, name: 'Numeria', unlocked: false },
      { id: 3, countryId: 2, name: 'Betatown', unlocked: false }
    ],
    districts: [
      { id: 1, cityId: 1, name: 'Harbor', concept: 'Count the boats', unlocked: true },
      { id: 2, cityId: 1, name: 'Market', concept: 'Count the apples', unlocked: false },
      { id: 3, cityId: 2, name: 'Square', concept: 'Count the cars', unlocked: false },
      { id: 4, cityId: 3, name: 'Center', concept: 'Count the houses', unlocked: false }
    ]
  };

  async function fetchJson(url, fallback) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('bad status');
      return await res.json();
    } catch (_) {
      console.warn('Using fallback data for', url);
      return typeof fallback === 'function' ? fallback() : fallback;
    }
  }

  function unlockNextDistrict(id) {
    const dIndex = fallbackData.districts.findIndex(d => d.id === id);
    if (dIndex === -1) return;
    fallbackData.districts[dIndex].unlocked = true;

    const cityId = fallbackData.districts[dIndex].cityId;
    const cityDistricts = fallbackData.districts.filter(d => d.cityId === cityId);
    const pos = cityDistricts.findIndex(d => d.id === id);

    if (pos < cityDistricts.length - 1) {
      const nextId = cityDistricts[pos + 1].id;
      fallbackData.districts.find(d => d.id === nextId).unlocked = true;
    } else {
      const cityIndex = fallbackData.cities.findIndex(c => c.id === cityId);
      fallbackData.cities[cityIndex].unlocked = true;

      const countryId = fallbackData.cities[cityIndex].countryId;
      const countryCities = fallbackData.cities.filter(c => c.countryId === countryId);
      const cityPos = countryCities.findIndex(c => c.id === cityId);

      if (cityPos < countryCities.length - 1) {
        const nextCityId = countryCities[cityPos + 1].id;
        fallbackData.cities.find(c => c.id === nextCityId).unlocked = true;
      } else {
        const countryIndex = fallbackData.countries.findIndex(c => c.id === countryId);
        if (countryIndex < fallbackData.countries.length - 1) {
          fallbackData.countries[countryIndex + 1].unlocked = true;
        }
      }
    }
  }

  let currentCity = null;
  let currentDistrict = null;

  document.getElementById('start-btn').addEventListener('click', loadCountries);
  document.getElementById('help-btn').addEventListener('click', () => helpOverlay.classList.remove('hidden'));
  document.getElementById('close-help').addEventListener('click', () => helpOverlay.classList.add('hidden'));

  function show(view) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    view.classList.remove('hidden');
  }

  async function loadCountries() {
    const countries = await fetchJson('/api/countries', fallbackData.countries);
    views.country.innerHTML = '<h2>Select a Country</h2>';
    countries.forEach(c => {
      const btn = document.createElement('button');
      btn.textContent = c.name;
      btn.className = 'country';
      if (!c.unlocked) {
        btn.classList.add('locked');
      } else {
        btn.addEventListener('click', () => loadCities(c.id));
      }
      views.country.appendChild(btn);
    });
    show(views.country);
  }

  async function loadCities(countryId) {
    const cities = await fetchJson(
      `/api/countries/${countryId}/cities`,
      () => fallbackData.cities.filter(c => c.countryId === countryId)
    );
    views.city.innerHTML = '<h2>Select a City</h2>';
    cities.forEach(c => {
      const btn = document.createElement('button');
      btn.textContent = c.name;
      btn.className = 'city';
      if (!c.unlocked) {
        btn.classList.add('locked');
      } else {
        btn.addEventListener('click', () => loadDistricts(c.id));
      }
      views.city.appendChild(btn);
    });
    show(views.city);
  }

  async function loadDistricts(cityId) {
    currentCity = cityId;
    const districts = await fetchJson(
      `/api/cities/${cityId}/districts`,
      () => fallbackData.districts.filter(d => d.cityId === cityId)
    );
    views.district.innerHTML = '<h2>Select a District</h2>';
    districts.forEach(d => {
      const btn = document.createElement('button');
      btn.textContent = d.name;
      btn.className = 'district';
      if (!d.unlocked) {
        btn.classList.add('locked');
      } else {
        btn.addEventListener('click', () => startGame(d));
      }
      views.district.appendChild(btn);
    });
    show(views.district);
  }

  function startGame(district) {
    currentDistrict = district;
    views.game.innerHTML = '';
    const question = document.createElement('h2');
    question.textContent = district.concept;
    views.game.appendChild(question);
    const objects = {
      boats: '⛵',
      apples: '🍎',
      cars: '🚗',
      houses: '🏠'
    };
    const key = Object.keys(objects).find(k => district.concept.toLowerCase().includes(k));
    const emoji = objects[key] || '⭐';
    const count = Math.floor(Math.random() * 5) + 1;

    const objectsDiv = document.createElement('div');
    objectsDiv.className = 'objects';
    objectsDiv.style.fontSize = '2rem';
    objectsDiv.textContent = emoji.repeat(count);
    views.game.appendChild(objectsDiv);

    const answerContainer = document.createElement('div');
    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = i;
      btn.addEventListener('click', () => checkAnswer(i, count));
      answerContainer.appendChild(btn);
    }
    views.game.appendChild(answerContainer);
    show(views.game);
  }

  async function checkAnswer(value, correct) {
    if (value === correct) {
      try {
        await fetch(`/api/districts/${currentDistrict.id}/complete`, { method: 'POST' });
      } catch (_) {
        unlockNextDistrict(currentDistrict.id);
      }
      loadDistricts(currentCity);
    } else {
      // small shake effect
      views.game.classList.remove('shake');
      void views.game.offsetWidth;
      views.game.classList.add('shake');
    }
  }
});
