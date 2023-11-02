 /** Class representing a car. */
  class Car {
    /**
    * Create a car.
    * @param {string} type - the type of car
    */
    constructor(type) {
      Car._counter = Car._counter || 0; // class variable
  
      this.type = type;
      this.plate = this._register();
      this.serial = Car._counter++;
      this.x = -50;
    }

  
    /**
    * Makes the car move at initilized speed
    * @param {number} speed - the initial speed of the car.
    */
    go(speed) {
      this.speed = speed;
    }
  
    /**
    * Makes the car move slower
    */
    slower() {
      if (this.speed > 0) {
        this.speed--;
      }
    }
  
    /**
    * Makes the car move faster
    */
    faster() {
      if (this.speed < this.speedLimit) {
        this.speed++;
      }
    }
  
    /**
    * Makes the car break by halving speed.
    */
    break() {
      this.speed = Math.floor(this.speed / 2);
    }
  
    /**
    * Move the car by changing x position on road
    */
    drive() {
      this.x = Math.floor(this.x + this.speed / 10);
    }
  
    /**
    * Private. Registers a random (reasobnably unique) plate number for car.
    */
    _register() {
      return Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase();
    }
  }
  
  /**
  * Class representing a Truck.
  * @extends Car
  */
  class Truck extends Car {
    /**
    * Create truck car.
    */
    constructor() {
      super('truck');
      this.speedLimit = 55;
    }
  }
  /**
  * Class representing a Sedan.
  * @extends Car
  */
  class Sedan extends Car {
    /**
    * Create sedan car.
    */
    constructor() {
      super('sedan');
      this.speedLimit = 75;

    }
  }
  /**
  * Class representing an SUV.
  * @extends Car
  */
  class SUV extends Car {
    /**
    * Create SUV car.
    */
    constructor() {
      super('suv');
      this.speedLimit = 70;
    }
  }
  /**
  * Class representing a Sports Car.
  * @extends Car
  */
  class Sport extends Car {
    /**
    * Create sport car.
    */
    constructor() {
      super('sport');
      this.speedLimit = 80;
    }
  }
  /**
  * Class representing a Simulation.
  */
  class Sim {
    constructor() {
      this.iteration = 0;
      this.cars = this._init();
    }
  
    /**
    * Run the simulation step.
    */
    step() {
      const carLength = 50;
      let i;
      let fenderDist;
  
      this.iteration++;
  
      // add a new car to road if there is room for one.
      if (this.cars[this.cars.length - 1].x > carLength * 3) {
        this.cars.push(this._generateCar());
      }
  
      this.cars[0].drive();
      this.cars[0].faster();
  
      // loop over all cars in the road to update.
      for (i = 1; i < this.cars.length; i++) {
        // update car and ui reperentation.
        this.cars[i].drive();
  
        // apply driving rules.
        fenderDist = this.cars[i - 1].x - this.cars[i].x;
  
        fenderDist > carLength * 3 ? this.cars[i].faster() : null;
        fenderDist < carLength * 3 ? this.cars[i].slower() : null;
        fenderDist < carLength * 1.5 ? this.cars[i].break() : null;
      }
  
      this.cars.slice(-20);
    }
  
    /**
    * Private. Create an initial set of cars on the road
    * @return {Array} - an array of carobjects
    */
    _init() {
      let cars = [this._generateCar()];
      return cars;
    }
  
    /**
    * Private. Generates a loaded and moving car
    * @return {object} - a car
    */
    _generateCar() {
      let car;
      let speed = 55;
  
      // choose a random type for the car and create the object
      switch (Math.floor(Math.random() * 4)) {
        case 0:
          car = new Truck();
          break;
        case 1:
          car = new SUV();
          break;
        case 2:
          car = new Sport();
          break;
        case 3:
          car = new Sedan();
          break;
      }
      // set the car
      car.go(speed);
      return car;
    }
  }
  
  /** Class encapsulating the HTML Visualisation. */
  class Vis {
    constructor(roadId, direction) {
      this.roadId = roadId;
      this.direction = direction;
    }
    /**
    * Renders HTML cars onto the HTML road.
    * @param {Array} cars - an array of car objects.
    * @param {string} roadId - the HTML id of the road element.
    */
    render(cars) {
      let i;
      let max = cars.length;
  
      for (i = 0; i < max; i++) {
        let el = document.getElementById(`car-${cars[i].plate}`);
  
        if (!el) {
          el = document.getElementById(cars[i].type);
          let elc = el.cloneNode(true);
          this._refreshSprites(cars[i], elc);
          document.getElementById(this.roadId).appendChild(elc);
        } else {
          this._refreshSprites(cars[i], el);
        }
      }
    }

  /**
    * Renders HTML of car info onto the page
    * @param {object} car - car object.
    * @param {string} roadId - the HTML id of the container element.
    */

    _refreshSprites(car, sprite) {
      sprite.id = `car-${car.plate}`;
  
      let speed = sprite.getElementsByClassName('speed')[0];
      if (car.speed >= parseInt(speed.innerHTML)) {
        speed.classList.add('faster');
        speed.classList.remove('slower');
      } else {
        speed.classList.add('slower');
        speed.classList.remove('faster');
      }
      car.speed > 20
        ? (speed.innerHTML = `${car.speed}`)
        : (speed.innerHTML = '');
  

  
      if (this.direction === 'east') {
        sprite.style.left = car.x + 'px';
      } else {
        sprite.style.left = window.innerWidth - car.x + 'px';
        sprite.classList.add('flip');
        speed.classList.add('flip');
      }
  
      sprite.parentNode && car.x > 1600
        ? sprite.parentNode.removeChild(sprite)
        : null;
    }
  }
  
  // run it
  let topRoad = new Sim();
  let bottomRoad = new Sim();
  
  let topVis = new Vis('top', 'east');
  let bottomVis = new Vis('bottom', 'west');
  
  let iteration = 0;
  
  let runner = setInterval(() => {
    topRoad.step();
    bottomRoad.step();
  
    topVis.render(topRoad.cars, 'top');
  
    bottomVis.render(bottomRoad.cars, 'bottom');
  
    iteration++;
  
    iteration > 3000 ? clearInterval(runner) : null;
  }, 40);