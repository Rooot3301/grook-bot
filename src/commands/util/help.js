import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'; import { withGuard } from '../../utils/commandGuard.js'; import { Colors } from '../../utils/theme.js'; import { localizeCommand } from '../../utils/i18n.js';
let builder=new SlashCommandBuilder().setName('help').setDescription('Liste les commandes disponibles.');
builder=localizeCommand(builder,{fr:{name:'aide',description:'Liste des commandes'},en:{name:'help',description:'List commands'}});
export const data=builder;
async function run(interaction,client){const byCat=new Map(); for(const [name,cmd] of client.commands){const cat=cmd.category||'autres'; const desc=cmd.data?.description||'—'; if(!byCat.has(cat))byCat.set(cat,[]); byCat.get(cat).push({name,desc});}
 const emb=new EmbedBuilder().setTitle('📖 Aide').setColor(Colors.info);
 for(const [cat,list] of byCat){const lines=list.map((c,i)=>`${i+1}. \`/${c.name}\` — ${c.desc}`); emb.addFields({name:`• ${cat}`,value:(lines.join('\n').slice(0,1024)||'—')});}
 return interaction.editReply({embeds:[emb],ephemeral:true});}
export const execute=withGuard(run,{ephemeralByDefault:true});