import * as fs from 'fs';
import * as path from 'path';
import { Country, State } from './interfaces';

const _INPUT_DIR = './places_data';
const _COUNTRIES_INPUT = _INPUT_DIR + '/countries.json';
const _STATES_INPUT = _INPUT_DIR + '/states.json';

const _COUNTRIES_OUTPUT_DIR = './dist/';
const _STATES_OUTPUT_DIR = _COUNTRIES_OUTPUT_DIR + 'states/';

// Load raw data
const countries: Country[] = JSON.parse(fs.readFileSync(path.resolve(_COUNTRIES_INPUT), 'utf8'));
const states: State[] = JSON.parse(fs.readFileSync(path.resolve(_STATES_INPUT), 'utf8'));

// Create empty directories if they don't exist
if (!fs.existsSync(_COUNTRIES_OUTPUT_DIR)) {
    fs.mkdirSync(_COUNTRIES_OUTPUT_DIR);
}
if (!fs.existsSync(_STATES_OUTPUT_DIR)) {
    fs.mkdirSync(_STATES_OUTPUT_DIR);
}

// Process Countries
const sortedCountries: Country[] = [];

// Put USA and Canada at the top of the list
countries.forEach(rawCountry => {
    if (rawCountry.iso2 === 'US' || rawCountry.iso2 === 'CA') {
        sortedCountries.unshift(rawCountry);
    } else {
        sortedCountries.push(rawCountry);
    }
});

// Write to output file
const countriesMap: { [countryCode: string]: string; } = {};
sortedCountries.forEach(country => countriesMap[country.iso2] = country.name);
fs.writeFileSync(_COUNTRIES_OUTPUT_DIR + 'countries.json', JSON.stringify(countriesMap, null, 4));

console.log('Parsing countries complete');


// Process States
const parsedStatesByCountry: { [countryCode: string]: State[] } = {};

for (let state of states) {
    let parsedStates: State[] = parsedStatesByCountry[state.country_code];
    if (parsedStates == null) {
        parsedStates = [];
        parsedStatesByCountry[state.country_code] = parsedStates;
    }

    parsedStates.push(state);
}

// Write to output file
Object.entries(parsedStatesByCountry).forEach(([countryCode, states]) => {
    const statesMap: { [stateCode: string]: string; } = {};
    states
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(state => statesMap[state.state_code] = state.name);

    let data = JSON.stringify(statesMap, null, 4);
    fs.writeFileSync(_STATES_OUTPUT_DIR + countryCode + '.json', data);
});

console.log('Parsing states complete');
