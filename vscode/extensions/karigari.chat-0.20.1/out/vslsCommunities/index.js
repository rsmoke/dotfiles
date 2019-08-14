"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const gravatar = require("gravatar-api");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const toMessage = (msg) => ({
    timestamp: (Date.parse(msg.timestamp) / 1000.0).toString(),
    userId: msg.sender,
    text: msg.content,
    content: undefined,
    reactions: [],
    replies: {}
});
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class VslsCommunitiesProvider {
    constructor() {
        this.isListenerSetup = false;
        // Waiting for the extension to get activated
        setTimeout(() => {
            this.setupListeners();
        }, 5000);
    }
    setupListeners() {
        const extension = utils_1.getExtension(constants_1.VSLS_COMMUNITIES_EXTENSION_ID);
        if (extension && extension.isActive) {
            const exports = extension.exports;
            exports.setMessageCallback((data) => {
                this.onNewMessage(data);
            });
            exports.setCommunityCallback((name) => {
                this.onNewCommunity(name);
            });
            exports.setClearMessagesCallback((name) => {
                this.onClearMessages(name);
            });
            this.isListenerSetup = true;
        }
    }
    async getApi() {
        let extension = utils_1.getExtension(constants_1.VSLS_COMMUNITIES_EXTENSION_ID);
        if (extension.isActive) {
            if (!this.isListenerSetup) {
                this.setupListeners();
            }
            return extension.exports;
        }
        else {
            await sleep(5000); // Give 5 secs for extension to activate
            extension = utils_1.getExtension(constants_1.VSLS_COMMUNITIES_EXTENSION_ID);
            return extension.exports;
        }
    }
    async connect() {
        const api = await this.getApi();
        if (api) {
            const { name, email } = api.getUserInfo();
            return {
                id: email,
                name,
                teams: [],
                currentTeamId: undefined,
                provider: "vslsCommunities" /* vslsCommunities */
            };
        }
    }
    onNewMessage(data) {
        const { name, messages } = data;
        const chatMessages = messages.map(toMessage);
        let channelMessages = {};
        chatMessages.forEach(msg => {
            channelMessages[msg.timestamp] = msg;
        });
        vscode.commands.executeCommand(constants_1.SelfCommands.UPDATE_MESSAGES, {
            channelId: name,
            messages: channelMessages,
            provider: "vslsCommunities"
        });
    }
    onNewCommunity(communityName) {
        vscode.commands.executeCommand(constants_1.SelfCommands.VSLS_COMMUNITY_JOINED, {
            name: communityName
        });
    }
    onClearMessages(communityName) {
        vscode.commands.executeCommand(constants_1.SelfCommands.CLEAR_MESSAGES, {
            channelId: communityName,
            provider: "vslsCommunities"
        });
    }
    isConnected() {
        return this.isListenerSetup;
    }
    async sendMessage(text, currentUserId, channelId) {
        const api = await this.getApi();
        api.sendMessage(channelId, text);
    }
    async fetchUsers() {
        const api = await this.getApi();
        const users = api.getUsers().map(({ name, email }) => {
            const avatar = gravatar.imageUrl({
                email,
                parameters: { size: "200", d: "retro" },
                secure: true
            });
            return {
                id: email,
                name,
                email,
                fullName: name,
                imageUrl: avatar,
                smallImageUrl: avatar,
                presence: "available" /* available */
            };
        });
        let usersToSend = {};
        users.forEach(u => {
            usersToSend[u.id] = u;
        });
        return usersToSend;
    }
    async fetchUserInfo(userId) {
        const users = await this.fetchUsers();
        return users[userId];
    }
    async fetchChannels(users) {
        const api = await this.getApi();
        const communities = api.getCommunities();
        const channels = communities.map((name) => ({
            id: name,
            name,
            type: "channel" /* channel */,
            readTimestamp: undefined,
            unreadCount: 0
        }));
        return channels;
    }
    async loadChannelHistory(channelId) {
        const api = await this.getApi();
        const messages = await api.getChannelHistory(channelId);
        const chatMessages = messages.map(toMessage);
        let channelMessages = {};
        chatMessages.forEach(msg => {
            channelMessages[msg.timestamp] = msg;
        });
        return channelMessages;
    }
    subscribePresence(users) { }
    getUserPreferences() {
        return Promise.resolve({});
    }
    async validateToken() {
        return;
    }
    async fetchChannelInfo(channel) {
        return undefined;
    }
    async markChannel(channel, ts) {
        return undefined;
    }
    async fetchThreadReplies(channelId, ts) {
        return undefined;
    }
    async sendThreadReply(text, currentUserId, channelId, parentTimestamp) { }
    async updateSelfPresence(presence, durationInMinutes) {
        return undefined;
    }
    async createIMChannel(user) {
        return undefined;
    }
    async destroy() { }
}
exports.VslsCommunitiesProvider = VslsCommunitiesProvider;
//# sourceMappingURL=index.js.map