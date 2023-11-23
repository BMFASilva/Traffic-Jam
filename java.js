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

    getXPosition() {
        return this.x;
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
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.iteration = 0;
        this.carsLane1 = this.init();
        this.carsLane2 = this.init();
        this.stopped = false;
        this.stopStartTime = 0;
        this.simulationEnabled = true;
        this.controlBox = { x: 0, y: 0, width: 500, height: 300, visible: true };
    }

    step() {
        const carLength = 50;
        const stopDistance = 30;

        this.iteration++;

        if (this.carsLane1[this.carsLane1.length - 1].x > carLength) {
            this.carsLane1.push(this.generateCar());
        }

        if (this.carsLane2[this.carsLane2.length - 1].x > carLength) {
            this.carsLane2.push(this.generateCar());
        }

        if (this.simulationEnabled) {
            this.carsLane1[0].drive();
            this.carsLane1[0].go(4);
            this.carsLane2[0].drive();
            this.carsLane2[0].go(3);

            this.updateLane(this.carsLane1, carLength, stopDistance);
            this.updateLane(this.carsLane2, carLength, stopDistance);

            this.carsLane1 = this.carsLane1.filter(car => car.x < 2000);
            this.carsLane2 = this.carsLane2.filter(car => car.x < 2000);
        }
    }

    toggleControlBox() {
        this.controlBox.visible = !this.controlBox.visible;
    }

    init() {
        return [new Car()];
    }

    generateCar() {
        return new Car();
    }

    updateLane(cars, carLength, stopDistance) {
        for (let i = 1; i < cars.length; i++) {
            const withinControlBox = this.controlBox.visible && cars[i].x < this.controlBox.x + this.controlBox.width && cars[i].x > this.controlBox.x;

            if (!withinControlBox) {
                cars[i].drive();

                const carDistance = cars[i - 1].x - cars[i].x;

                if (carDistance > carLength + stopDistance) {
                    cars[i].go(cars[i].RandomSpeed());
                } else if (carDistance <= carLength + stopDistance && carDistance > carLength / 3) {
                    cars[i].go(cars[i].speed * 0.9);
                } else if (carDistance <= carLength / 3) {
                    if (!this.stopped) {
                        cars[i].go(0);
                        this.stopped = true;
                        this.stopStartTime = Date.now();
                    }

                    if (this.stopped && Date.now() - this.stopStartTime > 2000) {
                        this.stopped = false;
                        cars[i].go(cars[i].RandomSpeed());
                    }
                }
            }
        }
    }

    toggleSimulation() {
        this.simulationEnabled = !this.simulationEnabled;
    }
}

class Vis {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    render(carsLane1, carsLane2, controlBox) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (controlBox.visible) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; 
            this.ctx.fillRect(controlBox.x, controlBox.y, controlBox.width, controlBox.height);
        }

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
    constructor(canvasId) {
        super(canvasId);
        this.controlBox = { x: this.canvas.width - this.controlBox.width, y: 0, width: 500, height: 300, visible: true };
    }

    updateLane(cars, carLength, stopDistance) {
        for (let i = 1; i < cars.length; i++) {
            const withinControlBox = this.controlBox.visible &&
                cars[i].x < this.canvas.width - this.controlBox.x &&
                cars[i].x > this.canvas.width - this.controlBox.x - this.controlBox.width;

            if (!withinControlBox) {
                cars[i].drive();

                const carDistance = cars[i - 1].x - cars[i].x;

                if (carDistance > carLength + stopDistance) {
                    cars[i].go(cars[i].RandomSpeed());
                } else if (carDistance <= carLength + stopDistance && carDistance > carLength / 3) {
                    cars[i].go(cars[i].speed * 0.9);
                } else if (carDistance <= carLength / 3) {
                    if (!this.stopped) {
                        cars[i].go(0);
                        this.stopped = true;
                        this.stopStartTime = Date.now();
                    }

                    if (this.stopped && Date.now() - this.stopStartTime > 2000) {
                        this.stopped = false;
                        cars[i].go(cars[i].RandomSpeed());
                    }
                }
            }
        }
    }
}

class VisReverse extends Vis {
    constructor(canvasId) {
        super(canvasId);
    }

    renderReverse(carsLane1, carsLane2, controlBox) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (controlBox.visible) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(1500, controlBox.y, controlBox.width, controlBox.height);
        }

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

class CarY {
    constructor() {
        this.width = 30;
        this.height = 50;
        this.x = 35;
        this.y = -50;
        this.speed = this.RandomSpeed();
        this.color = this.RandomColor();
    }

    go(speed) {
        this.speed = speed;
    }

    drive() {
        this.y += this.speed;
    }

