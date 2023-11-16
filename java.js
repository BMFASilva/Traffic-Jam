class Car {
    constructor() {
        this.width = 50;
        this.height = 30;
        this.x = -50;
        this.y = 35; 
        this.speed = this.RandomSpeed();
        this.color = this.RandomColor();
    }

    go(speed) {
        this.speed = speed;
    }

    drive() {
        this.x += this.speed;
    }

    RandomSpeed() {
        return Math.random() * (7 - 1) + 1;
    }

    RandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}

class Simulacao {
    constructor() {
        this.iteration = 0;
        this.carsLane1 = this.init();
        this.carsLane2 = this.init();
        this.stopped = false; 
        this.stopStartTime = 0; // Para dar track desde quando parou
    }

    step() {
        const carLength = 50;
        const stopDistance = 30; // Distancia para parar

        this.iteration++;

        // Adicionar um carro se houver espaço
        if (this.carsLane1[this.carsLane1.length - 1].x > carLength) {
            this.carsLane1.push(this.generateCar());
        }

        if (this.carsLane2[this.carsLane2.length - 1].x > carLength) {
            this.carsLane2.push(this.generateCar());
        }

        this.carsLane1[0].drive();
        this.carsLane1[0].go(4);

        this.carsLane2[0].drive();
        this.carsLane2[0].go(3);

        this.updateLane(this.carsLane1, carLength, stopDistance);
        this.updateLane(this.carsLane2, carLength, stopDistance);

        // Remove os carros depois de sairem do ecra
        this.carsLane1 = this.carsLane1.filter(car => car.x < 2000); 
        this.carsLane2 = this.carsLane2.filter(car => car.x < 2000); 
    }

    init() {
        return [new Car()];
    }

    generateCar() {
        return new Car();
    }

    updateLane(cars, carLength, stopDistance) {
        for (let i = 1; i < cars.length; i++) {
            cars[i].drive();

            const fenderDist = cars[i - 1].x - cars[i].x;

            if (fenderDist > carLength + stopDistance) {
                cars[i].go(cars[i].RandomSpeed()); // Otherwise, go at random speed
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
                    cars[i].go(cars[i].RandomSpeed()); // Gradually start going again
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

class SimulacaoReverse extends Simulacao {
    constructor() {
        super();
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
            this.ctx.fillRect(this.canvas.width - car.x - car.width, car.y, car.width, car.height);
        }

        for (const car of carsLane2) {
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(this.canvas.width - car.x - car.width, car.y + 50, car.width, car.height);
        }
    }
}

// Iniciar a road
let road = new Simulacao();
let vis = new Vis('road');

setInterval(() => {
    road.step();
    vis.render(road.carsLane1, road.carsLane2);
}, 40);

// Iniciar a road Sentido contrario
let roadReverse = new SimulacaoReverse();
let visReverse = new VisReverse('roadReverse');

setInterval(() => {
    roadReverse.step();
    visReverse.renderReverse(roadReverse.carsLane1, roadReverse.carsLane2);
}, 40);