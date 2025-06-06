const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'data.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

function loadData() {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/countries', (req, res) => {
  const data = loadData();
  res.json(data.countries);
});

app.get('/api/countries/:id/cities', (req, res) => {
  const data = loadData();
  const countryId = parseInt(req.params.id, 10);
  const cities = data.cities.filter(c => c.countryId === countryId);
  res.json(cities);
});

app.get('/api/cities/:id/districts', (req, res) => {
  const data = loadData();
  const cityId = parseInt(req.params.id, 10);
  const districts = data.districts.filter(d => d.cityId === cityId);
  res.json(districts);
});

app.post('/api/districts/:id/complete', (req, res) => {
  const data = loadData();
  const districtId = parseInt(req.params.id, 10);

  const districtIndex = data.districts.findIndex(d => d.id === districtId);
  if (districtIndex === -1) {
    return res.status(404).json({ error: 'District not found' });
  }

  // Mark current district as unlocked
  data.districts[districtIndex].unlocked = true;

  // Unlock next district in same city
  const cityId = data.districts[districtIndex].cityId;
  const cityDistricts = data.districts.filter(d => d.cityId === cityId);
  const currentPos = cityDistricts.findIndex(d => d.id === districtId);

  if (currentPos < cityDistricts.length - 1) {
    // Unlock next district
    const nextDistrictId = cityDistricts[currentPos + 1].id;
    const nextIndex = data.districts.findIndex(d => d.id === nextDistrictId);
    data.districts[nextIndex].unlocked = true;
  } else {
    // Unlock next city
    const cityIndex = data.cities.findIndex(c => c.id === cityId);
    data.cities[cityIndex].unlocked = true;

    const countryId = data.cities[cityIndex].countryId;
    const countryCities = data.cities.filter(c => c.countryId === countryId);
    const cityPos = countryCities.findIndex(c => c.id === cityId);
    if (cityPos < countryCities.length - 1) {
      const nextCityId = countryCities[cityPos + 1].id;
      const nextCityIndex = data.cities.findIndex(c => c.id === nextCityId);
      data.cities[nextCityIndex].unlocked = true;
    } else {
      // Unlock next country
      const countryIndex = data.countries.findIndex(c => c.id === countryId);
      if (countryIndex < data.countries.length - 1) {
        data.countries[countryIndex + 1].unlocked = true;
      }
    }
  }

  saveData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
