const fn$priv = Symbol("Loop.fn");
const loop$priv = Symbol("Loop.loop");
const current$priv = Symbol("Loop.current");
const timestamp$priv = Symbol("Loop.timestamp");
const interval$priv = Symbol("Loop.interval");

/**
 * Manage a repeatedly executed function.
 * @constructor
 * @param {function} fn
 */
function Loop(fn) {
    this[fn$priv] = fn;
}

Loop.prototype[fn$priv] = null;
Loop.prototype[loop$priv] = null;
Loop.prototype[current$priv] = null;
Loop.prototype[timestamp$priv] = null;
Loop.prototype[interval$priv] = 0;

/**
 * Run the function once.
 * @returns {Promise|null}
 */
Loop.prototype.once = function() {
    return this[fn$priv]();
};

/**
 * Change execution interval.  If loop is started, run now.
 * @param {number} milliseconds
 */
Loop.prototype.changeInterval = function(milliseconds) {
    this[interval$priv] = milliseconds;
    if (this.started) this.now();
};

/**
 * Begin loop.
 */
Loop.prototype.start = function() {
    var loop;

    if (this.started) return;

    if (this.running) return this[current$priv].catch(e => false).then(() => {
        this.start();
    });

    loop = () => {
        var curr;

        this[timestamp$priv] = new Date();

        curr = Promise.resolve(this.once()).catch(e => false).then(() => {
            var interval = this[interval$priv];

            if (this[current$priv] === curr) {
                this[current$priv] = null;
                this[loop$priv] = setTimeout(loop, interval - this.lastrun);
            }
        });

        this[current$priv] = curr;
    };

    this[loop$priv] = setTimeout(loop, 0);
};

/**
 * Run an iteration immediately and schedule future iterations accordingly.
 */
Loop.prototype.now = function() {
    if (this.started && this.running) {
        // current run includes now; do nothing
    } else if (this.started) {
        this.stop();
        this.start();
    } else if (this.running) {
        this[current$priv].catch(e => false).then(() => this.start());
    } else {
        this.start();
    }
};

/**
 * Stop loop.
 */
Loop.prototype.stop = function() {
    if (!this.started) return;

    if (this.running) return this[current$priv].catch(e => false).then((v) => {
        this.stop();
    });

    clearTimeout(this[loop$priv]);
    this[loop$priv] = null;
};

Object.defineProperties(Loop.prototype, {
    /**
     * Minimum number of milliseconds between runs.
     * @name Loop#interval
     * @type {number}
     * @readonly
     */
    interval: {
        configurable: true,
        enumerable: true,
        get: function() {return this[interval$priv];}
    },

    /**
     * Time of last run.
     * @name Loop#timestamp
     * @type {Date}
     * @readonly
     */
    timestamp: {
        configurable: true,
        enumerable: true,
        get: function() {return this[timestamp$priv];}
    },

    /**
     * Milliseconds since last run.
     * @name Loop#lastrun
     * @type {number}
     * @readonly
     */
    lastrun: {
        configurable: true,
        enumerable: true,
        get: function() {
            return this.timestamp
                ? Date.now() - this.timestamp.getTime()
                : Infinity;
        }
    },

    /**
     * True if loop iteration is currently running.
     * @name Loop#running
     * @type {boolean}
     * @readonly
     */
    running: {
        configurable: true,
        enumerable: true,
        get: function() {return Boolean(this[current$priv]);}
    },

    /**
     * True if loop is started.
     * @name Loop#started
     * @type {boolean}
     * @readonly
     */
    started: {
        configurable: true,
        enumerable: true,
        get: function() {return Boolean(this[loop$priv]);}
    },

    /**
     * True if loop is stopped.
     * @name Loop#stopped
     * @type {boolean}
     * @readonly
     */
    stopped: {
        configurable: true,
        enumerable: true,
        get: function() {return !Boolean(this[loop$priv]);}
    }
});

module.exports = Loop;
