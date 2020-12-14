/* jshint esversion: 6 */

/**
 * Class to create 2D vectors and perform basic calculations with it.
 */
function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.add = function (v) {
    if (v instanceof Vector) {
        this.x += v.x;
        this.y += v.y;
    } else {
        this.x += v;
        this.y += v;
    }
    return this;
};

Vector.prototype.subtract = function (v) {
    if (v instanceof Vector) {
        this.x -= v.x;
        this.y -= v.y;
    } else {
        this.x -= v;
        this.y -= v;
    }
    return this;
};

Vector.prototype.multiply = function (v) {
    if (v instanceof Vector) {
        this.x *= v.x;
        this.y *= v.y;
    } else {
        this.x *= v;
        this.y *= v;
    }
    return this;
};

Vector.prototype.divide = function (v) {
    if (v instanceof Vector) {
        if (v.x != 0) this.x /= v.x;
        if (v.y != 0) this.y /= v.y;
    } else {
        if (v != 0) {
            this.x /= v;
            this.y /= v;
        }
    }
    return this;
};

Vector.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.normalize = function () {
    return this.divide(this.length());
};

