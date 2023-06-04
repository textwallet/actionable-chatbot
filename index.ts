import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
function replaceAll(str: string, find: string, replace: string): string {
  return str.split(find).join(replace);
}

const USER_PROMPT = `
{description}
You are a chatbot assisant that executes actions. 
For each request by the user, you will return a JSON object containing an action based on the users query. 

Here is the schema for what your responses should be. Only respond with responses in this schema, with what the user requests,  if you don't know how to fill all the params, respond with the "chat" action. Here is the list of actions you are able to respond with:

{actions}

make sure the user has explicitly said all the params in the action before executing, remember, if you need more information from the user, just respond with the chat action if exists so they will be prompted to add more information for you. You must always respond with an action. 

Dont ask the user for specific params, just respond in a communicative way asking for the information you need, for example, if the user says "transfer money to my friend", you should respond with the "chat" action for "who would you like to transfer money to?" instead of "who is the recipient param for the transfer?".

IMPORTANT: NEVER RESPOND WITHOUT AN ACTION, ALWAYS RESPOND WITH AN ACTION, IF YOU WANT TO COMMUNICTATE, RESPOND WITH CHAT ACTION

Do you understand?
`;

const ASSISANT_REPONSE = `
I understand.

The user's request is that as a chatbot, I should always respond with an action expressed as a JSON object. Each action is defined according to a certain schema. Before executing any action, I need to confirm that all the necessary params are provided by the user if the param is marked as requiredByUser.

If the user has not provided all the necessary information to fill out the params, I should return a "chat" action to prompt the user for the additional details needed. This should be done in a conversational manner without specifically asking for a particular parameter.

The user will also provide a conversation history for context. This history provides valuable information that can help generate appropriate responses, i should use the previous history as context for the next message action.

The essential part here is that I must never respond without returning an action, and only respond with the JSON action, no fluff, no introductions or explanations, just the JSON action.
`;

const USER_INPUT_PROMPT = `This is the history for the user, the format should not be used for responses, and does not accurately respect current user stats. but it provides context into the conversation that you should use to respond to the user with the appropriate action.

## Conversation History (You are the assistant, the user is the users messages to you previously, and the system provides context ))): 

{history}
`;

export interface ActionSchema {
  name: string;
  params?: Param[];
  requiredParams?: string[];
  function?: Function;
  description: string;
  exampleParams?: Record<string, string>;
  exampleUserInput?: string;
}

export interface Param {
  name: string;
  type: string;
  description: string;
  enum?: string[];
  pattern?: string;
  assistantSupplied?: boolean;
  userInputRequired?: boolean;
}

export interface History {
  type: "system" | "user" | "assistant";
  message: string;
}

export default class ActionableChatbot {
  private actions: ActionSchema[];
  private history: History[];
  private openai: OpenAIApi;
  private engine: string;
  private description: string = "";
  private system =
    "You are a helpful chatbot that returns JSON for actions supplied by the user.";

  private eventListeners: Record<string, Function[]> = {};

  constructor(
    apiKey: string,
    org?: string,
    engine: string = "gpt-3.5-turbo",
    dontAddChatAction?: boolean
  ) {
    this.actions = [];
    this.history = [];
    this.openai = new OpenAIApi(
      new Configuration({ apiKey: apiKey, organization: org })
    );
    this.engine = engine;
    if (!dontAddChatAction) {
      this.addChatAction();
    }
  }
  setHistory(history: History[]) {
    this.history = history;
  }
  setDescription(description: string) {
    this.description = description;
  }
  setSystem(system: string) {
    this.system = system;
  }
  addAction(actionSchema: ActionSchema) {
    this.actions.push(actionSchema);
  }
  addGasLightingAction() {
    this.addAction({
      name: "testAction",
      description:
        "this test action will test that the bot is functioning properly and should only be executed when the user requests a test action.",
      params: [
        {
          type: "string",
          name: "test",
          description: "This is the test param, it should be a string.",
        },
      ],
    });
  }
  addChatAction() {
    this.addAction({
      name: "chat",
      description:
        "The chat action will prompt the user for more information, and should be executed when the user does not supply enough information for an action to be executed, or to communicate with the user.",
      params: [
        {
          type: "string",
          name: "message",
          description:
            "This is the message to prompt the user with, it should be a string.",
        },
      ],
      function: async (params: Record<string, string>) => {
        this.addAssistantMessage(params.message);
      },
      exampleUserInput: "Hey how are you?",
      exampleParams: {
        message:
          "I'm an AI assistant, I don't have feelings, but I'm here to help you. What can I do for you today?",
      },
    });
  }

