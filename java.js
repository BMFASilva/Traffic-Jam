class Car {
    constructor() {
        this.width = 50;
        this.height = 30;
        this.x = -50;
        this.y = 35; // Adjust the starting position as needed
        this.speed = this._getRandomSpeed();
        this.color = this._getRandomColor();
    }

    go(speed) {
        this.speed = speed;
    }

    drive() {
        this.x += this.speed;
    }

    _getRandomSpeed() {
        return Math.random() * (7 - 1) + 1; // Random speed between 1 and 7
    }

    _getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}

class Sim {
    constructor() {
        this.iteration = 0;
        this.carsLane1 = this._init();
        this.carsLane2 = this._init();
        this.stopped = false; // Flag to track if cars are stopped
        this.stopStartTime = 0; // Variable to track when the stop occurred
    }

    step() {
        const carLength = 50;
        const stopDistance = 20; // Adjust the threshold distance for stopping

        this.iteration++;

        // add a new car to each lane if there is room for one.
        if (this.carsLane1[this.carsLane1.length - 1].x > carLength) {
            this.carsLane1.push(this._generateCar());
        }

        if (this.carsLane2[this.carsLane2.length - 1].x > carLength) {
            this.carsLane2.push(this._generateCar());
        }

        this.carsLane1[0].drive();
        this.carsLane1[0].go(4); // Adjust the initial speed as needed

        this.carsLane2[0].drive();
        this.carsLane2[0].go(3); // Adjust the initial speed as needed for the second lane

        this._updateLane(this.carsLane1, carLength, stopDistance);
        this._updateLane(this.carsLane2, carLength, stopDistance);

        this.carsLane1 = this.carsLane1.filter(car => car.x < 2000); // Remove cars that go beyond canvas width
        this.carsLane2 = this.carsLane2.filter(car => car.x < 2000); // Remove cars that go beyond canvas width
    }

    _init() {
        return [new Car()];
    }

    _generateCar() {
        return new Car();
    }

    _updateLane(cars, carLength, stopDistance) {
        for (let i = 1; i < cars.length; i++) {
            cars[i].drive();

            const fenderDist = cars[i - 1].x - cars[i].x;

            if (fenderDist > carLength + stopDistance) {
                cars[i].go(cars[i]._getRandomSpeed()); // Otherwise, go at random speed
            } else if (fenderDist <= carLength + stopDistance && fenderDist > carLength / 3) {
                cars[i].go(cars[i].speed * 0.9); // Within threshold to 0.3 car lengths away, decrease speed by 10%
            } else if (fenderDist <= carLength / 3) {
                if (!this.stopped) {
                    cars[i].go(0); // Within 0.3 car lengths away, stop
                    this.stopped = true;
                    this.stopStartTime = Date.now(); // Record the time when the car stopped
                }

                // Check if 2 seconds have passed since the stop
                if (this.stopped && Date.now() - this.stopStartTime > 2000) {
                    this.stopped = false;
                    cars[i].go(cars[i]._getRandomSpeed()); // Gradually start going again
                }
            }
        }
    }
}

class Vis {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    render(carsLane1, carsLane2) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const car of carsLane1) {
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x, car.y, car.width, car.height);
        }

        for (const car of carsLane2) {
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x, car.y + 50, car.width, car.height);
        }
    }
}

class SimReverse extends Sim {
    constructor() {
        super();
    }

    _initReverse() {
        return [new Car()];
    }

    _generateCarReverse() {
        return new Car();
    }

    _updateLaneReverse(cars, carLength, stopDistance) {
        for (let i = 1; i < cars.length; i++) {
            cars[i].drive();

            const fenderDist = cars[i].x - cars[i - 1].x;

            if (fenderDist > carLength + stopDistance) {
                cars[i].go(cars[i]._getRandomSpeed());
            } else if (fenderDist <= carLength + stopDistance && fenderDist > carLength / 3) {
                cars[i].go(cars[i].speed * 0.9);
            } else if (fenderDist <= carLength / 3) {
                if (!this.stopped) {
                    cars[i].go(0);
                    this.stopped = true;
                    this.stopStartTime = Date.now();
                }

                if (this.stopped && Date.now() - this.stopStartTime > 2000) {
                    this.stopped = false;
                    cars[i].go(cars[i]._getRandomSpeed());
                }
            }
        }
    }
}

class VisReverse extends Vis {
    constructor(canvasId) {
        super(canvasId);
    }

    renderReverse(carsLane1, carsLane2) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const car of carsLane1) {
            this.ctx.fillStyle = car.color;
            // Render the car with swapped x and y for right-to-left movement
            this.ctx.fillRect(this.canvas.width - car.x - car.width, car.y, car.width, car.height);
        }

        for (const car of carsLane2) {
            this.ctx.fillStyle = car.color;
            // Render the car with swapped x and y for right-to-left movement
            this.ctx.fillRect(this.canvas.width - car.x - car.width, car.y + 50, car.width, car.height);
        }
    }
}

// run it for the original canvas
let road = new Sim();
let vis = new Vis('road');

let iteration = 0;

let runner = setInterval(() => {
    road.step();
    vis.render(road.carsLane1, road.carsLane2);

    iteration++;

    iteration > 3000 ? clearInterval(runner) : null;
}, 40);

// Right-to-left canvas simulation
let roadReverse = new SimReverse();
let visReverse = new VisReverse('roadReverse');

let iterationReverse = 0;

let runnerReverse = setInterval(() => {
    roadReverse.step();
    visReverse.renderReverse(roadReverse.carsLane1, roadReverse.carsLane2);

    iterationReverse++;

    iterationReverse > 3000 ? clearInterval(runnerReverse) : null;
}, 40);