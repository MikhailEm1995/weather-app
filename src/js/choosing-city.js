import { createEl, select, selectAll, toggleState, capitalizeFL } from './dom-facades';

const addCities = {
    state: undefined,

    citiesArr: [],

    triggerFunc: function () {
        let self = addCities;
        let btnTrig = select('button[data-toggle="veil"]');

        toggleState(btnTrig,
            () => {
                self.displayAddMode();
            },
            () => {
                self.hideAddCitiesBlock();
            }
        );
    },

    addTriggerButton: function () {
        let self = this;
        let btnTrig = select('button[data-toggle="veil"]');

        btnTrig.addEventListener('click', self.triggerFunc);
        btnTrig.classList.remove('btn--disabled');
    },

    displayAddCitiesBlock: function () {
        let trigger = select('button[data-toggle="veil"]');
        let triggerText = select('.header__btns .btn__text');
        let triggerIcon = select('.header__btns .btn__icon');

        select('.veil').style.display = 'block';
        document.body.style.overflow = 'hidden';

        trigger.classList.remove('btn--add');
        trigger.classList.add('btn--remove');
        triggerText.innerHTML = 'Close';
        triggerIcon.classList.remove('btn__icon--plus-l');
        triggerIcon.classList.add('btn__icon--cross-l');
    },

    hideAddCitiesBlock: function () {
        let btn = select('button[data-mission="add all"]');
        let victim = select('.veil');
        let trigger = select('button[data-toggle="veil"]');
        let triggerText = select('.header__btns .btn__text');
        let triggerIcon = select('.header__btns .btn__icon');

        victim.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0';
        select('h2[data-headerid="2"]').style.display = 'none';
        btn.style.display = 'none';
        selectAll('.cities-list__item').forEach((item) => {
            item.parentNode.removeChild(item);
        });

        select('#city').value = '';
        select('#country').value = '';

        trigger.classList.remove('btn--remove');
        trigger.classList.add('btn--add');
        trigger.dataset.state = '0';
        triggerText.innerHTML = 'Add cities';
        triggerIcon.classList.remove('btn__icon--cross-l');
        triggerIcon.classList.add('btn__icon--plus-l');
    },

    createListItem: function (city) {
        let self = this;
        let listItem;
        let text = capitalizeFL(city.city) + ', ' + capitalizeFL(city.country);
        let cityText;
        let cityTextContainer;
        let btnContainer;
        let addBtn = self.createAddButton(city);

        cityText = createEl('span', 'cities-list__item', text);
        cityTextContainer = createEl('div', ['col', 'col--10-7', 'col--padding'],
            false, false, false, cityText);
        btnContainer = createEl('div', ['col', 'col--10-3', 'col--padding'],
            false, false, false, addBtn);
        listItem = createEl('li', 'cities-list__item', false, false, false,
            [cityTextContainer, btnContainer]);

        function addCity() {
            addBtn.removeEventListener('click', addCity);
            addBtn.innerHTML = 'Loading...';

            if (self.state !== 'choose') {
                setTimeout(function () {
                    listItem.parentNode.removeChild(listItem);
                }, 400);
            }
            if (self.state === 'add') {
                self.fire('add city', [[city.latitude, city.longitude]]);
            } else if (self.state === 'change') {
                self.fire('main changed', [[city.latitude, city.longitude], 'main']);
            } else {
                self.fire('main chosen', [[city.latitude, city.longitude], 'main']);
            }
        }

        addBtn.addEventListener('click', addCity);

        return listItem;
    },

    createAddButton: function (city) {
        let self = this;
        let btnText;
        let btnIcon;
        let btn;
        let text;

        switch (self.state) {
            case 'choose':
                text = 'Choose city';
                break;
            case 'change':
                text = 'Change city';
                break;
            default:
                text = 'Add city';
        }

        btnText = createEl('span',
            ['btn__text', 'btn__text--add', 'btn__text--size-s'],
            text);
        btnIcon = createEl('div',
            ['btn__icon', 'btn__icon--size-s', 'btn__icon--plus-s']);
        btn = createEl('button',
            ['btn', 'btn--size-s', 'btn--add', 'btn--wide'],
            false,
            { mission: 'add', city: (city.latitude + ', ' + city.longitude) },
            { title: `This button adds ${city.city}` },
            [btnIcon, btnText]);

        return btn;
    },

    renderListItems: function (cities) {
        let self = this;

        selectAll('.cities-list__item').forEach((item) => {
            item.parentNode.removeChild(item);
        });

        cities.forEach((city) => {
            select('.cities-list').appendChild(self.createListItem(city));
            if (self.state === 'add') {
                self.citiesArr.push([city.latitude, city.longitude]);
            }
        });

        self.displayHeading();

        if (self.state === 'add') {
            self.displayAddAllBtn();
            self.addAllEvent();
        }

        return true;
    },

    displayAddAllBtn: function () {
        let btn = select('button[data-mission="add all"]');

        btn.style.display = 'block';
    },

    displayHeading: function () {
        select('h2[data-headerid="2"]').style.display = 'block';
    },

    hideHeading: function () {
        select('h2[data-headerid="2"]').style.display = 'none';
    },

    displayChooseMode: function () {
        let self = this;
        let btn = select('button[data-toggle="veil"]');
        let heading = select('h2[data-headerid="1"]');

        self.state = 'choose';

        btn.classList.add('btn--disabled');
        btn.removeEventListener('click', self.triggerFunc);

        heading.innerHTML = 'Find your city with the form below';

        self.displayAddCitiesBlock();
    },

    displayChangeMode: function () {
        let self = this;
        let btnTrig = select('.btn[data-toggle="veil"]');

        self.state = 'change';

        select('h2[data-headerid="1"]').innerHTML = 'Find another "main" city';
        btnTrig.dataset.state = '1';
        self.displayAddCitiesBlock();
    },

    displayAddMode: function () {
        let self = this;

        select('h2[data-headerid="1"]').innerHTML = 'Add some extra cities to look for their weather';

        self.state = 'add';
        self.displayAddCitiesBlock();
    },

    addAllEvent: function () {
        let self = this;
        let btn = select('.btn[data-mission="add all"]');

        function addAll() {
            btn.removeEventListener('click', addAll);
            btn.innerHTML = 'Loading...';
            setTimeout(function () {
                self.hideHeading();
                btn.style.display = 'none';
                select('.cities-list').innerHTML = '';
            }, 400);
            self.fire('add all', [self.citiesArr]);
        }

        btn.addEventListener('click', addAll);
    },

    inputEvents: function () {
        let self = this;
        let country = select('#country');
        let city = select('#city');
        let cityVal = '';
        let countryVal = '';

        country.addEventListener('input', function () {
            countryVal = country.value;
            self.citiesArr = [];
            self.fire('input', [countryVal, cityVal]);
        });

        city.addEventListener('input', function () {
            cityVal = city.value;
            self.citiesArr = [];
            self.fire('input', [countryVal, cityVal]);
        });

    },

    addCitiesInit: function () {
        let self = this;

        self.addTriggerButton();
        self.inputEvents();
    }
};

export default addCities;
