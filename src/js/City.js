import { createEl, append, select, selectAll, toggleState } from './dom-facades';
import { makePublisher } from './publisher';

const cityHook = {
    hook: function (obj) {
        let self = this;

        makePublisher(obj);

        self.fire('cityHooked', [obj]);
    }
};

function generateUrl(str, hour) {
    let url;

    hour = +hour;
    str = str.toLowerCase();

    (hour < 20 && hour > 8) ? hour = true : hour = false;

    switch (str) {
        case 'partly cloudy':
            hour ? url = 'cloudy-day-1' : url = 'cloudy-night-1';
            break;
        case 'cloudy':
        case 'overcast':
        case 'mist':
        case 'fog':
            url = 'cloudy';
            break;
        case 'patchy rain possible':
            hour ? url = 'rainy-1' : url = 'rainy-4';
            break;
        case 'patchy light rain':
        case 'light rain shower':
            hour ? url = 'rainy-2' : url = 'rainy-5';
            break;
        case 'moderate or heavy rain shower':
            hour ? url = 'rainy-3' : url = 'rainy-6';
            break;
        case 'light rain':
            url = 'rainy-4';
            break;
        case 'moderate rain at times':
        case 'moderate rain':
        case 'light sleet showers':
            url = 'rainy-5';
            break;
        case 'heavy rain':
        case 'moderate or heavy freezing rain':
        case 'torrential rain shower':
        case 'moderate or heavy sleet showers':
            url = 'rainy-6';
            break;
        case 'patchy sleet possible':
        case 'light freezing rain':
        case 'moderate or heavy sleet':
        case 'ice pellets':
            url = 'rainy-7';
            break;
        case 'patchy light drizzle':
            hour ? url = 'snowy-1' : url = 'snowy-4';
            break;
        case 'patchy snow possible':
        case 'light drizzle':
        case 'patchy light snow':
            hour ? url = 'snowy-2' : url = 'snowy-5';
            break;
        case 'patchy moderate snow':
        case 'patchy heavy snow':
            hour ? url = 'snowy-3' : url = 'snowy-6';
            break;
        case 'patchy freezing drizzle possible':
        case 'freezing fog':
        case 'light sleet':
        case 'light snow':
        case 'light snow showers':
        case 'light showers of ice pellets':
            url = 'snowy-4';
            break;
        case 'blowing snow':
        case 'freezing drizzle':
        case 'moderate snow':
        case 'moderate or heavy snow showers':
            url = 'snowy-5';
            break;
        case 'blizzard':
        case 'heavy freezing drizzle':
        case 'heavy snow':
        case 'moderate or heavy showers of ice pellets':
            url = 'snowy-6';
            break;
        case 'sunny':
            url = 'day';
            break;
        case 'clear':
            url = 'night';
            break;
        default:
            url = 'thunder';
    }

    return 'static/images/' + url + '.svg';
}

function City() {}

City.prototype.ids = [];

City.factory = function (type, data) {
    let constr = type;
    let obj;
    let city = data.location.city;
    let country = data.location.country;

    if (typeof City[constr] !== 'function') {
        throw {
            name: 'Error',
            message: constr + ' doesn’t exist'
        };
    };

    if (typeof City[constr].prototype.render !== 'function') {
        City[constr].prototype = new City();
    }

    obj = new City[constr](city, country, data);

    cityHook.hook(obj);

    return obj;
};

City.prototype.createHeader = function () {
    let self = this;
    let status = self.status === 'main';
    let header = createEl('div', 'city__header');
    let leftCol = createEl('div', ['city__descr', 'col', 'col--12-3', 'col--padding']);
    let middleCol = createEl('div', ['city__status', 'col', 'col--12-6']);
    let rightCol = createEl('div', ['city__btn-container', 'col', 'col--12-3', 'col--padding']);

    function createLocation() {
        let text = `${self.city}, ${self.country}`;

        return createEl('span', 'city__location', text);
    }

    function createTime() {
        let text = self.time;

        return createEl('span', 'city__time', text);
    }

    function createStatus() {
        let text = status ? 'Main City' : '';

        return createEl('span', false, text);
    }

    function createButton() {
        let btn;
        let icon;
        let text;
        let btnClassNames = ['btn', 'btn--size-s', 'btn--rounded',
            status ? 'btn--switch' : 'btn--remove'];
        let btnData = {
            mission: status ? 'change' : 'remove',
            victim: self.city
        };
        let btnTitle = status ? 'This button lets you to change main city' : `This button deletes ${self.city}`;
        let iconClassNames = ['btn__icon', 'btn__icon--size-s',
            status ? 'btn__icon--switch' : 'btn__icon--remove-s'];
        let textClassNames = ['btn__text', 'btn__text--size-s',
            status ? 'btn__text--switch' : 'btn__text--remove'];

        icon = createEl('span', iconClassNames);
        text = createEl('span', textClassNames, status ? 'change' : 'remove');
        btn = createEl('button', btnClassNames, false, btnData, {
            title: btnTitle
        }, [icon, text]);

        if (self.status === 'main') {
            btn.addEventListener('click', () => {
                self.beforeChange();
            });
        } else {
            btn.addEventListener('click', () => {
                self.remove();
            });
        }

        return btn;
    }

    append([
        { parent: leftCol, children: [createLocation(), createTime()] },
        { parent: middleCol, children: createStatus() },
        { parent: rightCol, children: createButton() },
        { parent: header, children: [leftCol, middleCol, rightCol] }
    ]);

    return header;
};

