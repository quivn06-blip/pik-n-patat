import test from 'node:test';
import assert from 'node:assert/strict';
import {Run,STEP,seededRandom,REPLAY_VERSION} from '../lib/game/core.mjs';
import {nickname,validateReplay,validPlayer} from '../lib/replay.mjs';
function finished(seed=123,play=()=>{}){const run=new Run(seededRandom(seed));run.start();while(run.state==='playing'&&run.steps<2000){play(run);run.advance(STEP)}assert.equal(run.state,'caught');return run}
function payload(run){return{version:REPLAY_VERSION,steps:run.steps,inputs:run.inputs}}
const ticket={seed:123,created_at:1000000};
test('server calculates the actual score, ignoring invented score fields',()=>{const run=finished();assert.deepEqual(validateReplay({...payload(run),score:999999,distance:999999},ticket,1060000),{score:3,distance:run.distance})});
test('a recorded double jump replays exactly',()=>{let jumped=false;const run=finished(123,r=>{if(r.distance>=54&&!jumped){jumped=true;r.jump();r.doubleJump()}});assert.ok(run.inputs.some(e=>e[1]===1));assert.deepEqual(validateReplay(payload(run),ticket,1060000),{score:run.collected,distance:run.distance})});
test('duck release during pause remains in the replay',()=>{let paused=false;const run=finished(123,r=>{if(!paused&&r.distance>20){r.setDuck(true);r.pause();r.resume();paused=true}});assert.ok(run.inputs.some(e=>e[1]===2));assert.ok(run.inputs.some(e=>e[1]===3));assert.deepEqual(validateReplay(payload(run),ticket,1060000),{score:run.collected,distance:run.distance})});
test('unfinished, too-fast and expired runs are rejected',()=>{const run=finished();assert.throws(()=>validateReplay({...payload(run),steps:50},ticket,1060000),/Finish/);assert.throws(()=>validateReplay(payload(run),ticket,1000010),/verified/);assert.throws(()=>validateReplay(payload(run),ticket,10000000),/expired/)});
test('invalid replay ordering and oversized input logs are rejected',()=>{const run=finished();for(const inputs of [[[2,0],[1,1]],[[0,8]],[[-1,0]],[[run.steps,0]],new Array(12001).fill([0,0])])assert.throws(()=>validateReplay({...payload(run),inputs},ticket,1060000))});
test('names are short plain text and player identifiers have UUID shape',()=>{assert.equal(nickname('  Quin   Gull  '),'Quin Gull');assert.equal(nickname('ÉénGull'),'ÉénGull');for(const bad of ['a','<script>','a'.repeat(19),'123gull','x\u200By'])assert.throws(()=>nickname(bad));assert.equal(validPlayer('----------------------------12345678'),false);assert.equal(validPlayer('12345678-1234-1234-1234-123456789012'),true)});
