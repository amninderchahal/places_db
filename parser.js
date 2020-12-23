'use strict';

const fs = require('fs');

const countriesDir = 'places/';
const citiesDir = 'places/cities/';
const subdivisionsDir = 'places/subdivisions/';

let citiesRawdata = fs.readFileSync('City.json');
let cities = JSON.parse(citiesRawdata).results;
let parsedCities = {};

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

for (let city of cities) {
  let parsedCity = parsedCities[city.country.objectId];
  if (parsedCity == null) {
    parsedCities[city.country.objectId] = {
      items: [],
      addedKeys: {}
    };
    parsedCity = parsedCities[city.country.objectId];
  }
  if (!parsedCity.addedKeys[city.name]) {
    parsedCity.items.push(city.name);
    parsedCity.addedKeys[city.name] = true;
  }
}

Object.entries(parsedCities).forEach(([id, { items }]) => {
  let data = JSON.stringify(items, null, 4);
  fs.writeFileSync(citiesDir + id + '.json', data);
});

console.log('Parsing cities complete');

// States

let statesRawData = fs.readFileSync('Subdivisions_States_Provinces.json');
let states = JSON.parse(statesRawData).results;
let parsedStates = {};

for (let state of states) {
  let parsedState = parsedStates[state.country.objectId];
  if (parsedState == null) {
    parsedStates[state.country.objectId] = {
      items: [],
      addedKeys: {}
    };
    parsedState = parsedStates[state.country.objectId];
  }
  if (!parsedState.addedKeys[state.Subdivision_Name]) {
    parsedState.items.push({
      name: state.Subdivision_Name,
      code: state.Subdivision_Code
    });
    parsedState.addedKeys[state.Subdivision_Name] = true;
  }
}

Object.entries(parsedStates).forEach(([id, { items }]) => {
  let data = JSON.stringify(items, null, 4);
  fs.writeFileSync(subdivisionsDir + id + '.json', data);
});

console.log('Parsing subdivisions complete');

// Countries

let countriesRawData = fs.readFileSync('Country.json');
let countries = JSON.parse(countriesRawData).results;
let parsedCountries = countries.map(country => ({
  id: country.objectId,
  name: country.name,
  code: country.code
}));

fs.writeFileSync(countriesDir + 'countries.json', JSON.stringify(parsedCountries, null, 4));

console.log('Parsing countries complete');