    getYPosition() {
        return this.y;
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

class SimulacaoY {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.iteration = 0;
        this.carsLane1 = this.init();
        this.carsLane2 = this.init();
        this.stopped = false;
        this.stopStartTime = 0;
        this.simulationEnabled = true;
        this.controlBox = { x: 0, y: 0, width: 120, height: 200, visible: false };
    }

    step() {
        const carLength = 50;
        const stopDistance = 30;

        this.iteration++;

        if (this.carsLane1[this.carsLane1.length - 1].y > carLength) {
            this.carsLane1.push(this.generateCar());
        }

        if (this.carsLane2[this.carsLane2.length - 1].y > carLength) {
            this.carsLane2.push(this.generateCar());
        }

        if (this.simulationEnabled) {
            this.carsLane1[0].drive();
            this.carsLane1[0].go(4);
            this.carsLane2[0].drive();
            this.carsLane2[0].go(3);

            this.updateLane(this.carsLane1, carLength, stopDistance);
            this.updateLane(this.carsLane2, carLength, stopDistance);

            this.carsLane1 = this.carsLane1.filter(car => car.y < 700);
            this.carsLane2 = this.carsLane2.filter(car => car.y < 700);
        }
    }

    toggleControlBox() {
        this.controlBox.visible = !this.controlBox.visible;
    }

    init() {
        return [new CarY()];
    }

    generateCar() {
        return new CarY();
    }

    updateLane(cars, carLength, stopDistance) {
        for (let i = 1; i < cars.length; i++) {
            const withinControlBox = this.controlBox.visible &&
                cars[i].y < this.controlBox.y + this.controlBox.height &&
                cars[i].y > this.controlBox.y;

            if (!withinControlBox) {
                cars[i].drive();

                const carDistance = cars[i - 1].y - cars[i].y;

                if (carDistance > carLength + stopDistance) {
                    cars[i].go(cars[i].RandomSpeed());
                } else if (carDistance <= carLength + stopDistance && carDistance > carLength / 3) {
                    cars[i].go(cars[i].speed * 0.9);
                } else if (carDistance <= carLength / 3) {
                    if (!this.stopped) {
                        cars[i].go(0);
                        this.stopped = true;
                        this.stopStartTime = Date.now();
                    }

                    if (this.stopped && Date.now() - this.stopStartTime > 2000) {
                        this.stopped = false;
                        cars[i].go(cars[i].RandomSpeed());
                    }
                }
            }
        }
    }

    toggleSimulation() {
        this.simulationEnabled = !this.simulationEnabled;
    }
}

class VisY {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    render(carsLane1, carsLane2, controlBox) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (controlBox.visible) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; 
            this.ctx.fillRect(controlBox.x, controlBox.y, controlBox.width, controlBox.height);
        }

        for (const car of carsLane1) {
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x, car.y, car.width, car.height);
        }

        for (const car of carsLane2) {
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x+50, car.y, car.width, car.height);
        }
    }
}

class SimulacaoReverseY extends SimulacaoY {
    
    constructor(canvasId) {
        super(canvasId);
        this.controlBox = {x: 0, y: this.canvas.height - this.controlBox.height, width: 120, height: 200, visible: false };
    }
    
    updateLane(cars, carLength, stopDistance) {
        
        for (let i = 1; i < cars.length; i++) {
            const withinControlBox = this.controlBox.visible &&
             cars[i].y < this.canvas.height - this.controlBox.y && cars[i].y > this.canvas.height - this.controlBox.y - this.controlBox.height;

            if (!withinControlBox) {
                cars[i].drive();

                const carDistance = cars[i - 1].y - cars[i].y;

                if (carDistance > carLength + stopDistance) {
                    cars[i].go(cars[i].RandomSpeed());
                } else if (carDistance <= carLength + stopDistance && carDistance > carLength / 3) {
                    cars[i].go(cars[i].speed * 0.9);
                } else if (carDistance <= carLength / 3) {
                    if (!this.stopped) {
                        cars[i].go(0);
                        this.stopped = true;
                        this.stopStartTime = Date.now();
                    }

                    if (this.stopped && Date.now() - this.stopStartTime > 2000) {
                        this.stopped = false;
                        cars[i].go(cars[i].RandomSpeed());
                    }
                }
            }
        }
    }
}

class VisReverseY extends VisY {
    constructor(canvasId) {
        super(canvasId);
    }
    
    renderReverse(carsLane1, carsLane2, controlBox) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (controlBox.visible) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(controlBox.x, controlBox.y, controlBox.width, controlBox.height);
            
        }

        for (const car of carsLane1) {
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x, this.canvas.height - car.y - car.height, car.width, car.height);
        }

        for (const car of carsLane2) {
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x +50, this.canvas.height - car.y - car.height, car.width, car.height);
        }
    }
}

const toggleSimulationButton = document.getElementById('toggleSimulationButton');
const toggleControlBoxButton = document.getElementById('toggleControlBoxButton');

let road = new Simulacao('road');
let vis = new Vis('road');

setInterval(() => {
    road.step();
    vis.render(road.carsLane1, road.carsLane2, road.controlBox);
}, 40);

let roadReverse = new SimulacaoReverse('roadReverse');
let visReverse = new VisReverse('roadReverse');

setInterval(() => {
    roadReverse.step();
    visReverse.renderReverse(roadReverse.carsLane1, roadReverse.carsLane2, roadReverse.controlBox);
}, 40);

let roadY = new SimulacaoY('roadY');
let visY = new VisY('roadY');

setInterval(() => {
    roadY.step();
    visY.render(roadY.carsLane1,roadY.carsLane2, roadY.controlBox);
}, 40);

let roadYReverse = new SimulacaoReverseY('roadYReverse');
let visReverseY = new VisReverseY('roadYReverse');

setInterval(() => {
    roadYReverse.step();
    visReverseY.renderReverse(roadYReverse.carsLane1,roadYReverse.carsLane2, roadYReverse.controlBox);
}, 40);

toggleSimulationButton.addEventListener('click', () => {
    road.toggleSimulation();
    roadReverse.toggleSimulation();
    roadY.toggleSimulation();
    roadYReverse.toggleSimulation();
});

toggleControlBoxButton.addEventListener('click', () => {
    road.toggleControlBox();
    roadReverse.toggleControlBox();
    roadY.toggleControlBox()
    roadYReverse.toggleControlBox();
});