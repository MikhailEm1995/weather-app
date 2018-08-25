import { select, selectAll } from './dom-facades';
import { makePublishers, subscribe } from './publisher';
import { City, cityHook } from './City';
import { Message, msgHook } from './Message';
import userLocation from './user-location';
import dataMiner from './data-miner';
import cities from './local-storage';
import addCities from './choosing-city';

(function () {
    let mediator = {
        barrier: true,

        citiesNumber: 0,

        citiesArr: 0,

        currentNumber: 0,

        tuneTileSize: function (obj) {
            let id = '#' + obj.id;
            let todaySelector = id + ' .weather__today';
            let forecastSelector = id + ' .weather__forecast';
            let todayTileSize = select(todaySelector).getBoundingClientRect().height;
            let forecastTileSize = select(forecastSelector).getBoundingClientRect().height;
            let headerSize = select(id + ' .city__header').getBoundingClientRect().height;
            let headerFontSize = 18;

            function changeHeight(el, size) {
                el.style.height = size + 'px';
                el.classList.add('weather__tile--flexbox');
            }

            if (todayTileSize > forecastTileSize) {
                let tiles = selectAll(forecastSelector + ' .weather__tile');

                tiles.forEach((item) => {
                    changeHeight(item, todayTileSize);
                });
            } else {
                let forecastTiles = selectAll(forecastSelector + ' .weather__tile');
                let todayTile = select(todaySelector + ' .weather__tile');

                forecastTiles.forEach((item) => {
                    changeHeight(item, forecastTileSize);
                });

                changeHeight(todayTile, forecastTileSize);
            }

            while (headerSize > 40) {
                select(id + ' .city__location').style.fontSize = (headerFontSize - 1) + 'px';
                headerFontSize -= 1;
                headerSize = select(id + ' .city__header').getBoundingClientRect().height;
            }

        },

        citySubscribe: function (obj) {
            let self = this;

            obj.on('cityRendered', 'factory', Message);
            if (obj.status === 'main') {
                obj.on('changeTrigger', 'displayChangeMode', addCities);
            } else {
                obj.on('cityRemoved', 'deleteCity', cities);
            }
            self.fire('citySubscribe', [obj]);
        },

        setBackground: function (time) {
            let hour = time.match(/\d+/)[0];

            if (hour <= 20 && hour >= 8) {
                document.body.style.backgroundColor = '#fdfacd';
            } else {
                document.body.style.backgroundColor = '#08254a';
            }
        },

        returnStatus: function (obj) {
            let self = this;

            if (obj.status === 'main') {
                self.setBackground(obj.location.time);
                select('.main-city').innerHTML = '';
                self.fire('status', ['MainCity', obj]);
            } else {
                self.fire('status', ['City', obj]);
            }
        },

        semaphore: function () {
            let self = this;
            let max = self.citiesNumber;
            let current = self.currentNumber;

            if (current < max) {
                dataMiner.getForecast(self.citiesArr[self.currentNumber], false);
                self.currentNumber += 1;
            } else {
                self.currentNumber = 0;
                self.citiesArr = 0;
                self.citiesNumber = 0;
            }
        },

        startChain: function (arr) {
            let self = this;

            if (arguments.length === 0) {
                return false;
            } else if (arr instanceof Array && arr.length === 1) {
                dataMiner.getForecast(arr[0], false);
            } else if (arr instanceof Array && arr.length > 1) {
                self.citiesArr = arr;
                self.citiesNumber = arr.length;
                msgHook.on('finish', 'semaphore', self);
                mediator.semaphore();
            } else {
                return false;
            }
        },

        citiesInit: function () {
            let self = this;

            if (self.barrier) {
                self.barrier = false;
                cities.getCities();
            }
        }
    };

    makePublishers([cities, dataMiner, City.prototype, Message.prototype, userLocation,
        mediator, msgHook, addCities, cityHook]);

    subscribe([
        {
            publisher: cities,
            events: [
                {
                    event: 'gotMain',
                    subscribers: [
                        {
                            obj: dataMiner,
                            method: 'getForecast'
                        }
                    ]
                },
                {
                    event: 'gotCities',
                    subscribers: [
                        {
                            obj: mediator,
                            method: 'startChain'
                        }
                    ]
                },
                {
                    event: 'cityNotAdded',
                    subscribers: [
                        {
                            obj: Message,
                            method: 'factory'
                        }
                    ]
                },
                {
                    event: 'cityAdded',
                    subscribers: [
                        {
                            obj: mediator,
                            method: 'startChain'
                        }
                    ]
                },
                {
                    event: 'cityDeleted',
                    subscribers: [
                        {
                            obj: Message,
                            method: 'factory'
                        }
                    ]
                },
                {
                    event: 'main exist',
                    subscribers: [
                        {
                            obj: Message,
                            method: 'factory'
                        }
                    ]
                }
            ]
        },
        {
            publisher: dataMiner,
            events: [
                {
                    event: 'forecast',
                    subscribers: [
                        {
                            obj: mediator,
                            method: 'returnStatus'
                        }
                    ]
                },
                {
                    event: 'autocomplete',
                    subscribers: [
                        {
                            obj: addCities,
                            method: 'renderListItems'
                        }
                    ]
                },
                {
                    event: 'error',
                    subscribers: [
                        {
                            obj: Message,
                            method: 'factory'
                        }
                    ]
                },
                {
                    event: 'no-coords',
                    subscribers: [
                        {
                            obj: userLocation,
                            method: 'getLocation'
                        }
                    ]
                }
            ]
        },
        {
            publisher: userLocation,
            events: [
                {
                    event: 'location',
                    subscribers: [
                        {
                            obj: dataMiner,
                            method: 'getForecast'
                        },
                        {
                            obj: cities,
                            method: 'setMain'
                        }
                    ]
                },
                {
                    event: 'rejected',
                    subscribers: [
                        {
                            obj: addCities,
                            method: 'displayChooseMode'
                        }
                    ]
                }
            ]
        },
        {
            publisher: mediator,
            events: [
                {
                    event: 'status',
                    subscribers: [
                        {
                            obj: City,
                            method: 'factory'
                        }
                    ]
                },
                {
                    event: 'citySubscribe',
                    subscribers: [
                        {
                            obj: City.prototype,
                            method: 'render'
                        }
                    ]
                }
            ]
        },
        {
            publisher: msgHook,
            events: [
                {
                    event: 'finish',
                    subscribers: [
                        {
                            obj: mediator,
                            method: 'citiesInit'
                        }
                    ]
                }
            ]
        },
        {
            publisher: addCities,
            events: [
                {
                    event: 'input',
                    subscribers: [
                        {
                            obj: dataMiner,
                            method: 'getAutocomplete'
                        }
                    ]
                },
                {
                    event: 'add city',
                    subscribers: [
                        {
                            obj: cities,
                            method: 'setCity'
                        }
                    ]
                },
                {
                    event: 'add all',
                    subscribers: [
                        {
                            obj: cities,
                            method: 'setAllCities'
                        }
                    ]
                },
                {
                    event: 'main changed',
                    subscribers: [
                        {
                            obj: dataMiner,
                            method: 'getForecast'
                        },
                        {
                            obj: cities,
                            method: 'setMain'
                        }
                    ]
                },
                {
                    event: 'main chosen',
                    subscribers: [
                        {
                            obj: dataMiner,
                            method: 'getForecast'
                        },
                        {
                            obj: addCities,
                            method: 'addTriggerButton'
                        },
                        {
                            obj: addCities,
                            method: 'hideAddCitiesBlock'
                        },
                        {
                            obj: cities,
                            method: 'setMain'
                        }
                    ]
                }
            ]
        },
        {
            publisher: cityHook,
            events: [
                {
                    event: 'cityHooked',
                    subscribers: [
                        {
                            obj: mediator,
                            method: 'citySubscribe'
                        },
                        {
                            obj: mediator,
                            method: 'tuneTileSize'
                        }
                    ]
                }
            ]
        }
    ]);

    // app's initiation (it begins chain of events)
    cities.getMain();

    addCities.addCitiesInit();

}());
