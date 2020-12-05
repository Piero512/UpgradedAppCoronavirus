
export class DistanceScore {
  
    private al: number;
    private bl: number;
    private cl: number;
    private am: number;
    private bm: number;
    private cm: number;
    private ah: number;
    private bh: number;
    private ch: number;
    private homeLat: number;
    private homeLong: number;

    constructor(al: number,
      bl: number,
      cl: number,
      am: number,
      bm: number,
      cm: number,
      ah: number,
      bh: number,
      ch: number,
      homeLat: number,
      homeLong: number
    ){
      this.al = al;
      this.bl = bl;
      this.cl = cl;
      this.am = am;
      this.bm = bm;
      this.cm = cm;
      this.ah = ah;
      this.bh = bh;
      this.ch = ch;
      this.homeLat = homeLat,
      this.homeLong = homeLong
    };

    calculateScore(location): {score: number, distance: number}{
      var score = 1; // default
      var distance = 0;
      var max: {value:number} = {value : null};
      if(location){
        this.setLow(this.al, this.bl, this.cl);
        this.setMid(this.am, this.bm, this.cm);
        this.setMax(this.ah, this.bh, this.ch);
        distance = this.distance(location.latitude, location.longitude, this.homeLat, this.homeLong);
        score = this.scoreExposure(distance, max);        
      }
      return {score: score, distance: distance};
    }

    distance(lat1: number, lon1: number, lat2: number, lon2: number): number{
      var theta: number, dist: number;
      if ((lat1 == lat2) && (lon1 == lon2)) {
          return 0;
      } else {
          theta = lon1 - lon2;
          dist = Math.sin(this.deg2rad(lat1)) * Math.sin(this.deg2rad(lat2)) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.cos(this.deg2rad(theta));
          dist = Math.acos(dist);
          dist = this.rad2deg(dist);
          dist = dist * 60 * 1.1515;
          dist = dist * 1.609344;
      }
      return dist*1000;
    }

    deg2rad(deg: number): number {
        return (deg * Math.PI / 180);
    }

    rad2deg(rad: number): number {
        return (rad * 180 / Math.PI);
    }

    setLow(a: number, b: number, c: number){
      this.al=a; this.bl=b; this.cl=c;
    }

    setMid(a: number, b: number, c: number){
      this.am=a; this.bm=b; this.cm=c;
    }

    setMax(a: number, b: number, c: number){
      this.ah=a;  this.bh=b; this.ch=c;
    }

    trimf(x: number, a: number, b: number, c: number): number{ // menor que a -> cero, b posicion de pico, mayor que c ->cero
        return (Math.max(Math.min( (x-a)/(b-a),(c-x)/(c-b) ),0));
    }

    lowExposure(x: number): number{
      return (this.trimf(x, this.al, this.bl, this.cl));
    }
    
    mediumExposure(x: number): number{
      return (this.trimf(x, this.am, this.bm, this.cm));
    }

    highExposure(x: number): number{
      return (this.trimf(x, this.ah, this.bh, this.ch));
    }

    scoreExposure(x: number, max:{value: number} ): number{
      var low: number;
      var mid: number;
      var high: number;

      low= this.lowExposure(x);
      mid= this.mediumExposure(x);
      high= this.highExposure(x);
      max.value= Math.max(high, Math.max(mid,low));
      if(max.value==low)	return (1);
      if(max.value==mid)	return (2);
      if(max.value==high)	return (3);
      return 0;
    }
}
