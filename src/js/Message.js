import { makePublisher } from './publisher';
import { createEl, select } from './dom-facades';

const msgHook = {
    finish: function () {
        let self = this;

        self.fire('finish', true);
    }
};

function Message() {}

Message.prototype.ids = [];

Message.prototype.render = function (obj) {
    let self = obj;
    let parent;
    let msgBlock = self.createMsgBlock();

    if (self.parent) {
        self.parent = select('.add-cities .msg-container');
        parent = self.parent;
        parent.appendChild(msgBlock);
    } else {
        self.parent = select('.msg-container--position-fixed .msg-container__centering');
        parent = self.parent;
        parent.appendChild(msgBlock);
    }

    self.fire('msgRendered');

    setTimeout(function () {
        if (self.ids.indexOf(self.id) > -1) {
            select('#' + self.id).classList.add('msg--faded-out');
            setTimeout(function () {
                self.remove(self);
            }, 1000);
        }
    }, 6000);
};

Message.prototype.createMsgBlock = function () {
    let self = this;
    let msgBlockClassNames = ['msg'];

    function createText() {
        let text = self.text + self.msg;
        let classNames = ['msg__text'];

        if (self.type === 'error') {
            classNames.push('msg__text--error');
        } else {
            classNames.push('msg__text--success');
        }

        return createEl('span', classNames, text);
    }

    function createButton() {
        let el;
        let classNames = ['msg__close'];
        let data = { mission: 'close', victim: self.id };

        if (self.type.toLowerCase() === 'error') {
            classNames.push('msg__close--error');
        } else {
            classNames.push('msg__close--success');
        }

        el = createEl('button', classNames, false, data, { title: 'This button closes the message' });
        el.addEventListener('click', () => {
            let index = self.ids.indexOf(self.id);

            self.ids.splice(index, 1);
            self.remove(self);
        });

        return el;
    }

    if (self.type === 'error') {
        msgBlockClassNames.push('msg--error');
    } else {
        msgBlockClassNames.push('msg--success');
    }

    return createEl('div',
        msgBlockClassNames,
        false,
        false,
        { id: self.id },
        [createText(), createButton()]);
};

Message.prototype.remove = function (obj) {
    let self = obj;
    let msg = select('#' + self.id);
    let index = self.ids.indexOf(self.id);

    msg.parentNode.removeChild(msg);
    self.ids.splice(index, 1);
};

Message.factory = function (type, msg, bg, parent) {
    let constr = type;
    let obj;

    if (typeof Message[constr] !== 'function') {
        throw {
            name: 'Error',
            message: constr + ' doesn’t exist'
        };
    }

    if (typeof Message[constr].prototype.render !== 'function') {
        Message[constr].prototype = new Message();
    }

    obj = new Message[constr](msg, bg, parent);

    makePublisher(obj);
    obj.on('msgCreated', 'render', obj);
    obj.on('msgRendered', 'finish', msgHook);

    obj.fire('msgCreated', [obj]);

    return obj;
};

Message.Error = function (msg, bg, parent) {
    this.type = 'error';
    this.text = 'Error! ';

    this.msg = msg;
    this.bg = bg;
    this.parent = parent;

    if (this.ids.length) {
        let lastEl = this.ids[this.ids.length - 1];
        let indexOfLast = +lastEl.match(/\d+/)[0];

        this.id = 'msg-' + (indexOfLast + 1);
    } else {
        this.id = 'msg-' + 1;
    }

    this.ids.push(this.id);
};

Message.Success = function (msg, bg, parent) {
    this.type = 'success';
    this.text = 'Success! ';

    this.msg = msg;
    this.bg = bg;
    this.parent = parent;

    if (this.ids.length) {
        let lastEl = this.ids[this.ids.length - 1];
        let indexOfLast = +lastEl.match(/\d+/)[0];

        this.id = 'msg-' + (indexOfLast + 1);
    } else {
        this.id = 'msg-' + 1;
    }

    this.ids.push(this.id);
};

export { Message, msgHook };
