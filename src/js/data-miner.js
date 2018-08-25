import { capitalizeFL } from './dom-facades';

function dateFormatter(string) {
    let date;
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let day;
    let month;
    let formatted;

    string = string.match(/\d\d\d\d-\d\d-\d\d/)[0];
    date = new Date(string);
    day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    formatted = `${day}.${month}, ${days[date.getDay()]}`;

    return formatted;
}

const dataMiner = {
    data: {
        status: null,
        location: {
            city: null,
            country: null,
            latitude: null,
            longitude: null,
            time: null
        },
        current: {
            weather: {
                date: null,
                descr: null,
                url: null,
                temp: null
            },
            details: {
                pressure: null,
                humidity: null,
                precip: null,
                windDir: null,
                windSpeed: null
            }
        },
        forecast: []
    },

    json: function (response) {
        return response.json();
    },

    getForecast: function (coords, status) {
        let self = this;
        let result = self.data;
        let url = 'https://api.apixu.com/v1/forecast.json?key=db798d6f0c304603acb101529172908&q=' + coords + '&days=4';

        if (status) {
            result.status = 'main';
        } else {
            result.status = '';
        }

        if (coords) {
            fetch(url, {
                method: 'GET'
            })
                .then((res) => {
                    if (res.status === 200) {
                        self.data.forecast = [];
                        return res;
                    }
                })
                .then(res => res.json())
                .then((data) => {
                    let i;
                    let dataForecast = data.forecast.forecastday;
                    let length = dataForecast.length;
                    let forecast = result.forecast;
                    let dataLoc = data.location;
                    let loc = result.location;
                    let dataCur = data.current;
                    let curW = result.current.weather;
                    let curDet = result.current.details;

                    loc.city = dataLoc.name;
                    loc.country = dataLoc.country;
                    loc.latitude = dataLoc.lat;
                    loc.longitude = dataLoc.lon;
                    loc.time = dataLoc.localtime.match(/\d+:\d\d/)[0];

                    curW.date = 'Today';
                    curW.descr = dataCur.condition.text;
                    curW.url = curW.descr.toLowerCase().replace(/\s/g, '-');
                    curW.temp = dataCur.temp_c;

                    curDet.pressure = dataCur.pressure_mb + 'mb';
                    curDet.humidity = dataCur.humidity + '%';
                    curDet.precip = dataCur.precip_mm + 'mm';
                    curDet.windDir = dataCur.wind_dir;
                    curDet.windSpeed = (dataCur.wind_kph * 0.28).toFixed(2) + 'm/s';

                    for (i = 1; i < length; i += 1) {
                        let obj = {
                            weather: {
                                date: null,
                                descr: null,
                                url: null,
                                temp: null
                            },
                            details: {
                                pressure: null,
                                humidity: null,
                                precip: null,
                                windDir: null,
                                windSpeed: null
                            }
                        };
                        let hour = loc.time.match(/\d+:/)[0];
                        let weather = obj.weather;
                        let details = obj.details;

                        hour.length === 2 ? hour = '0' + hour : false;

                        weather.date = dateFormatter(dataForecast[i].date);

                        dataForecast[i].hour.forEach((item) => {
                            if (hour === item.time.match(/\d\d:/)[0]) {
                                weather.descr = item.condition.text;
                                weather.url = weather.descr.toLowerCase().replace(/\s/g, '-');
                                weather.temp = item.temp_c;

                                details.pressure = item.pressure_mb + 'mb';
                                details.humidity = item.humidity + '%';
                                details.precip = item.precip_mm + 'mm';
                                details.windDir = item.wind_dir;
                                details.windSpeed = (item.wind_kph * 0.28).toFixed(2) + 'm/s';
                            }
                        });

                        forecast.push(obj);
                    }

                    self.fire('forecast', [self.data]);
                })
                    .catch((error) => {
                        self.fire('error', ['Error',
                            'Sorry, we can\'t show you any information\nStatus: ' + error,
                            true]);
                    });
        } else {
            self.fire('no-coords');
        }
    },

    getAutocomplete: function (country, city) {
        let self = this;
        let parCountry = country || '';
        let parCity = city ? ', ' + city : '';
        let parameters = parCountry + parCity;
        let url = 'https://api.apixu.com/v1/search.json?key=db798d6f0c304603acb101529172908&q=' + parameters;
        let result = [];

        fetch(url, {
            method: 'GET',
            cache: 'no-cache'
        })
            .then(self.status)
            .then(self.json)
            .then((info) => {
                let wantedCity = city.toLowerCase();
                let wantedCountry = country.toLowerCase();
                let matchedCity;
                let matchedCountry;

                info.forEach((item) => {
                    let obj = {};

                    matchedCity = item.name.match(new RegExp(wantedCity, 'i')) || '';
                    matchedCountry = item.country.match(new RegExp(wantedCountry, 'i')) || '';

                    if (matchedCity.length > 0 && matchedCity[0].length > 0) {
                        matchedCity = matchedCity[0].toLowerCase();
                    } else {
                        matchedCity = '';
                    }
                    if (matchedCountry.length > 0 && matchedCountry[0].length > 0) {
                        matchedCountry = matchedCountry[0].toLowerCase();
                    } else {
                        matchedCountry = '';
                    }

                    if (wantedCity === matchedCity && wantedCountry === matchedCountry) {
                        obj.city = capitalizeFL(item.name.match(/[\w ]+/)[0]);
                        obj.country = capitalizeFL(item.country.match(/[\w ]+/)[0]);
                        obj.latitude = item.lat;
                        obj.longitude = item.lon;

                        result.push(obj);
                    }
                });

                self.fire('autocomplete', [result]);
            })
            .catch((error) => {
                self.fire('error', 'Sorry, we can\'t show you any information\nStatus: ' + error);
            });

    }
};

export default dataMiner;
