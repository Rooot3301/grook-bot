import fs from 'fs/promises'; import path from 'path';
const AUDIT_FILE = path.join(process.cwd(),'logs','audit.log');
async function ensure(){ try{ await fs.mkdir(path.dirname(AUDIT_FILE),{recursive:true}) }catch{} }
export async function logAction({actorId,guildId,targetId,action,details}){
  await ensure(); const entry={ts:new Date().toISOString(),actorId,guildId,targetId,action,details};
  await fs.appendFile(AUDIT_FILE, JSON.stringify(entry)+'\n','utf8');
}