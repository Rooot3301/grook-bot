import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
export function buildEmbedPage({ title, lines, page, perPage = 10, color = 0x2B2D31 }){
  const start=page*perPage; const slice=lines.slice(start,start+perPage);
  const embed = new EmbedBuilder().setTitle(title).setColor(color).setDescription(slice.join('\n')||'—')
  .setFooter({text:`Page ${page+1}/${Math.max(1,Math.ceil(lines.length/perPage))}`}); return embed;
}
export async function paginate(interaction,{title,lines,perPage=10,timeoutMs=60000}){
  let page=0; const max=Math.max(0,Math.ceil(lines.length/perPage)-1);
  const prev=new ButtonBuilder().setCustomId('prev').setLabel('◀️').setStyle(ButtonStyle.Secondary);
  const next=new ButtonBuilder().setCustomId('next').setLabel('▶️').setStyle(ButtonStyle.Secondary);
  const row=new ActionRowBuilder().addComponents(prev,next);
  const msg=await interaction.editReply({embeds:[buildEmbedPage({title,lines,page,perPage})],components:[row]});
  const col=msg.createMessageComponentCollector({componentType:ComponentType.Button,time:timeoutMs});
  col.on('collect',async i=>{ if(i.user.id!==interaction.user.id) return i.reply({content:'Pas pour toi 😉',ephemeral:true});
    if(i.customId==='prev') page=Math.max(0,page-1); if(i.customId==='next') page=Math.min(max,page+1);
    await i.update({embeds:[buildEmbedPage({title,lines,page,perPage})]})
  }); col.on('end',async()=>{ try{ await msg.edit({components:[]}) }catch{} });
}