  private getActionsAsString() {
    let str = "";
    this.actions.forEach((action) => {
      str += "# '" + action.name + "' Action\n\n";
      str += "Description\n" + action.description + "\n\n";
      str += `example params for ${action.name}\n`;
      str +=
        replaceAll(
          JSON.stringify(action.params, null, 2),
          `"userInputRequired": true`,
          `"userInputRequired": true // If not supplied by the user input or history context, return the 'chat' action asking for this parameter to be included.`
        ) + "\n\n";
      str += "example user input: " + action.exampleUserInput + "\n\n    ";
      str += `\nexample response \n\n`;
      str += this.buildExample(action) + "\n\n";
    });

    return str;
  }
  private getHistoryAsString() {
    let str = "";
    for (const history of this.history) {
      str += history.type + ": " + history.message + "\n";
    }

    return str;
  }

  buildExample(actionSchema: ActionSchema) {
    if (actionSchema.exampleParams) {
      return JSON.stringify({
        action: actionSchema.name,
        params: actionSchema.exampleParams,
      });
    }

    let json = {
      action: actionSchema.name,
      params: {},
    } as {
      action: string;
      params: Record<string, string>;
    };
    actionSchema.params?.forEach((param) => {
      json.params[param.name] = "(" + param.description + ")";
    });
    return JSON.stringify(json);
  }

  async input(input: string) {
    const prompt = USER_PROMPT.replace("{actions}", this.getActionsAsString())
      .replace("{history}", this.getHistoryAsString() || "No History Yet")
      .replace("{description}", this.description);

    const user_input =
      USER_INPUT_PROMPT.replace(
        "{history}",
        this.getHistoryAsString() || "No History Yet"
      ) +
      "\nUser Input:\n" +
      input;

    this.history.push({
      type: "user",
      message: input,
    } as History);

    const messages = [
      {
        role: "system",
        content: this.system,
      },
      {
        role: "user",
        content: prompt,
      },
      {
        role: "assistant",
        content: ASSISANT_REPONSE,
      },
    ];

    if (this.engine == "gpt-3.5-turbo") {
      messages.push({
        role: "user",
        content:
          USER_INPUT_PROMPT.replace(
            "{history}",
            this.getHistoryAsString() || "No History Yet"
          ) +
          "\nUser Input:\n" +
          "How Are You?",
      });
      messages.push({
        role: "assistant",
        content: `{"action": "chat", "params": {"message": "Sorry, I dont know what to do with this message, can you supply more information?"}}`,
      });
    }

    messages.push({
      role: "user",
      content: user_input,
    });
    const response = await this.openai.createChatCompletion({
      model: this.engine,
      messages: messages as ChatCompletionRequestMessage[],
      max_tokens: 50,
      temperature: 0,
      top_p: 1,
    });

    const returned_message = response.data.choices[0].message?.content || "";
    if (!returned_message) {
      throw new Error("No message returned from OpenAI API");
    }

    function extractJson(input: string): string | null {
      const match = input.match(/{.*}/);
      return match ? match[0] : null;
    }

    const extracted = extractJson(returned_message);
    if (!extracted) {
      throw new Error("No JSON returned from OpenAI API");
    }
    const json = JSON.parse(extracted);

    if (!json || !json.action) {
      throw new Error("No action returned from OpenAI API");
    }

    const action = json.action;
    const actionSchema = this.actions.find((a) => a.name === action);
    if (!actionSchema) {
      throw new Error(`Action ${action} not found`);
    }

    const params = json.params || {};

    if (actionSchema.function && typeof actionSchema.function === "function") {
      const actionResponse = await actionSchema.function(params);
      if (actionResponse) {
        this.addSystemMessage(actionSchema.name + ":" + actionResponse);
      }
    }
    return json;
  }

  async addSystemMessage(message: string) {
    this.history.push({
      type: "system",
      message: message,
    } as History);
    this.eventListeners["system"]?.forEach((callback) => {
      callback(message);
    });
  }

  async addAssistantMessage(message: string) {
    this.history.push({
      type: "assistant",
      message: message,
    } as History);
    this.eventListeners["assisant"]?.forEach((callback) => {
      callback(message);
    });
  }

  async getHistory() {
    return this.history;
  }

  async addUserMessage(message: string) {
    this.history.push({
      type: "user",
      message: message,
    } as History);
    this.eventListeners["user"]?.forEach((callback) => {
      callback(message);
    });
  }
  async on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
}
