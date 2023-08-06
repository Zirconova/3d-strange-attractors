class Vector {
	constructor(x,y,z) {
		// x, y, and z coordinates of the vector
		this.x = x;
		this.y = y;
		this.z = z;
	}
	magnitude() {
		// Return the magnitude of this vector
		return Math.hypot(x, y, z);
	}
	normalize() {
		let mag = this.magnitude();
		let result = new Vector(this.x/mag, this.y/mag, this.z/mag);
		return result;
	}
	dist(vec) {
		// Return the distance from this vector to the vector passed to the method
		return Math.sqrt((this.x-vec.x)**2 + (this.y-vec.y)**2 + (this.z-vec.z)**2);
	}
	add(vec) {
		// Return the sum of this vector and the vector passed to the method
		let result = new Vector(this.x+vec.x, this.y+vec.y, this.z+vec.z);
		return result;
	}
	subtract(vec) {
		// Return the difference of this vector and the vector passed to the method
		let result = new Vector(this.x-vec.x, this.y-vec.y, this.z-vec.z);
		return result;
	}
	multiply(num) {
		// Return the product of this vector and the vector passed to the method
		let result = new Vector(this.x*num, this.y*num, this.z*num);
		return result;
	}
	dotProd(vec) {
		let result = this.x*vec.x + this.y*vec.y + this.z*vec.z;
		return result;
	}
	angle(vec) {
		return Math.acos(this.dotProd(vec)/this.magnitude()/vec.magnitude());
	}
	crossProd(vec) {
		let result = new Vector(this.y*vec.z - this.z*vec.y, this.z*vec.x - this.x*vec.z, this.x*vec.y - this.y*vec.x);
		return result;
	}
	rotX(angle) {
		// Rotate this vector in the x axis by the angle given
		let newZ = this.z*Math.cos(angle) - this.y*Math.sin(angle);
		let newY = this.y*Math.cos(angle) + this.z*Math.sin(angle);
		this.y = newY;
		this.z = newZ;
	}
	rotY(angle) {
		// Rotate this vector in the y axis by the angle given
		let newX = this.x*Math.cos(angle) - this.z*Math.sin(angle);
		let newZ = this.z*Math.cos(angle) + this.x*Math.sin(angle);
		this.x = newX;
		this.z = newZ;
	}
	rotZ(angle) {
		// Rotate this vector in the z axis by the angle given
		let newX = this.x*Math.cos(angle) - this.y*Math.sin(angle);
		let newY = this.y*Math.cos(angle) + this.x*Math.sin(angle);
		this.x = newX;
		this.y = newY;
	}
}