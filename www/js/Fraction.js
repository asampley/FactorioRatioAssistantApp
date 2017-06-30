Fraction = function(numerator, denominator = 1) {
	// make sure they are integers
	if (!Number.isInteger(numerator)) {
		throw "Numerator is not an integer";
	}
	if (!Number.isInteger(denominator)) {
		throw "Denominator is not an integer";
	}

	this.num = numerator;
	this.den = denominator;

	if (this.den == 0) {
		throw "Denominator is 0";
	}
}

Fraction.prototype.reduce = function() {
	gcd = this.gcd();

	return new Fraction(Math.floor(this.num / gcd), Math.floor(this.den / gcd));
}

Fraction.prototype.gcd = function() {
	gcd = 1;
	a = this.num;
	b = this.den;

	while (true) {
		if (a == b) {
			// if equal, the gcd is the number times our gcd so far
			return gcd * a;
		} else if ((a % 2 == 0) && (b % 2 == 0)) {
			// if both are even, multiply gcd by 2, and divide each by two
			gcd *= 2;
			a /= 2;
			b /= 2;	
		} else if ((a % 2 == 0) && (b % 2 != 0)) {
			// if a is even and b is odd, then the two is useless, and we remove it from a
			a /= 2;
		} else if ((a % 2 != 0) && (b % 2 == 0)) {
			// if b is even and a is odd, then the two is useless, and we remove it from b
			b /= 2;
		} else {
			// if both are odd, let's do some math magic
			if (a < b) {
				b = (b - a) / 2;
			} else {
				a = (a - b) / 2;
			}
		}
	}
}

Fraction.prototype.multiply = function(other) {
	if (other instanceof Fraction) {
		return new Fraction(this.num * other.num, this.den * other.den).reduce();
	} else if (Number.isInteger(other)) {
		return new Fraction(this.num * other, this.den).reduce();
	} else {
		throw "Invalid multiplicand";
	}
}

Fraction.prototype.divide = function(other) {
	if (other instanceof Fraction) {
		return new Fraction(this.num * other.den, this.den * other.num).reduce();
	} else if (Number.isInteger(other)) {
		return new Fraction(this.num, this.den * other).reduce();
	} else {
		throw "Invalid divisor";
	}
}

Fraction.prototype.inverse = function() {
	return new Fraction(this.den, this.num);
}

Fraction.prototype.toFloat = function() {
	return this.num / this.den;
}

Fraction.fromInt = function(int) {
	return new Fraction(Math.floor(int), 1);
}

Fraction.parse = function(string, radix = 10) {
	var split = string.split('/');
	assert(split.length > 0 && split.length < 3);

	var num = parseInt(split[0].trim(), radix);
	var den = 1;
	if (split.length > 1) {
		den = parseInt(split[1].trim(), radix);
	}

	return new Fraction(num, den);
}

Fraction.prototype.toString = function() {
	return this.num + (this.den != 1 ? " / " + this.den : "");
}