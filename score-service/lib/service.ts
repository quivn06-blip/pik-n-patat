import { TOP_SCORES, SAVE_SCORE, USE_TICKET } from './queries.mjs';
import { env } from 'cloudflare:workers';
import { nickname, validPlayer, validateReplay } from './replay.mjs';
import { REPLAY_VERSION } from './game/core.mjs';

const origins = new Set(['https://fry-and-fly.vercel.app', 'https://fry-and-fly-scores.daintyflute16.chatgpt.site']);
class ApiError extends Error { constructor(message:string,public status=400){super(message)} }
function database(){if(!env.DB)throw new ApiError('The leaderboard is temporarily unavailable.',503);return env.DB}
function response(request:Request,data:unknown,status=200){
 const headers:Record<string,string>={'Cache-Control':'no-store','Vary':'Origin'};
 const origin=request.headers.get('Origin');
 if(origin&&origins.has(origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Methods']='GET, POST, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type';headers['Access-Control-Max-Age']='3600'}
 return data===null?new Response(null,{status,headers}):Response.json(data,{status,headers});
}
function originCheck(request:Request){const origin=request.headers.get('Origin');if(origin&&!origins.has(origin))throw new ApiError('This origin is not allowed.',403)}
async function body(request:Request){
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new ApiError('Send JSON.',415);
 if(Number(request.headers.get('content-length')||0)>192000)throw new ApiError('This run is too large.',413);
 const text=await request.text();if(text.length>192000)throw new ApiError('This run is too large.',413);
 try {const parsed=JSON.parse(text);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error();return parsed as Record<string,any>}catch{throw new ApiError('Invalid request.')}
}
async function hash(value:string){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')}
async function limit(id:string,max:number,now:number){const end=(Math.floor(now/3600000)+1)*3600000;const key=id+':'+Math.floor(now/3600000);const row=await database().prepare('INSERT INTO rate_limits (id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 WHERE rate_limits.count < ? RETURNING count').bind(key,end,max).first();if(!row)throw new ApiError('Too many attempts. Please try again later.',429)}
export async function getBoard(){const result=await database().prepare(TOP_SCORES).all();return result.results.map((r,i)=>({id:r.id,rank:i+1,nickname:r.nickname,score:r.score,distance:r.distance}))}
async function personalEntry(key:string){const row=await database().prepare('SELECT id,nickname,score,distance,created_at FROM scores WHERE player_key=?').bind(key).first<{id:string,nickname:string,score:number,distance:number,created_at:number}>();if(!row)return null;const rank=await database().prepare('SELECT COUNT(*)+1 AS rank FROM scores WHERE score>? OR (score=? AND distance>?) OR (score=? AND distance=? AND created_at<?) OR (score=? AND distance=? AND created_at=? AND id<?)').bind(row.score,row.score,row.distance,row.score,row.distance,row.created_at,row.score,row.distance,row.created_at,row.id).first<{rank:number}>();return{id:row.id,nickname:row.nickname,score:row.score,distance:row.distance,rank:rank?.rank??1}}
export async function scores(request:Request){return handle(request,async()=>{
 if(request.method==='GET')return response(request,{scores:await getBoard()});
 if(request.method!=='POST')throw new ApiError('Method not allowed.',405);
 const data=await body(request);if(!validPlayer(data.playerId)||typeof data.token!=='string'||!/^[-\w]{36}$/.test(data.token))throw new ApiError('Please start a new run.');
 const key=await hash(data.playerId);let name:string;try{name=nickname(data.nickname)}catch(error){throw new ApiError(error instanceof Error?error.message:'Enter a nickname.')}
 const ticket=await database().prepare('SELECT seed,player_key,created_at,used_at FROM run_tickets WHERE id=?').bind(data.token).first<{seed:number,player_key:string,created_at:number,used_at:number|null}>();
 if(!ticket||ticket.player_key!==key)throw new ApiError('This run has expired. Please start a new run.');
 if(ticket.used_at!==null)return response(request,{entry:await personalEntry(key),alreadyPosted:true,bestUpdated:false});
 const now=Date.now();let verified:{score:number,distance:number};try{verified=validateReplay(data,ticket,now)}catch(error){throw new ApiError(error instanceof Error?error.message:'This run could not be verified.')}const old=await personalEntry(key);
 await database().batch([
 database().prepare(SAVE_SCORE).bind(crypto.randomUUID(),key,name,verified.score,verified.distance,now,data.token),
 database().prepare(USE_TICKET).bind(now,data.token)
 ]);
 const entry=await personalEntry(key);return response(request,{entry,bestUpdated:!old||verified.score>old.score||(verified.score===old.score&&verified.distance>old.distance)},201);
})}
export async function runs(request:Request){return handle(request,async()=>{
 if(request.method!=='POST')throw new ApiError('Method not allowed.',405);
 const data=await body(request);if(data.version!==REPLAY_VERSION||!validPlayer(data.playerId))throw new ApiError('Please refresh the game and try again.');
 const now=Date.now(),key=await hash(data.playerId),ip=request.headers.get('CF-Connecting-IP');
 await limit('player:'+key,120,now);if(ip)await limit('network:'+await hash(ip+':'+Math.floor(now/86400000)),600,now);
 const id=crypto.randomUUID(),seed=crypto.getRandomValues(new Uint32Array(1))[0];
 await database().batch([
 database().prepare('INSERT INTO run_tickets (id,seed,player_key,created_at) VALUES (?,?,?,?)').bind(id,seed,key,now),
 database().prepare('DELETE FROM run_tickets WHERE created_at<?').bind(now-7200000),
 database().prepare('DELETE FROM rate_limits WHERE expires_at<?').bind(now)
 ]);
 return response(request,{id,seed,version:REPLAY_VERSION},201);
})}
async function handle(request:Request,action:()=>Promise<Response>){try{originCheck(request);if(request.method==='OPTIONS')return response(request,null,204);return await action()}catch(error){if(error instanceof ApiError)return response(request,{error:error.message},error.status);console.error('Leaderboard request failed',error instanceof Error?error.message:'Unknown error');return response(request,{error:'The leaderboard is temporarily unavailable. Please try again.'},503)}}
