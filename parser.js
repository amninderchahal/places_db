'use strict';

const fs = require('fs');

const countriesDir = 'places/';
const citiesDir = 'places/cities/';
const subdivisionsDir = 'places/subdivisions/';

// Load raw data
let countriesRawData = fs.readFileSync('Country.json');
let countries = JSON.parse(countriesRawData).results;
let statesRawData = fs.readFileSync('Subdivisions_States_Provinces.json');
let states = JSON.parse(statesRawData).results;
let citiesRawdata = fs.readFileSync('City.json');
let cities = JSON.parse(citiesRawdata).results;

// Create empty directories if they don't exist
if (!fs.existsSync(countriesDir)) {
  fs.mkdirSync(countriesDir);
}
if (!fs.existsSync(citiesDir)) {
  fs.mkdirSync(citiesDir);
}
if (!fs.existsSync(subdivisionsDir)) {
  fs.mkdirSync(subdivisionsDir);
}


// Process Countries
const countriesMap = {};
const parsedCountries = [];
countries
  .sort((a, b) => a.name.localeCompare(b.name))
  .forEach(rawCountry => {
    const country = {
      name: rawCountry.name,
      code: rawCountry.code
    };

    countriesMap[rawCountry.objectId] = rawCountry;

    if (rawCountry.code === 'US' || rawCountry.code === 'CA') {
      parsedCountries.unshift(country);
    } else {
      parsedCountries.push(country);
    }
  });

fs.writeFileSync(countriesDir + 'countries.json', JSON.stringify(parsedCountries, null, 4));

console.log('Parsing countries complete');

// Process cities
let parsedCities = {};

for (let city of cities) {
  const country = countriesMap[city.country.objectId];
  let parsedCity = parsedCities[country.code];
  if (parsedCity == null) {
    parsedCities[country.code] = {
      items: [],
      addedKeys: {}
    };
    parsedCity = parsedCities[country.code];
  }
  if (!parsedCity.addedKeys[city.name]) {
    parsedCity.items.push(city.name);
    parsedCity.addedKeys[city.name] = true;
  }
}

Object.entries(parsedCities).forEach(([code, { items }]) => {
  const cities = items.sort((a, b) => a.localeCompare(b));
  let data = JSON.stringify(cities, null, 4);
  fs.writeFileSync(citiesDir + code + '.json', data);
});

console.log('Parsing cities complete');

// Process States
let parsedStates = {};

for (let state of states) {
  const country = countriesMap[state.country.objectId];
  let parsedState = parsedStates[country.code];
  if (parsedState == null) {
    parsedStates[country.code] = {
      items: [],
      addedKeys: {}
    };
    parsedState = parsedStates[country.code];
  }
  if (!parsedState.addedKeys[state.Subdivision_Code]) {
    parsedState.items.push({
      name: state.Subdivision_Name,
      code: state.Subdivision_Code
    });
    parsedState.addedKeys[state.Subdivision_Code] = true;
  }
}

Object.entries(parsedStates).forEach(([code, { items }]) => {
  const subdivisions = items.sort((a, b) => a.name.localeCompare(b.name));
  let data = JSON.stringify(subdivisions, null, 4);
  fs.writeFileSync(subdivisionsDir + code + '.json', data);
});

console.log('Parsing subdivisions complete');