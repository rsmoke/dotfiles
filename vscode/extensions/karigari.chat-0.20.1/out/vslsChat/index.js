"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vsls = require("vsls");
const utils_1 = require("./utils");
const host_1 = require("./host");
const guest_1 = require("./guest");
const constants_1 = require("../constants");
const str = require("../strings");
const logger_1 = require("../logger");
class VslsChatProvider {
    async connect() {
        // This method sets up the chat provider to listen for changes in vsls session
        const liveshare = await vsls.getApi();
        if (!liveshare) {
            logger_1.default.log('vsls not found, required to initialize chat');
            return undefined;
        }
        if (!!this.liveshare) {
            // We have already initialized, and we don't want to
            // attach the event listeners again.
            // (This overrides the connect() logic inside ChatProviderManager)
            return undefined;
        }
        this.liveshare = liveshare;
        this.liveshare.onDidChangePeers(({ added, removed }) => {
            if (!!this.hostService) {
                this.hostService.updateCachedPeers(added, removed);
                this.hostService.sendJoinedMessages(added);
                this.hostService.sendLeavingMessages(removed);
            }
        });
        this.liveshare.onDidChangeSession(async ({ session }) => {
            const { id: sessionId, role } = session;
            const isSessionActive = !!sessionId;
            let currentUser;
            if (isSessionActive) {
                currentUser = await this.initializeChatService();
                if (!!this.hostService) {
                    this.hostService.sendStartedMessage();
                }
            }
            else {
                if (!!this.hostService) {
                    this.hostService.sendEndedMessage();
                }
                await this.clearSession();
            }
            vscode.commands.executeCommand(constants_1.SelfCommands.LIVE_SHARE_SESSION_CHANGED, {
                isSessionActive,
                currentUser
            });
        });
    }
    async initializeChatService() {
        // This assumes live share session is available
        const liveshare = await vsls.getApi();
        const { role, id: sessionId, peerNumber, user } = liveshare.session;
        if (!user || !sessionId) {
            return undefined;
        }
        const serviceName = utils_1.getVslsChatServiceName(sessionId);
        if (role === vsls.Role.Host) {
            const sharedService = await liveshare.shareService(serviceName);
            if (!sharedService) {
                throw new Error("Error sharing service for Live Share Chat.");
            }
            this.hostService = new host_1.VslsHostService(liveshare, sharedService, peerNumber, serviceName);
        }
        else if (role === vsls.Role.Guest) {
            const serviceProxy = await liveshare.getSharedService(serviceName);
            if (!serviceProxy) {
                throw new Error("Error getting shared service for Live Share Chat.");
            }
            if (!serviceProxy.isServiceAvailable) {
                vscode.window.showWarningMessage(str.NO_LIVE_SHARE_CHAT_ON_HOST);
                return;
            }
            else {
                this.guestService = new guest_1.VslsGuestService(liveshare, serviceProxy, liveshare.session);
            }
        }
        const sessionTeam = {
            id: sessionId,
            name: utils_1.VSLS_CHAT_CHANNEL.name
        };
        return {
            id: peerNumber.toString(),
            name: user.displayName,
            teams: [Object.assign({}, sessionTeam)],
            currentTeamId: sessionTeam.id,
            provider: "vsls" /* vsls */
        };
    }
    async clearSession() {
        if (!!this.hostService) {
            await this.hostService.dispose();
        }
        if (!!this.guestService) {
            await this.guestService.dispose();
        }
        this.hostService = undefined;
        this.guestService = undefined;
    }
    isConnected() {
        if (!!this.hostService) {
            return this.hostService.isConnected();
        }
        else if (!!this.guestService) {
            return this.guestService.isConnected();
        }
        return false;
    }
    fetchUsers() {
        if (!!this.hostService) {
            return this.hostService.fetchUsers();
        }
        else if (!!this.guestService) {
            return this.guestService.fetchUsers();
        }
        return Promise.resolve({});
    }
    async fetchUserInfo(userId) {
        if (!!this.hostService) {
            return this.hostService.fetchUserInfo(userId);
        }
        else if (!!this.guestService) {
            return this.guestService.fetchUserInfo(userId);
        }
    }
    sendMessage(text, currentUserId, channelId) {
        if (!!this.hostService) {
            return this.hostService.sendMessage(text, currentUserId, channelId);
        }
        else if (!!this.guestService) {
            return this.guestService.sendMessage(text, currentUserId, channelId);
        }
        return Promise.resolve();
    }
    loadChannelHistory(channelId) {
        // There is just one channel at this point
        if (!!this.hostService) {
            return this.hostService.fetchMessagesHistory();
        }
        else if (!!this.guestService) {
            return this.guestService.fetchMessagesHistory();
        }
        return Promise.resolve({});
    }
    async destroy() {
        if (!!this.hostService) {
            await this.hostService.dispose();
        }
    }
    getUserPreferences() {
        return Promise.resolve({});
    }
    async fetchChannels(users) {
        const readTimestamp = (+new Date() / 1000.0).toString();
        const defaultChannel = {
            id: utils_1.VSLS_CHAT_CHANNEL.id,
            name: utils_1.VSLS_CHAT_CHANNEL.name,
            type: "channel" /* channel */,
            readTimestamp,
            unreadCount: 0
        };
        return [defaultChannel];
    }
    fetchChannelInfo(channel) {
        return Promise.resolve(Object.assign({}, channel));
    }
    subscribePresence(users) { }
    markChannel(channel, ts) {
        return Promise.resolve(Object.assign({}, channel, { readTimestamp: ts, unreadCount: 0 }));
    }
    async validateToken() {
        // This will never be called, since vsls does not have a token configuration step
        return undefined;
    }
    async fetchThreadReplies(channelId, ts) {
        return {
            timestamp: ts,
            userId: "",
            text: "",
            content: undefined,
            reactions: [],
            replies: {}
        };
    }
    sendThreadReply(text, currentUserId, channelId, parentTimestamp) {
        return Promise.resolve();
    }
    async createIMChannel(user) {
        return undefined;
    }
    updateSelfPresence() {
        // no-op
    }
}
exports.VslsChatProvider = VslsChatProvider;
//# sourceMappingURL=index.js.map