import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {TOP_SCORES,SAVE_SCORE,USE_TICKET} from '../lib/queries.mjs';
function setup(){const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync(new URL('../drizzle/0000_clammy_spencer_smythe.sql',import.meta.url),'utf8'));return db}
function post(db,token,player,name,score,distance,time){db.prepare('INSERT INTO run_tickets(id,seed,player_key,created_at) VALUES(?,?,?,?)').run(token,123,player,time);db.exec('BEGIN');db.prepare(SAVE_SCORE).run('entry-'+token,player,name,score,distance,time,token);db.prepare(USE_TICKET).run(time,token);db.exec('COMMIT')}
test('database keeps only the best verified run per player',()=>{const db=setup();post(db,'a','player','Gull',12,100,1);post(db,'b','player','Gull',3,500,2);assert.equal(db.prepare(TOP_SCORES).all().length,1);assert.equal(db.prepare(TOP_SCORES).get().score,12);post(db,'c','player','Gull',15,140,3);assert.equal(db.prepare(TOP_SCORES).get().score,15);db.close()});
test('ranking sorts fries first, then distance, then first achieved',()=>{const db=setup();post(db,'a','a','A',12,100,1);post(db,'b','b','B',12,200,2);post(db,'c','c','C',13,80,3);post(db,'d','d','D',12,200,4);assert.deepEqual(db.prepare(TOP_SCORES).all().map(r=>r.nickname),['C','B','D','A']);db.close()});
test('a consumed ticket cannot create a second leaderboard entry',()=>{const db=setup();post(db,'a','a','A',12,100,1);db.prepare(SAVE_SCORE).run('different-entry','different-player','B',999,999,2,'a');assert.equal(db.prepare(TOP_SCORES).all().length,1);db.close()});