City.prototype.createWeatherBlock = function () {
    let self = this;
    let weatherBlock;
    let currentWeatherData = self.data.current.weather;
    let forecastData = self.data.forecast;

    function createDate(date) {
        let wrapper;
        let el;

        el = createEl('span', 'weather__date', date);
        wrapper = createEl('div', ['weather__wrapper', 'weather__wrapper--ta-right'],
            false, false, false, el);

        return wrapper;
    }

    function createWeatherDescr(descr) {
        let wrapper;
        let el;

        el = createEl('span', 'weather__descr', descr);
        wrapper = createEl('div', ['weather__wrapper', 'weather__wrapper--ta-center'],
            false, false, false, el);

        return wrapper;
    }

    function createWeatherIcon(descr, time) {
        let wrapper;
        let el;

        el = createEl('img', 'weather__icon', false, { weather: descr }, {
            src: generateUrl(descr, time),
            alt: descr
        });
        wrapper = createEl('div', 'weather__icon-container', false, false, false, el);

        return wrapper;
    }

    function createTemp(temp) {
        let wrapper;
        let el;

        el = createEl('span', 'weather__temp', temp + ' °C');
        wrapper = createEl('div', ['weather__wrapper', 'weather__wrapper--ta-right'],
            false, false, false, el);

        return wrapper;
    }

    function createWeatherTile(data, time) {
        let el;

        el = createEl('div', 'weather__tile', false, false, false, [
            createDate(data.date),
            createWeatherDescr(data.descr),
            createWeatherIcon(data.descr, time),
            createTemp(data.temp)
        ]);

        return el;
    }

    function createCurrentWeather(weather, time) {
        let el;
        let wrapper;

        el = createEl('div', 'weather__today',
            false, false, false, createWeatherTile(weather, time));
        wrapper = createEl('div', ['col', 'col--12-3', 'col--padding-right'],
            false, false, false, el);

        return wrapper;
    }

    function createForecast(arr, time) {
        let el;
        let elems = [];
        let container;
        let wrapper;

        arr.forEach((item, i) => {
            let classNames = ['col', 'col--12-4'];

            switch (i) {
                case 0:
                    classNames.push('col--padding-right', 'weather__bordered-tile');
                    break;
                case 1:
                    classNames.push('col--padding', 'weather__bordered-tile');
                    break;
                default:
                    classNames.push('col--padding-left');
            }

            el = createEl('div', classNames,
                false, false, false, createWeatherTile(item.weather, time));

            elems.push(el);
        });

        container = createEl('div', 'weather__forecast',
            false, false, false, elems);
        wrapper = createEl('div', ['col', 'col--12-9', 'col--padding-left'],
            false, false, false, container);

        return wrapper;
    }

    weatherBlock = createEl('div', 'weather', false, false, false,
        [createCurrentWeather(currentWeatherData, self.time.match(/\d+/)[0]),
            createForecast(forecastData, self.time.match(/\d+/)[0])]);

    return weatherBlock;
};

