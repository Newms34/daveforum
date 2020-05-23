module.exports = [{
    name: '/beckon',
    description: 'Beckon',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} Beckons.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} beckons themself. Not sure how that works...`);
        }
        return (`${message.author.username} beckons to ${args}.`)
    },
}, {
    name: '/bow',
    description: 'Bow',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} bows.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} is so fancy they bow to themselves.`);
        }
        return (`${message.author.username} bows for ${args}.`)
    },
}, {
    name: '/cheer',
    description: 'Cheer',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} cheers.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} cheers for themself. Well at least someone does`);
        }
        return (`${message.author.username} cheers for ${args}.`)
    },
}, {
    name: '/cower',
    description: 'Cower',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} cowers.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} is afraid of themselves!`);
        }
        return (`${message.author.username} cowers in fear of ${args}.`)
    },
}, {
    name: '/crossarms',
    description: 'Cross arms',
    execute(message, args) {
        const refs = ['bub', 'dude', 'guy', 'hombre', 'pal']
        return (`${message.author.username} crosses their arms menacingly. Watch it, ${refs[Math.floor(Math.random() * refs.length)]}!`);
    },
}, {
    name: '/cry',
    description: 'Cry',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} is crying.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} cries alone.`);
        }
        return (`${message.author.username} cries for ${args}.`)
    },
}, {
    name: '/dance',
    description: 'Dance',
    execute(message, args) {
        const danceNames = ['the wurm', 'the elecric slide', 'the moonwalk', 'some funky disco dance', 'the twist', 'some sort of twitchy movement']
        if (!args) {
            return (`${message.author.username} is busting out some moves, some sweet dance moves.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} does ${danceNames[Math.floor(Math.random() * danceNames.length)]}.`);
        }
        return (`${message.author.username} dances for ${args}. Awkward?`)
    },
}, {
    name: '/facepalm',
    description: 'Facepalm',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} is upset.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} is embarrassed for themselves.`);
        }
        return (`${message.author.username} can't believe ${args} just did that.`)
    },
}, {
    name: '/kneel',
    description: 'Kneel',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} kneels.`);
        }
        return (`${message.author.username} kneels respectfully for ${args}.`)
    },
}, {
    name: '/laugh',
    description: 'Laugh',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} laughs.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} laughs at themself. At least they've got a good sense of humor!`);
        }
        return (`${message.author.username} laughs at ${args}.`)
    },
}, {
    name: '/lb',
    description: 'Laugh at Build',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} laughs at some bad builds.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} laughs at their own build.`);
        }
        return (`${message.author.username} laughs at ${args}'s build.`)
    },
}, {
    name: '/no',
    description: 'No',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} disagrees.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} disagrees with themself.`);
        }
        return (`${message.author.username} disagrees with ${args}.`)
    },
}, {
    name: '/point',
    description: 'Point',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} points.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} points at themself.`);
        }
        return (`${message.author.username} points at ${args}.`)
    },
}, {
    name: '/ponder',
    description: 'Ponder',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} ponders.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} is thinking about themself.`);
        }
        return (`${message.author.username} thinks about ${args}.`)
    },
}, {
    name: '/rockout',
    description: 'Rock out',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} is rocking out!`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} rocks out to their own music!`);
        }
        return (`${message.author.username} is rockin' with ${args}!`)
    },
}, {
    name: '/sad',
    description: 'Sad',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} is sad.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} feels bad for themself.`);
        }
        return (`${message.author.username} is sad for ${args}.`)
    },
}, {
    name: '/salute',
    description: 'Salute',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} salutes.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} salutes themself in the mirror.`);
        }
        return (`${message.author.username} salutes ${args}.`)
    },
}, {
    name: '/shiver',
    description: 'Shiver',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} is shivering.`);
        }
        return (`${message.author.username} shivers at ${args}. Brrr!`)
    },
}, {
    name: '/shrugs',
    description: 'Shrugs',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} shrugs.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} shrugs. ¯\\_(ツ)_\/¯`);
        }
        return (`${message.author.username} shrugs at ${args}.`)
    },
}, {
    name: '/sit',
    description: 'Sit',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} sits.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} sits alone.`);
        }
        return (`${message.author.username} sits on ${args}. Rude.`)
    },
}, {
    name: '/sleep',
    description: 'Sleep',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} goes to sleep.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} sleeps alone.`);
        }
        return (`${message.author.username} is bored to sleep by ${args}.`)
    },
}, {
    name: '/surprised',
    description: 'Surprised',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} is surprised.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} consistently surprises themself!`);
        }
        return (`${message.author.username} is surprised by ${args}.`)
    },
}, {
    name: '/talk',
    description: 'Talk',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} talks.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} is talking to themself`);
        }
        return (`${message.author.username} is talking to ${args}.`)
    },
}, {
    name: '/thanks',
    description: 'Thanks',
    execute(message,args) {
        if(!args){
            return (`${message.author.username} is grateful.`);
        }else if(args==='self'||args==='me'){
            return (`${message.author.username} thanks themself.`);
        }
        return (`${message.author.username} thanks ${args}.`)
    },
}, {
    name: '/threaten',
    description: 'Threaten',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} is threatening. Watch out!`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} threatens themself. Ummm...`);
        }
        return (`${message.author.username} threatens ${args}!`)
    },
}, {
    name: '/upset',
    description: 'Upset',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} is upset.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} is embarrassed for themselves.`);
        }
        return (`${message.author.username} can't believe ${args} just did that.`)
    },
}, {
    name: '/wave',
    description: 'Wave',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} waves.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} waves at themselves. How sad.`);
        }
        return (`${message.author.username} waves at ${args}`)
    },
}, {
    name: '/yeet',
    description: 'Yeet',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} yeets someone.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} yeets themself off a cliff. Whee!`);
        }
        return (`${message.author.username} yeets ${args} off a cliff. Begone!`)
    },
}, {
    name: '/yes',
    description: 'Yes',
    execute(message, args) {
        if (!args) {
            return (`${message.author.username} agrees.`);
        } else if (args === 'self' || args === 'me') {
            return (`${message.author.username} agrees with themself. At least someone does!`);
        }
        return (`${message.author.username} agrees with ${args}.`)
    },
},{
    name: '/help',
    description: 'list cmds',
    execute(message,args) {
        // if(!args){
        //     return (`${message.author.username} agrees.`);
        // }else if(args==='self'||args==='me'){
        //     return (`${message.author.username} agrees with themself. At least someone does!`);
        // }
        // return (`${message.author.username} agrees with ${args}.`)
        console.log('HELP STUFF',this)
    },
}]