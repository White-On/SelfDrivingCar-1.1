class Sensor{
    constructor(car){
        this.car = car;
        this.rayCount = 9;
        this.rayLength = 200;
        this.raySpread = Math.PI;

        this.rays = [];
        this.readings = [];
    }

    update(roadBorders, traffic){
        this.#castRays();
        // permet de récuperér les intersections des rayons
        this.readings = [];
        // on parcourt les rayons et on récupère les intersections avec les bordures 
        // de tout les obstacles
        for(let i = 0; i < this.rays.length; i++){
            this.readings.push(this.#getReading(this.rays[i], roadBorders, traffic));
        }
    }

    #getReading(ray, roadBorders, traffic){
        let touches = [];

        for(let i = 0; i < roadBorders.length; i++){
            // on parcours les bordures de la route car on peux avoir plusieurs bordures en intersection 
            // avec la voiture si les rayons sont longs
            const touch = getIntersection(ray[0],ray[1],
                        roadBorders[i][0],roadBorders[i][1]);
            // si on a une intersection avec une bordure on l'ajoute à la liste des intersections
            if(touch){
                touches.push(touch);
            }
        }
        // on parcours les voitures du traffic
        for(let i = 0; i < traffic.length; i++){
            const poly = traffic[i].polygon;
            for(let j = 0; j < poly.length; j++){
                const value = getIntersection(ray[0],ray[1],poly[j],poly[(j+1)%poly.length]);
                if(value){
                    touches.push(value);
                }
            }
        }
        // si aucune intersection n'a été trouvée on retourne null
        if(touches.length === 0){
            return null;
        }
        else{
            // on retourne la plus proche intersection
            const offset = touches.map(t => t.offset);
            const minOffset = Math.min(...offset);
            return touches.find(t => t.offset === minOffset);
        }
    }

    #castRays(){
        // permet de créer les rayons de la voiture
        this.rays = [];
        for(let i = 0; i < this.rayCount; i++){
            // on veux des rayons bien espacés entre eux et si il n'y a qu'un seul rayon 
            // alors il est en face de la voiture
            const rayAngle = lerp (this.raySpread/2, -this.raySpread/2, this.rayCount==1?0.5:i/(this.rayCount-1)) + this.car.angle;
            const start = {x:this.car.x, y:this.car.y};
            const end = {x:this.car.x - Math.sin(rayAngle) * this.rayLength, 
                         y:this.car.y - Math.cos(rayAngle) * this.rayLength};
            this.rays.push([start, end]);
        }
    }

    draw(context){
        for(let i = 0; i < this.rays.length; i++){
            let end = this.rays[i][1];
            if(this.readings[i]){
                end = this.readings[i];
            }
            // dessin des rayons
            context.beginPath();
            context.lineWidth = 2;
            context.strokeStyle = 'yellow';
            context.moveTo(this.rays[i][0].x, this.rays[i][0].y);
            context.lineTo(end.x, end.y);
            context.stroke();

            // dessin des intersections
            context.beginPath();
            context.lineWidth = 2;
            context.strokeStyle = 'black';
            context.moveTo(this.rays[i][1].x, this.rays[i][1].y);
            context.lineTo(end.x, end.y);
            context.stroke();
        }
    }
}