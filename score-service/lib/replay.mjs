import {Run,STEP,seededRandom,REPLAY_VERSION} from './game/core.mjs';
export function nickname(value){
 if(typeof value!=='string')throw new Error('Enter a nickname.');
 const name=value.normalize('NFKC').trim().replace(/\s+/g,' ');
 if([...name].length<2||[...name].length>18||!/^\p{L}[\p{L}\p{N} _.'-]*$/u.test(name))throw new Error('Use 2–18 letters, numbers, spaces, dots or dashes. Start with a letter.');
 return name;
}
export function validPlayer(value){return typeof value==='string'&&/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value)}
export function validateReplay(payload,ticket,now=Date.now()){
 if(payload.version!==REPLAY_VERSION)throw new Error('This run is from an older game version. Please start a new run.');
 if(!Number.isInteger(payload.steps)||payload.steps<1||payload.steps>216000)throw new Error('This run could not be verified.');
 if(!Array.isArray(payload.inputs)||payload.inputs.length>12000)throw new Error('This run could not be verified.');
 if(now-ticket.created_at>7200000||now-ticket.created_at<payload.steps*STEP*1000-2000)throw new Error('This run has expired or could not be verified.');
 let previous=-1;
 for(const e of payload.inputs){if(!Array.isArray(e)||e.length!==2||!Number.isInteger(e[0])||e[0]<previous||e[0]<0||e[0]>=payload.steps||!Number.isInteger(e[1])||e[1]<0||e[1]>3)throw new Error('This run could not be verified.');previous=e[0]}
 const run=new Run(seededRandom(ticket.seed),{recordInputs:false});run.start();let next=0;
 while(run.state==='playing'&&run.steps<payload.steps){while(next<payload.inputs.length&&payload.inputs[next][0]===run.steps){const code=payload.inputs[next++][1];if(code===0)run.jump();else if(code===1)run.doubleJump();else run.setDuck(code===2)}run.advance(STEP)}
 if(run.state!=='caught'||run.steps!==payload.steps||next!==payload.inputs.length)throw new Error('Finish a full run before posting a score.');
 if(run.collected<1)throw new Error('Collect at least one fry before posting a score.');
 return {score:Number(run.collected),distance:Number(run.distance)};
}
