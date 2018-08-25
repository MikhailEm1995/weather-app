const cities = {
    getMain: () => {
        let item = JSON.parse(localStorage.getItem('main')) || false;
        cities.fire('gotMain', [item, 'main']);

        return item;
    },

    getCities: () => {
        let item = JSON.parse(localStorage.getItem('cities'));
        cities.fire('gotCities', [item]);

        return item;
    },

    setMain: function (coords) {
        let self = this;
        let currCrds = localStorage.getItem('main');

        if (currCrds) {
            currCrds = JSON.parse(currCrds);
            if (coords[0] === currCrds[0] && coords[1] === currCrds[1]) {
                self.fire('main exist', ['Success', 'This city is already added', true]);
            }
        }

        localStorage.setItem('main', JSON.stringify(coords));

        return true;
    },

    setCity: function (coords) {
        let self = this;
        let json = JSON.parse(localStorage.getItem('cities'));

        if (json) {
            let checker = true;

            json.forEach((item) => {
                if (coords[0] === item[0] && coords[1] === item[1]) {
                    checker = false;
                }
            });

            if (checker) {
                json.push(coords);
                localStorage.setItem('cities', JSON.stringify(json));
            } else {
                self.fire('cityNotAdded', ['Success', 'This city is already added', false, true]);
                return false;
            }
        } else {
            localStorage.setItem('cities', JSON.stringify([coords]));
        }

        self.fire('cityAdded', [[coords]]);

        return true;
    },

    setAllCities: function (arrCoords) {
        let self = this;

        arrCoords.forEach((coords) => {
            self.setCity(coords);
        });

        return true;
    },

    deleteCity: function (coords, city) {
        let self = this;
        let cities = JSON.parse(localStorage.getItem('cities'));
        let index;

        cities.forEach((item, i) => {
            if (item[0] === coords[0] && item[1] === coords[1]) {
                index = i;
            }
        });

        cities.splice(index, 1);
        localStorage.setItem('cities', JSON.stringify(cities));

        self.fire('cityDeleted', ['Success', city + ' has been successfully removed', false, false]);

        return true;
    }
};

export default cities;
