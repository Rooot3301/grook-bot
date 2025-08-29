import { PermissionsBitField } from 'discord.js'; import { allowAction } from './ratelimiter.js';
export function withGuard(handler,{perms=[],cooldownMs=3000,ephemeralByDefault=false,rate={max:5,windowMs:10000}}={}){
  return async (interaction,client)=>{try{
    if(interaction.isAutocomplete()) return handler(interaction,client);
    if(!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;
    const key=`${interaction.commandName}:${interaction.user.id}`; if(!allowAction(key,rate)) return interaction.reply({content:'⏳ Trop de requêtes, réessaie bientôt.',ephemeral:true});
    if(interaction.inGuild() && perms.length){const member=interaction.member; if(!member?.permissions?.has(new PermissionsBitField(perms))) return interaction.reply({content:'⛔ Permission insuffisante.',ephemeral:true});}
    if(!interaction.deferred && !interaction.replied && interaction.isChatInputCommand()) await interaction.deferReply({ephemeral:ephemeralByDefault});
    return await handler(interaction,client);
  }catch(err){const msg='❌ Erreur inattendue.'; if(!interaction.replied && !interaction.deferred){await interaction.reply({content:msg,ephemeral:true}).catch(()=>{});} else {await interaction.followUp?.({content:msg,ephemeral:true}).catch(()=>{});} console.error('[commandGuard]',err);}}
}