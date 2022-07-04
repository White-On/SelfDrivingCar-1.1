class Car{
    constructor(x, y, width, height, controlType, maxSpeed=3){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;

        this.angle = 0;
        this.polygon = this.#createPolygon();

        this.damaged = false;

        this.useBrain = controlType == 'AI';

        this.fitness = 0;

        //initialisation du capteur de la voiture
        if(controlType!="dummy"){
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount,6,4]);
        }
        this.controls = new Controls(controlType);

    }

    update(roadBorders, traffic){
        if(!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders, traffic);
            // petites valeur si l'objet est loin et grande valeur si l'objet est proche
            const offsets = this.sensor.readings.map(s=>s==null?0:1-s.offset);
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            // on donne les controles au réseaux de neurones
            if(this.useBrain){
                this.controls.forward =  outputs[0];
                this.controls.left =     outputs[1];
                this.controls.right =    outputs[2];
                this.controls.backward = outputs[3];

                // on ne regarde la fitness que d'une voiture qui marche encore
                if(!this.damaged){
                    this.fitness = this.evaluate(traffic);
                }
            }
        }
        
    }

    #assessDamage(roadBorders, traffic){
        for(let i = 0; i < roadBorders.length; i++){
            if(polysIntersect(this.polygon, roadBorders[i])){
                return true;
            }
        }
        for(let i = 0; i < traffic.length; i++){
            if(polysIntersect(this.polygon, traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }

    #createPolygon(){
        // création d'un polygon de la voiture
        const points = [];
        // l'hypothenuse du triangle que forme la voiture dans la diagonale
        const rad = Math.hypot(this.width, this.height) / 2;
        // angle formé par le point du triangle et le point du centre de la voiture
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad 
        });
        points.push({
            x: this.x - Math.sin(this.angle + Math.PI - alpha) * rad,
            y: this.y - Math.cos(this.angle + Math.PI - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(this.angle + Math.PI + alpha) * rad,
            y: this.y - Math.cos(this.angle + Math.PI + alpha) * rad
        });
        return points;
    }

    #move(){
        // fonction de movement de la voiture 
        if(this.controls.forward){
            this.speed += this.acceleration;
        }
        if(this.controls.backward){
            this.speed -= this.acceleration;
        }

        // bride la vitesste de la voiture a une vitesse max
        if(this.speed > this.maxSpeed){
            this.speed = this.maxSpeed;
        }
        // bride la vitesste de la voiture a une vitesse min
        if(this.speed < -this.maxSpeed/2){
            this.speed = -this.maxSpeed/2;
        }
        // si la voiture est en mouvement on lui applique un ralentissement du à la friction 
        if(this.speed > 0){
            this.speed -= this.friction;
        }
        // inversement pour la vitesse négative ( en arriere )
        if(this.speed < 0){
            this.speed += this.friction;
        }
        // permet d'imobiliser la voiture si la vitesse est très faible 
        if(Math.abs(this.speed) < this.friction){
            this.speed = 0;
        }

        if(this.speed != 0){
            // permet de savoir si la voiture vas en avant ou en arriere 
            // et permet d'ajuster comme dans un vrai modèle la rotation en marche arrière
            const flip = this.speed > 0 ? 1 : -1;
            // controle gauche et droite
            if(this.controls.left){
                this.angle += 0.03 * flip;
            }
            if(this.controls.right){
                this.angle -= 0.03 * flip;
            }
        }

        // gestion de l'angle de la voiture
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }


    draw(context,color,drawSensor=false){
        //dessin de la voiture dans une autre couleur si elle est endommagée
        if(this.damaged){
            context.fillStyle = 'gray';
        }
        else{
            context.fillStyle = color;
        }
        // dessin de la voiture
        context.beginPath();
        context.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i = 1; i < this.polygon.length; i++){
            context.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        context.fill();
        
        
        // dessine le capteur de la voiture
        if(this.sensor && drawSensor){
            this.sensor.draw(context);
        }
    }

    evaluate(traffic){
        // fonction de fitness de la voiture
        // on calcule le nombre de voiture dépassées
        let count = 0;
        let depass = traffic.map(t=>t.y);
        for(let i = 0; i < depass.length; i++){
            if(depass[i] > this.y){
                count++;
            }
        }
        return count;
    }
}