function select(selector) {
    return document.querySelector(selector);
}

function selectAll(selector) {
    return document.querySelectorAll(selector);
}

function appendChildren(parent, ...children) {
    let i = 0;
    let len;

    if (children.length === 1 && children[0] instanceof Array) {
        len = children[0].length;
        children = children[0];
    } else {
        len = children.length;
    }

    for (; i < len; i += 1) {
        parent.appendChild(children[i]);
    }
}

function append(arr) {
    arr.forEach((item) => {
        appendChildren(item.parent, item.children);
    });
}

function createEl(tag, classNames, text, data, attributes, children) {
    let el = document.createElement(tag);
    let prop;

    if (classNames) {
        if (classNames instanceof Array) {
            classNames.forEach((className) => {
                el.classList.add(className);
            });
        } else {
            el.classList.add(classNames);
        }
    }

    if (text) {
        el.innerHTML = text;
    }

    if (data) {
        for (prop in data) {
            if (data.hasOwnProperty(prop)) {
                el.dataset[prop] = data[prop];
            }
        }
    }

    if (attributes) {
        for (prop in attributes) {
            if (attributes.hasOwnProperty(prop)) {
                el[prop] = attributes[prop];
            }
        }
    }

    if (children) {
        if (children instanceof Array) {
            children.forEach((child) => {
                append([
                    { parent: el, children: child }
                ]);
            });
        } else {
            append([
                { parent: el, children }
            ]);
        }
    }

    return el;
}

function toggleState(trigger, firstCallback, secondCallback) {
    if (!trigger.dataset.state) {
        trigger.dataset.state = '0';
    }

    if (trigger.dataset.state === '0') {
        firstCallback();
        trigger.dataset.state = '1';
    } else {
        secondCallback();
        trigger.dataset.state = '0';
    }
}

function capitalizeFL(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export { createEl, append, appendChildren, select, selectAll, toggleState, capitalizeFL };
