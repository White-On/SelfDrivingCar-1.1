const carCanvas = document.getElementById('carCanvas');
carCanvas.height = window.innerHeight;
carCanvas.width = 200;

const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.height = window.innerHeight;
networkCanvas.width = 500;

const carContext = carCanvas.getContext('2d');
const networkContext = networkCanvas.getContext('2d');

// le 0.9 permet d'avoir un léger padding entre le bord de la fenêtre et le bord du canvas
const road = new Road(carCanvas.width/2, carCanvas.width*0.9);

// const car = new Car(road.getLaneCenter(1), 100, 30, 50,"AI");
const ITER = 3000;
const N = 100;
let cars = generateCars(N);
let bestCar = cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i = 0; i<cars.length; i++){
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if(i != 0){
            NeuralNetwork.mutate(cars[i].brain,0.1);
        }
    }
}

// const traffic = [new Car(road.getLaneCenter(1), -100, 30, 50,"dummy",2),
//                  new Car(road.getLaneCenter(0), -300, 30, 50,"dummy",2),
//                  new Car(road.getLaneCenter(2), -300, 30, 50,"dummy",2),
//                  new Car(road.getLaneCenter(1), -500, 30, 50,"dummy",2),
//                  new Car(road.getLaneCenter(0), -400, 30, 50,"dummy",2),
//                  new Car(road.getLaneCenter(2), -600, 30, 50,"dummy",2),
//                  new Car(road.getLaneCenter(1), -600, 30, 50,"dummy",2),
//                  new Car(road.getLaneCenter(1), -700, 30, 50,"dummy",2),
//                  new Car(road.getLaneCenter(0), -900, 30, 50,"dummy",2),
//                  new Car(road.getLaneCenter(2), -900, 30, 50,"dummy",2)
//                 ];

let traffic = generateTraffic(50);
let iteration = ITER;
let fitnessMax = 0;
let mutationFactor = 0.1;
let generationNumber = 0;

animate();

function save(){
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const cars = [];
    for(let i = 0; i <=N; i++){
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50,"AI"));
    }
    return cars;
}

function animate(time){
    // update du traffic
    for(let i = 0; i < traffic.length; i++){
        // le traffic ne peux pas interrragir avec lui même 
        traffic[i].update(road.borders,[]);
    }

    // car.update(road.borders,traffic);

    for(let i = 0; i < cars.length; i++){
        cars[i].update(road.borders, traffic);
    }
    // création d'un array avec les y des voitures
    // puis récupération de la valeur la faible ( donc la plus en avant)
    // fonction fitness
    //bestCar = cars.find(c=>c.y==Math.min(...cars.map(c=>c.y))); 
    bestCar = cars.find(c=>c.fitness==Math.max(...cars.map(c=>c.fitness)));
    
    // règle la taille du canvas en fonction de la taille de la page
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    // on donne une impression de mouvement à la voiture comme une caméra au dessus de la voiture
    carContext.save();
    // carContext.translate(0, -car.y + carCanvas.height * 0.7);
    carContext.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carContext);

    
    for(let i = 0; i < traffic.length; i++){
        traffic[i].draw(carContext,"red");
    }
    

    // car.draw(carContext,"blue");

    // rend les voitures légèrement transparentes
    carContext.globalAlpha = 0.2;
    for(let i = 0; i < cars.length; i++){
        cars[i].draw(carContext,"blue");
    }
    carContext.globalAlpha = 1;
    bestCar.draw(carContext,"blue",true);

    carContext.restore();

    networkContext.lineDashOffset = -time/50;
    // Visualizer.drawNetwork(networkContext, car.brain);
    Visualizer.drawNetwork(networkContext, bestCar.brain);

    iteration--;
    if(iteration == 0){
        if (bestCar.fitness >= fitnessMax){
            fitnessMax = bestCar.fitness;
            // mutationFactor = mutationFactor * 2 >= 1 ? 1 : mutationFactor * 2;
            save();
        }
        else{
            // mutationFactor *= 0.5; 
        }   
        console.log("fitnessMax : " + fitnessMax);
        console.log("génération  : " + generationNumber);
        console.log("mutationFactor : " + mutationFactor);
        generationNumber++;
        algoGenetic();
    }
    else{
        requestAnimationFrame(animate);
    }
    
    
}

function generateTraffic(N){
    let traffic = [];
    for(let i = 1; i <=N; i++){
        traffic.push(new Car(road.getLaneCenter(Math.floor(Math.random() * road.laneCount)),
        -100 * i , 
        30, 
        50, 
        "dummy",
        2));
    }
    return traffic;
}

// TODO maintenant on dois pouvoir relancer l'opération plusieurs fois et trouver une meilleure fonction de fitness

function algoGenetic(){
    iteration = ITER;
    cars = generateCars(N);
    traffic = generateTraffic(50);

    if(localStorage.getItem("bestBrain")){
        for(let i = 0; i<cars.length; i++){
            cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
            if(i != 0){
                NeuralNetwork.mutate(cars[i].brain,0.1);
            }
        }
    }
    animate();
}