City.prototype.createDetailsBlock = function () {
    let self = this;
    let detailsBlock;
    let currentWeatherDetails = self.data.current.details;
    let forecastDetails = self.data.forecast;

    function createTd(value) {
        value = value || '0';
        return createEl('td', 'details__value', value);
    }

    function createTh(name) {
        return createEl('th', 'details__text', name, false, { scope: 'row' });
    }

    function createRow(name, value) {
        return createEl('tr', 'details__row', false, false, false,
            [createTh(name), createTd(value)]);
    }

    function createTable(details) {
        let i;
        let table;
        let rows = [];

        for (i in details) {
            if (details.hasOwnProperty(i)) {
                rows.push(createRow(i, details[i]));
            }
        }

        table = createEl('table', 'details__table', false, false, false,
            rows);

        return table;
    }

    function createButton(city) {
        return createEl('button', 'details__opener', '+ open details',
            { mission: 'toggle', toggle: city, state: '0' },
            { title: `This button shows more weather details in ${city}` });
    }

    function createCurrentWeatherDetails(details, city) {
        let detailsContainer;
        let btn;
        let wrapper;

        detailsContainer = createEl('div', ['details__container', 'details__container--today'], false, false, false,
            createTable(details));
        btn = createButton(city);
        wrapper = createEl('div', ['col', 'col--12-3', 'col--padding-right'],
            false, false, false, [detailsContainer, btn]);

        return wrapper;
    }

    function createForecastDetails(arr) {
        let detailsContainer;
        let elems = [];
        let wrapper;

        arr.forEach((item, i) => {
            let classNames = ['col', 'col--12-4'];

            switch (i) {
                case 0:
                    classNames.push('col--padding-right');
                    break;
                case 1:
                    classNames.push('col--padding');
                    break;
                default:
                    classNames.push('col--padding-left');
            }

            elems.push(createEl('div', classNames,
                false, false, false, createTable(item.details)));
        });

        detailsContainer = createEl('div', 'details__container', false, false, false,
            elems);
        wrapper = createEl('div', ['col', 'col--12-9', 'col--padding-left'], false,
            false, false, detailsContainer);

        return wrapper;
    }

    detailsBlock = createEl('div', 'details', false, { details: self.city }, false,
        [createCurrentWeatherDetails(currentWeatherDetails, self.city),
            createForecastDetails(forecastDetails)]);

    return detailsBlock;
};

City.prototype.addEventListeners = function (obj) {
    let self = obj;
    let city = obj.city;

    select('.details__opener[data-toggle="' + city + '"]').addEventListener('click', function () {
        let victim = '.details[data-details="' + city + '"] .details__container';
        let trigger = select('.details__opener[data-toggle="' + city + '"]');

        toggleState(trigger, () => {
            trigger.innerHTML = '- close up';
            selectAll(victim).forEach((item) => {
                item.classList.add('details__container--opened');
            });
        }, () => {
            trigger.innerHTML = '+ open details';
            selectAll(victim).forEach((item) => {
                item.classList.remove('details__container--opened');
            });
        });
    });

    let btn = select('#' + self.id + ' .city__header .btn');

    if (self.id !== 'main') {
        function removeCity() {
            try {
                btn.removeEventListener('click', removeCity);
                self.remove();
            } catch (err) {
                return true;
            }
        }
        btn.addEventListener('click', removeCity);
    }
};

City.prototype.render = function (obj) {
    let self = obj;
    let city = self.city;
    let status = self.status === 'main';

    city = createEl('div', 'city', false,
        { city }, { id: self.id },
        [
            self.createHeader(),
            self.createWeatherBlock(),
            self.createDetailsBlock()
        ]);

    if (status) {
        let parent = select('.main-city');

        parent.innerHTML = '';
        append([
            { parent, children: city }
        ]);
    } else {
        append([
            { parent: select('.cities'), children: city }
        ]);
    }

    self.addEventListeners(obj);
    self.fire('cityRendered', ['Success', self.city + ' was successfully added!', true]);
};

City.City = function (city, country, data) {
    let self = this;

    self.status = '';

    self.city = city;
    self.country = country;
    self.data = data;
    self.time = data.location.time;
    self.coords = [data.location.latitude, data.location.longitude];

    self.id = self.status ? 'main' : undefined;
    if (self.ids.length) {
        let lastEl = self.ids[self.ids.length - 1];
        let indexOfLast = +lastEl.match(/\d+/)[0];

        self.id = self.status ? 'main' : 'city-' + (indexOfLast + 1);
    } else {
        self.id = self.status ? 'main' : 'city-' + 1;
    }
    if (!self.status) {
        self.ids.push(self.id);
    }
    self.remove = function () {
        let el = select(`#${self.id}`);
        let index = self.ids.indexOf(self.id);

        el.parentNode.removeChild(el);
        self.ids.splice(index, 1);

        self.fire('cityRemoved', [self.coords, self.city]);
    };
};

City.MainCity = function (city, country, data) {
    let self = this;

    self.status = 'main';

    self.city = city;
    self.country = country;
    self.data = data;
    self.time = data.location.time;

    self.id = self.status ? 'main' : undefined;
    if (self.ids.length) {
        let lastEl = self.ids[self.ids.length - 1];
        let indexOfLast = +lastEl.match(/\d+/)[0];

        self.id = self.status ? 'main' : 'city-' + (indexOfLast + 1);
    } else {
        self.id = self.status ? 'main' : 'city-' + 1;
    }
    if (!self.status) {
        self.ids.push(self.id);
    }

    self.beforeChange = function () {
        self.fire('changeTrigger', [self]);
    };

    self.changed = function (city, country, data) {
        let el = select('#main');

        self.city = city;
        self.country = country;
        self.data = data;
        self.time = data.location.time;

        el.parentNode.removeChild(el);
        self.render();
    };
};

export { City, cityHook };
