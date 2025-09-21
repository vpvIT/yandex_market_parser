import dotenv from "dotenv";

dotenv.config();

const botToken = process.env.BOT_TOKEN;

if(!botToken) {
    throw new Error('BOT_TOKEN is not specified!');
}

const allowedUsersRaw = process.env.ALLOWED_USERS;

if(!allowedUsersRaw) {
    throw new Error('ALLOWED_USERS is not specified!');
}

const allowedUsers = allowedUsersRaw.split(',');

if(allowedUsers.some(userId => isNaN(+userId))) {
    throw new Error(`Incorrect allowed user`);
}

const config = {
    botToken,
    allowedUsers
};

export default config;