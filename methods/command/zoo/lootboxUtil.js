/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const global = require("../../../util/global.js");
const box = "<:box:427352600476647425>";
const tempGem = require("../../../json/gems.json");
var gems = {};
for (var key in tempGem.gems){
 	var temp = tempGem.gems[key];
	temp.key = key;
	if(!gems[temp.type]) gems[temp.type] = [];
	gems[temp.type].push(temp);
}
var typeCount = Object.keys(gems).length;
const ranks = {"c":"Common","u":"Uncommon","r":"Rare","e":"Epic","m":"Mythical","l":"Legendary","f":"Fabled"};

exports.getItems = async function(p){
	var sql = `SELECT boxcount FROM lootbox WHERE id = ${p.msg.author.id} AND boxcount > 0;`;
	var result = await p.query(sql);
	if(!result[0]){return {}}
	return {box:{emoji:box,id:50,count:result[0].boxcount}};
}

exports.getRandomGem = function(id,patreon){
	patreon = true;
	let rand= Math.trunc(Math.random()*(typeCount-1));//(typeCount-((patreon)?1:0)));
	let count = 0;
	let type = "Hunting";
	for (var key in gems){
		/*
		if(!(patreon&&key=="Patreon")){
			if(count==type) type = key;
			count++;
		}
		*/
		if(key=="Patreon"){
			count++;
			rand++;
		}else if(count==rand){
			type = key;
			count++;
		}else{
			count++;
		}
	}

	if(global.isInt(type))
		type = Object.keys(gems)[0];

	type = gems[type];
	rand = Math.random();
	let gem;
	let sum = 0
	for(var x in type){
		sum += type[x].chance;
		if(rand<sum){
			gem = type[x];
			rand = 100;
		}
	}
	var rank = ranks[gem.key[0]];

	var sql = `INSERT INTO user_gem (uid,gname,gcount) VALUES (
			(SELECT uid FROM user WHERE id = ${id}),
			(SELECT gname FROM gem WHERE gname = '${gem.key}'),
			1
		) ON DUPLICATE KEY UPDATE
			gcount = gcount + 1;`

	return {gem:gem,
		name:rank+" "+gem.type+" Gem",
		sql:sql};
}

exports.getRandomGems = function(p,count){
	allGems = {};
	for(let i=0;i<count;i++){
		let rand= Math.trunc(Math.random()*(typeCount-1));
		let count = 0;
		let type = "Hunting";
		for (let key in gems){
			if(key=="Patreon"){
				count++;
				rand++;
			}else if(count==rand){
				type = key;
				count++;
			}else{
				count++;
			}
		}
		if(global.isInt(type))
			type = Object.keys(gems)[0];

		type = gems[type];
		rand = Math.random();
		let gem;
		let sum = 0
		for(var x in type){
			sum += type[x].chance;
			if(rand<sum){
				gem = type[x];
				rand = 100;
			}
		}
		if(allGems[gem.key]){
			allGems[gem.key].count++;
		}else{
			let rank = ranks[gem.key[0]];
			allGems[gem.key] = {
				gem:gem,
				name:rank+" "+gem.type+" Gem",
				count:1
			}
		}
	}
	console.log(allGems);

	return;
	var sql = `INSERT INTO user_gem (uid,gname,gcount) VALUES (
			(SELECT uid FROM user WHERE id = ${id}),
			'${gem.key}',1
		) ON DUPLICATE KEY UPDATE
			gcount = gcount + 1;`

	return {gem:gem,
		name:rank+" "+gem.type+" Gem",
		sql:sql};
}

exports.desc = function(p){
	var text = "**ID:** 50\nOpens a lootbox! Check how many you have in 'owo inv'!\nYou can get some more by hunting for animals. You can get a maximum of 3 lootboxes per day.\nUse `owo inv` to check your inventory\nUse 'owo use {id}` to use the item!";
	var embed = {
	"color": 4886754,
	"fields":[{
		"name":box+" Lootbox",
		"value":text
		}]
	};
	p.send({embed});
}
