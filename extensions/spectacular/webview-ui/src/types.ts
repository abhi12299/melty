// This file manually kept in sync between
// - src/types.ts
// - webview-ui/src/types.ts

// Parameters needed to initialize Melty.
export type MeltyContext = {
	workspaceRoot: string;
	meltyRoot: string;
	gitRepo: any;
};

export type MeltyConfig = {
	debugMode: boolean;
};

export type JouleTypeHuman =
	| "HumanChat"
	| "HumanConfirmCode";
//   | "HumanAddFile"

export type JouleTypeBot =
	| "BotChat"
	| "BotCode";

export type JouleType = JouleTypeHuman | JouleTypeBot;

// defines edges of the state graph
export function nextJouleType(joule: Joule): JouleType {
	switch (joule.jouleType) {
		case "HumanChat":
			return "BotChat";
		case "BotCode":
			return "HumanChat";
		case "BotChat":
			switch (joule.stopReason) {
				case "confirmCode":
					return "HumanConfirmCode";
				case "endTurn":
					return "HumanChat";
				case null:
					return "HumanChat"; // needed for error joules. todo get rid of this.
			}
		case "HumanConfirmCode":
			return joule.confirmed ? "BotCode" : "HumanChat";
	}
}

export type JouleBase = {
	readonly jouleType: JouleType;
	readonly id: string;
	readonly jouleState: "complete" | "partial" | "error";
};

export type CodeInfo = {
	readonly commit: string | null;
	readonly diffInfo: DiffInfo | null;
};

/* ======================= Joules ========================== */

export type JouleHumanChat = JouleBase & {
	readonly jouleType: "HumanChat";
	readonly message: string;
	readonly codeInfo: CodeInfo | null;
};

export type JouleHumanConfirmCode = JouleBase & {
	readonly jouleType: "HumanConfirmCode";
	readonly confirmed: boolean;
};

export type JouleBotChat = JouleBase & {
	readonly jouleType: "BotChat";
	readonly message: string;
	readonly botExecInfo: BotExecInfo;
	readonly stopReason: "endTurn" | "confirmCode" | null;
};

export type JouleBotCode = JouleBase & {
	readonly jouleType: "BotCode";
	readonly message: string;
	readonly codeInfo: CodeInfo;
	readonly botExecInfo: BotExecInfo;
};

export type Joule = JouleHumanChat | JouleHumanConfirmCode | JouleBotCode | JouleBotChat;

/* ================================================= */

// implemented by the Task class. this is the UI-facing one
// note that datastores.ts has an independent list of properties
// that will get loaded from disk
export type DehydratedTask = {
	id: string;
	name: string;
	conversation: Conversation;
	branch: string;
	createdAt: Date;
	updatedAt: Date;
	taskMode: TaskMode;
	meltyMindFiles: string[];
};

export type ContextPaths = {
	readonly relativePaths: string[];
	meltyRoot: string;
};

export type TaskMode = "vanilla" | "coder";

export interface AssistantInfo {
	type: TaskMode;
	description: string;
}

export type DiffInfo = {
	readonly filePathsChanged: ReadonlyArray<string> | null;
	readonly diffPreview: string;
};

export type BotExecInfo = {
	readonly rawInput: ClaudeConversation;
	readonly rawOutput: string;
	readonly contextPaths: ContextPaths;
};

export type SearchReplace = {
	readonly filePath: string;
	readonly search: string;
	readonly replace: string;
};

export interface Tag {
	relFname: string;
	fname: string;
	name: string;
	kind: "def" | "ref";
	line: number;
}

export interface Message {
	text: string;
	sender: "user" | "bot";
	diff?: string;
}

export type ClaudeMessage = {
	readonly role: "user" | "assistant";
	readonly content: string;
	readonly cacheUpToThisBlock?: boolean;
};

export type ClaudeConversation = {
	readonly messages: ClaudeMessage[];
	readonly system: string;
};

export type OpenAIMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

export type OpenAIConversation = {
	system: string;
	messages: OpenAIMessage[];
};

export type CodebaseView = {
	readonly view: string;
	readonly allContentsIncluded: boolean;
	readonly includedFiles: string[];
	readonly skippedFiles: string[];
	readonly commit?: string;
};

export type RpcResponseMessage = {
	readonly type: "rpcResponse";
	readonly method: RpcMethod;
	readonly id: number;
	readonly result: any;
	readonly error: any;
}

export type NotificationMessage = {
	readonly type: "notification";
	readonly notificationType: string;
	readonly data?: any;
}

export type MeltyMessage = RpcResponseMessage | NotificationMessage;

export type ConversationBase = {
	/**
	 * Stuff that will get encoded at the beginning of the Claude prompt.
	 * This stuff should generally stay the same throughout the conversation.
	 */
	readonly systemPrompt: string;
	readonly codebaseView: CodebaseView;
};

export type Conversation = {
	readonly conversationBase: ConversationBase;
	readonly joules: ReadonlyArray<Joule>;
};

export type MeltyFile = {
	readonly relPath: string;
	readonly contents: string;
};

export type ChangeSet = {
	readonly filesChanged: {
		[relPath: string]: { original: MeltyFile; updated: MeltyFile };
	};
};

export const ANY_PAGE_RPC_METHODS = [
	"getVSCodeTheme",
	"openWorkspaceDialog",
	"createGitRepository",
	"createAndOpenWorkspace",
	"checkOnboardingComplete",
	"setOnboardingComplete",
	"getMeltyConfig",
	"getMeltyContextError"
] as const;

export type AnyPageRpcMethod = typeof ANY_PAGE_RPC_METHODS[number];

// Assuming you have a similar setup for TasksPageRpcMethod
export const TASKS_PAGE_RPC_METHODS = [
	"listMeltyFiles",
	"listWorkspaceFiles",
	"getActiveTask",
	"listTaskPreviews",
	"createTask",
	"activateTask",
	"deactivateTask",
	"addMeltyFile",
	"dropMeltyFile",
	"createPullRequest",
	"deleteTask",
	"undoLatestCommit",
	"getLatestCommit",
	"getAssistantDescription",
	// human conversation actions
	"createJouleHumanChat",
	"createJouleHumanConfirmCode",
	// bot conversation action
	"startBotTurn",
] as const;

export type TasksPageRpcMethod = typeof TASKS_PAGE_RPC_METHODS[number];

export const PAGE_NAVIGATION_RPC_METHODS = [
	"goToTasksPage",
];

export type PageNavigationRpcMethod = typeof PAGE_NAVIGATION_RPC_METHODS[number];

export type RpcMethod = AnyPageRpcMethod | TasksPageRpcMethod | PageNavigationRpcMethod;
