const publisher = {
    subscribers: {
        any: []
    },

    on: function (type, fn, context) {
        type = type || 'any';
        fn = typeof fn === 'function' ? fn : context[fn];

        if (typeof this.subscribers[type] === 'undefined') {
            this.subscribers[type] = [];
        }

        this.subscribers[type].push({ fn, context: context || this });
    },

    unsubscribe: function (type, fn, context) {
        this.visitSubscribers('unsubscribe', type, fn, context);
    },

    fire: function (type, ...publication) {
        let self = this;
        let args = publication;

        args.unshift(type);
        args.unshift('publish');

        self.visitSubscribers.call(self, ...args);
    },

    visitSubscribers: function (action, type, arg, context) {
        let pubtype = type || 'any';
        let subscribers = this.subscribers[pubtype];
        let i;
        let max = subscribers ? subscribers.length : 0;

        arg === undefined ? arg = [] : arg;
        for (i = 0; i < max; i += 1) {
            if (action === 'publish') {
                subscribers[i].fn.call(subscribers[i].context, ...arg, context);
            } else {
                if (subscribers[i].fn === arg &&
                    subscribers[i].context === context) {
                    subscribers.splice(i, 1);
                }
            }
        }
    }
};

function makePublisher(o) {
    let i;

    for (i in publisher) {
        if (publisher.hasOwnProperty(i) && typeof publisher[i] === 'function') {
            o[i] = publisher[i];
        }
    }

    o.subscribers = { any: [] };
}

function makePublishers(arr) {
    let i = 0;
    let len = arr.length;

    for (; i < len; i += 1) {
        makePublisher(arr[i]);
    }
}

function subscribe(arr) {
    arr.forEach((obj) => {
        let publisher = obj.publisher;

        obj.events.forEach((item) => {
            let event = item.event;

            item.subscribers.forEach((subscriber) => {
                publisher.on(event, subscriber.method, subscriber.obj);
            });
        });
    });
}

export { publisher, makePublisher, makePublishers, subscribe };
