function lerp(a, b, t) {
    return a + (b - a) * t;
}

function getIntersection(A, B, C, D) {
  // detail of the algorithm: https://www.youtube.com/watch?v=fHOLQJo0FjQ
    const tTop = (A.y - C.y) * (D.x - C.x) - (A.x - C.x) * (D.y - C.y);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (B.x - A.x) * (D.y - C.y) - (B.y - A.y) * (D.x - C.x);
    if(bottom != 0){
      const t = tTop / bottom;
      const u = uTop / bottom;
      if(t >= 0 && t <= 1 && u >= 0 && u <= 1){
        return {
          x : lerp (A.x, B.x, t),
          y : lerp (A.y, B.y, t),
          offset : t
        };
      }
    }
    return null;
}

function polysIntersect(poly1, poly2){
  for(let i = 0; i < poly1.length; i++){
    for(let j = 0; j < poly2.length; j++){
      const touch = getIntersection(poly1[i], poly1[(i+1)%poly1.length], poly2[j], poly2[(j+1)%poly2.length]);
      if(touch){
        return true;
      }
    }
  }
  return false;
}

function getRGBA(value){
  const alpha = Math.abs(value);
  const R = value>0?0:255;
  const G = value<0?0:255;
  const B = 0;

  return 'rgba('+R+','+G+','+B+','+alpha+')';
}