class Road {
  constructor(x, width, laneCount = 3) {
    this.x = x;
    this.width = width;
    this.laneCount = laneCount;

    this.left = x - width / 2;
    this.right = x + width / 2;

    const infitity = 1000000;
    this.top = -infitity;
    this.bottom = infitity;

    // permet d'avoir un vecteur pour les bordures mais à l'avenir faire mieux 
    const topLeft = { x: this.left, y: this.top };
    const topRight = { x: this.right, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const bottomRight = { x: this.right, y: this.bottom };

    this.borders = [[topLeft, bottomLeft], [topRight, bottomRight]];
  }

  getLaneCenter(laneIndex) {
    // permet de calculer le centre de la lane indiquée
    const laneWidth = this.width / this.laneCount;
    // la fonction math.min permet ici de garantir que le centre de la lane sera toujours dans la route
    return this.left + laneWidth / 2 + laneWidth * Math.min(laneIndex, this.laneCount - 1);
  }

  draw(context) {
    context.linewidth = 5;
    context.strokeStyle = 'white';

    // dessin des lanes de la route ( découpe en lanes )
    for (let i = 1; i < this.laneCount; i++) {
      // permet de découper la route en lanes equivalentes
      const x = lerp(this.left, this.right, i / this.laneCount);
      // dessin des traits de lanes en ligne non continu
      context.setLineDash([20, 20]);
      // dessin de la ligne 
      context.beginPath();
      context.moveTo(x, this.top);
      context.lineTo(x, this.bottom);
      context.stroke();
    }
    // dessin des bordures de la route
    context.setLineDash([]);
    this.borders.forEach(border => {
      context.beginPath();
      context.moveTo(border[0].x, border[0].y);
      context.lineTo(border[1].x, border[1].y);
      context.stroke();
    });
  }
}

