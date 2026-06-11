export class WorldStreamer {
  constructor(scene, loader = null, player = null) {
    this.scene = scene;
    // prefer provided loader, otherwise use global THREE.GLTFLoader if available
    this.loader = loader || (typeof THREE !== 'undefined' && THREE.GLTFLoader ? new THREE.GLTFLoader() : null);
    this.player = player;
    this.regions = [];
  }

  // region: { name, url, center: Vector3, radius, sceneObject }
  addRegion(region) {
    region.sceneObject = null;
    region.isLoading = false;
    region.isLoaded = false;
    this.regions.push(region);
  }

  update() {
    if (!this.player) return;
    const p = this.player.position || new THREE.Vector3();
    for (const r of this.regions) {
      const d = p.distanceTo(r.center);
      if (!r.isLoaded && !r.isLoading && d < (r.radius + 200)) {
        this.loadRegion(r);
      }
      if (r.isLoaded && d > (r.radius + 400)) {
        this.unloadRegion(r);
      }
    }
  }

  loadRegion(r) {
    r.isLoading = true;
    console.log('Loading region', r.name);
    this.loader.load(r.url, (gltf) => {
      r.sceneObject = gltf.scene;
      r.sceneObject.position.copy(r.center);
      this.scene.add(r.sceneObject);
      r.isLoaded = true;
      r.isLoading = false;
    }, undefined, (err) => {
      console.error('Failed to load region', r.url, err);
      r.isLoading = false;
    });
  }

  unloadRegion(r) {
    if (!r.isLoaded || !r.sceneObject) return;
    console.log('Unloading region', r.name);
    this.scene.remove(r.sceneObject);
    r.sceneObject.traverse((c) => { if (c.geometry) c.geometry.dispose(); if (c.material) { if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material.dispose(); } });
    r.sceneObject = null;
    r.isLoaded = false;
  }
}
