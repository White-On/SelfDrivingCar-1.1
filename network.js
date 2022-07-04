class NeuralNetwork {
    constructor(neuronCounts) {
        // neuronCounts est un tableau contenant le nombre de neurones dans chaque couche
        this.levels = [];
        // création des couches
        for(let i = 0; i < neuronCounts.length-1; i++){
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i+1]));
        }
    }

    static feedForward(givenInputs, network) {
        // on parcours les couches du réseau de neurones et on calcule les sorties des neurones
        let outputs = Level.feedForward(givenInputs, network.levels[0]);
        for(let i = 1; i < network.levels.length; i++){
            outputs = Level.feedForward(outputs, network.levels[i]);
        }
        // pour obtenir les controles, on renvoie les sorties des neurones de la dernière couche
        return outputs;
    }

    static mutate(network, mutationRate = 1) {
        network.levels.forEach(level => {
            for(let i = 0; i < level.biases.length; i++){
                level.biases[i] = lerp(level.biases[i], Math.random() * 2 -1, mutationRate);
            }
            for(let i = 0; i < level.weights.length; i++){
                for(let j = 0; j < level.weights[i].length; j++){
                    level.weights[i][j] = lerp(level.weights[i][j], Math.random() * 2 -1, mutationRate);
                }
            }
        });
    }
}


class Level {
    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);

        // c'est la valeur au dela de laquelle l'output est considéré comme déclenché
        this.biases = new Array(outputCount);
        
        this.weights = [];
        // pour chaque input, on a un tableau de poids pour chaque output
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }
        Level.#randomize(this);
    }

    static #randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                // on initialise les poids à une valeur aléatoire entre -1 et 1
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < level.biases.length; i++) {
            // idem pour les biases
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static feedForward(givenInputs, level) {
        // permet de faire le calcul de la sortie d'un neurone à partir de ses entrées et de ses poids
        for(let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        for(let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for(let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            if(sum > level.biases[i]) {
                level.outputs[i] = 1;
            }
            else {
                level.outputs[i] = 0;
            }
        }
        // on a calculé la sortie de chaque neurone, on retourne les sorties pour les utiliser dans la couche suivante
        return level.outputs;
    }
}