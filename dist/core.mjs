export const WORLD = Object.freeze({ width:720, height:420, ground:330, birdX:136 });
export const STEP=1/120;
export const MAX_FEATHERS=3;
const GRAVITY=1450;
const layouts=[['cooler','umbrella','cooler'],['umbrella','cooler','umbrella'],['cooler','cooler','umbrella']];
export class Run {
 constructor(random=Math.random){this.random=random;this.reset()}
 reset(){this.state='ready';this.time=0;this.travel=0;this.feathers=0;this.collected=0;this.y=WORLD.ground;this.vy=0;this.duck=false;this.airJumpUsed=false;this.jumpBuffer=0;this.accumulator=0;this.obstacles=[];this.foods=[];this.featherPickups=[];this.events=[];this.hit=null;this.segment=0;this.nextEdge=970;this.started=false;this.generate()}
 start(){this.reset();this.state='playing';this.started=true}
 get speed(){return Math.min(300,210+this.travel/180)}
 get distance(){return Math.floor(this.travel/10)}
 get airborne(){return this.y<WORLD.ground-.1||this.vy<0}
 get crouching(){return this.duck&&!this.airborne}
 get box(){return{x:WORLD.birdX-17,y:this.y-(this.crouching?32:58),w:49,h:this.crouching?29:53}}
 jump(){if(this.state!=='playing')return;if(this.airborne&&this.feathers>0&&!this.airJumpUsed){this.doubleJump();return}this.jumpBuffer=.13;this.tryJump()}
 tryJump(){if(this.jumpBuffer>0&&!this.airborne){this.vy=-570;this.duck=false;this.jumpBuffer=0;this.airJumpUsed=false;this.events.push({kind:'jump'})}}
 doubleJump(){if(this.state!=='playing')return;if(!this.airborne){this.events.push({kind:'grounded'});return}if(this.airJumpUsed){this.events.push({kind:'used'});return}if(this.feathers<=0){this.events.push({kind:'empty'});return}this.feathers--;this.vy=Math.min(this.vy,-570);this.airJumpUsed=true;this.duck=false;this.jumpBuffer=0;this.events.push({kind:'doubleJump',x:WORLD.birdX,y:this.y-30})}
 setDuck(value){this.duck=!!value}
 pause(){if(this.state==='playing'){this.state='paused';this.accumulator=0;this.duck=false}}
 resume(){if(this.state==='paused'){this.state='playing';this.accumulator=0;this.duck=false}}
 generate(){while(this.nextEdge<this.travel+WORLD.width+1000){let kinds=this.segment===0?['cooler','umbrella','cooler']:layouts[Math.floor(this.random()*layouts.length)];for(let i=0;i<kinds.length;i++){const x=this.nextEdge+i*540;const kind=kinds[i];this.obstacles.push({worldX:x,kind,w:kind==='umbrella'?80:44,h:kind==='umbrella'?46:38,passed:false});if(kind==='cooler'){for(let j=0;j<4;j++)this.foods.push({worldX:x-80+j*42,y:WORLD.ground-80-Math.sin(j/3*Math.PI)*28,hit:false})}else{for(let j=0;j<3;j++)this.foods.push({worldX:x-25+j*32,y:WORLD.ground-22,hit:false})}
 // A feather in the safe gap before each obstacle, separate from the fries.
 this.featherPickups.push({worldX:x-190,y:WORLD.ground-35,hit:false})}
 if(this.segment===0){for(let j=0;j<3;j++)this.foods.push({worldX:490+j*46,y:WORLD.ground-32,hit:false});this.featherPickups.push({worldX:665,y:WORLD.ground-35,hit:false})}
 this.nextEdge+=1740;this.segment++}}
 obstacleBox(o){return{x:o.worldX-this.travel,y:WORLD.ground-(o.kind==='umbrella'?87:o.h),w:o.w,h:o.h}}
 tick(dt){this.time+=dt;this.travel+=this.speed*dt;this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);this.vy+=GRAVITY*dt;this.y+=this.vy*dt;if(this.y>=WORLD.ground){this.y=WORLD.ground;this.vy=0;this.airJumpUsed=false;this.tryJump()}if(this.y<96){this.y=96;this.vy=Math.max(0,this.vy)}this.generate();const b=this.box;
 for(const o of this.obstacles){const q=this.obstacleBox(o);if(b.x<q.x+q.w&&b.x+b.w>q.x&&b.y<q.y+q.h&&b.y+b.h>q.y){this.state='caught';this.hit=o;this.duck=false;this.events.push({kind:'hit',obstacle:o.kind});return}if(!o.passed&&q.x+q.w<b.x){o.passed=true;this.events.push({kind:'passed',obstacle:o.kind})}}
 for(const f of this.foods){const x=f.worldX-this.travel;if(!f.hit&&Math.abs(x-(WORLD.birdX+10))<32&&f.y>b.y-8&&f.y<this.y+5){f.hit=true;this.collected++;this.events.push({kind:'pickup',x,y:f.y})}}
 for(const f of this.featherPickups){const x=f.worldX-this.travel;if(!f.hit&&Math.abs(x-(WORLD.birdX+10))<32&&f.y>b.y-8&&f.y<this.y+5){f.hit=true;const full=this.feathers===MAX_FEATHERS;this.feathers=Math.min(MAX_FEATHERS,this.feathers+1);this.events.push({kind:full?'feathersFull':'feather',x,y:f.y})}}
 this.obstacles=this.obstacles.filter(o=>o.worldX-this.travel>-120);this.foods=this.foods.filter(f=>!f.hit&&f.worldX-this.travel>-30);this.featherPickups=this.featherPickups.filter(f=>!f.hit&&f.worldX-this.travel>-30)}
 advance(seconds){if(this.state!=='playing')return;if(seconds>.4){this.pause();this.events.push({kind:'stall'});return}this.accumulator+=Math.max(0,seconds);while(this.accumulator>=STEP&&this.state==='playing'){this.tick(STEP);this.accumulator-=STEP}}
 takeEvents(){const e=this.events;this.events=[];return e}
}
