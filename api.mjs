import {plan,nutrition} from './shared/engine.mjs';
export class APIError extends Error {constructor(message,status){super(message);this.status=status;}}
const KEY='fitmind-pages-state-v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{state:null,revision:0};}catch{throw new APIError('Не удалось прочитать данные браузера. Используй экспорт для резервных копий.',500);}};
export async function api(url,{method='GET',data}={}){
 if(url==='/auth/me')return {user:{id:'pages-local',login:'Локальный профиль'}};
 if(url==='/state'&&method==='GET')return read();
 if(url==='/state'&&method==='PUT'){
  const current=read();if(current.revision!==data.revision)throw new APIError('Данные изменились в другой вкладке',409);
  const revision=current.revision+1;
  try{localStorage.setItem(KEY,JSON.stringify({state:data.state,revision}));}catch{throw new APIError('Не удалось сохранить данные: хранилище браузера переполнено или запрещено.',500);}
  return {revision};
 }
 if(url==='/plan')return {week:plan(data.profile,data.checkin,data.history),nutrition:nutrition(data.profile)};
 throw new APIError('Эта функция требует сервер и отключена в версии GitHub Pages.',503);
}
