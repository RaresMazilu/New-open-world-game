export class Vehicle {
  constructor() {
    const THREEref = (typeof THREE !== 'undefined') ? THREE : window.THREE;
    this.mesh = new THREEref.Object3D();

    // realistic sporty hatch shape
    const bodyMat = new THREEref.MeshStandardMaterial({ color: 0xff453d, metalness: 0.3, roughness: 0.4 });
    const body = new THREEref.Mesh(new THREEref.BoxGeometry(2.0, 0.7, 4.4), bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    body.receiveShadow = true;
    this.mesh.add(body);

    const hood = new THREEref.Mesh(new THREEref.BoxGeometry(2.0, 0.25, 1.2), bodyMat);
    hood.position.set(0, 0.9, 1.1);
    hood.castShadow = true;
    this.mesh.add(hood);

    const roof = new THREEref.Mesh(new THREEref.BoxGeometry(1.6, 0.25, 1.8), bodyMat);
    roof.position.set(0, 1.05, -0.1);
    roof.castShadow = true;
    this.mesh.add(roof);

    const spoiler = new THREEref.Mesh(new THREEref.BoxGeometry(1.4, 0.1, 0.25), bodyMat);
    spoiler.position.set(0, 1.05, -2.05);
    this.mesh.add(spoiler);

    const windowMat = new THREEref.MeshStandardMaterial({ color: 0x111122, opacity: 0.65, transparent: true });
    const windshield = new THREEref.Mesh(new THREEref.PlaneGeometry(1.6, 0.6), windowMat);
    windshield.position.set(0, 1.1, 0.75);
    windshield.rotation.x = -0.35;
    this.mesh.add(windshield);

    // wheels
    const wheelGeom = new THREEref.CylinderGeometry(0.3, 0.3, 0.4, 16);
    wheelGeom.rotateZ(Math.PI / 2);
    const wheelMat = new THREEref.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.5 });
    const wheelOffsets = [
      [-0.85, 0.3, 1.55], [0.85, 0.3, 1.55],
      [-0.85, 0.3, -1.55], [0.85, 0.3, -1.55]
    ];
    for (const o of wheelOffsets) {
      const w = new THREEref.Mesh(wheelGeom, wheelMat);
      w.position.set(o[0], o[1], o[2]);
      w.castShadow = true;
      this.mesh.add(w);
    }

    this.velocity = 0;
    this.position = new THREEref.Vector3();
    this.rotation = 0;
    this.maxSpeed = 70;
    this.acceleration = 24;
    this.brakeDecel = 80;
    this.handbrake = 35;
    this.maxSteer = Math.PI / 7;
    this.length = 4.4;
    this.drag = 3.0;
    this.turnSensitivity = 1.3;
    this.THREEref = THREEref;
    this.bodyMaterial = bodyMat;
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;
  }

  update(dt, input) {
    const forwardInput = input.forward;
    const steerInput = input.steer;

    // acceleration and braking
    if (forwardInput > 0) {
      this.velocity += this.acceleration * forwardInput * dt;
    } else if (forwardInput < 0) {
      const brakeForce = forwardInput < -0.2 ? this.brakeDecel : this.drag;
      this.velocity += brakeForce * forwardInput * dt;
    } else {
      this.velocity -= Math.sign(this.velocity) * Math.min(Math.abs(this.velocity), this.drag * dt);
    }

    // top speed and reverse limit
    this.velocity = Math.max(-15, Math.min(this.maxSpeed, this.velocity));

    // steering is more responsive at higher speed
    const speedFactor = Math.min(1, Math.abs(this.velocity) / this.maxSpeed);
    const steerAmount = this.maxSteer * steerInput * (0.4 + speedFactor * 0.6) * this.turnSensitivity;
    const turningRadius = this.length / Math.tan(Math.max(0.01, Math.abs(steerAmount)));
    const angularVel = this.velocity / turningRadius;
    this.rotation += angularVel * dt * Math.sign(this.velocity) * Math.sign(steerAmount || 1);

    // update position using velocity vector
    const forwardVec = new this.THREEref.Vector3(Math.sin(this.rotation), 0, Math.cos(this.rotation));
    this.position.addScaledVector(forwardVec, this.velocity * dt);
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;
  }

  setPaint(color) {
    if (this.bodyMaterial) {
      this.bodyMaterial.color.setHex(color);
    }
  }
}
