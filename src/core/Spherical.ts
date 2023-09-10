/**
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * The polar angle (phi) is measured from the positive y-axis. The positive y-axis is up.
 * The azimuthal angle (theta) is measured from the positive z-axis.
 */

import { Vec3 } from 'wgpu-matrix';
import { radians } from './types';
import { Clone } from './Clone';
import MathUtils from './MathUtils';

// Taken from three.js

export default class Spherical implements Clone {
    radius: number;
    phi: radians;
    theta: radians;

	constructor(radius = 1, phi = 0, theta = 0) {
		this.radius = radius;
		this.phi = phi; // polar angle
		this.theta = theta; // azimuthal angle
	}

	set(radius: number, phi: radians, theta: radians) {
		this.radius = radius;
		this.phi = phi;
		this.theta = theta;

		return this;
	}

	copy(other: Spherical) {
		this.radius = other.radius;
		this.phi = other.phi;
		this.theta = other.theta;

		return this;
	}

	// restrict phi to be between EPS and PI-EPS
	makeSafe() {
		const EPS = 0.000001;
		this.phi = Math.max( EPS, Math.min( Math.PI - EPS, this.phi ) );

		return this;
	}

	setFromVec3(v: Vec3) {
		return this.setFromCartesianCoords(v[0], v[1], v[2]);
	}

	setFromCartesianCoords(x: number, y: number, z: number) {
		this.radius = Math.sqrt(x * x + y * y + z * z);

		if (this.radius === 0) {
			this.theta = 0;
			this.phi = 0;
		} else {
			this.theta = Math.atan2(x, z);
			this.phi = Math.acos(MathUtils.clamp( y / this.radius, - 1, 1 ));
		}

		return this;
	}

	clone() {
		return new Spherical().copy(this);
	}
}

export { Spherical };
