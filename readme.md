# ActionableChatbot

p.s. I ai generated this, ill create a more in depth readme later. You should check out https://textwallet.io, where a similar framework is being actively used.

ActionableChatbot is a Node.js framework designed to create an interactive chatbot with programmable actions. The core functionality is centered around the idea of actions. An action is a specific task the chatbot can perform based on user input, such as returning information or performing a specific function.

In this framework, user input is used to determine which action should be executed. If the user's request doesn't supply enough information for an action to be executed, the chatbot uses the built-in "chat" action to request more information.

Each action is defined by an action schema, which includes the action's name, parameters, required parameters, description, and an optional function to be executed.

## ActionSchema

An action schema includes the following fields:

- **name**: The name of the action.
- **params**: An optional array of parameters that the action requires.
- **requiredParams**: An optional array of names of parameters that are required for the action to be executed.
- **function**: An optional function to be executed for the action. If provided, the function will be called with the parameters when the action is triggered.
- **description**: A description of the action.
- **exampleParams**: An optional field containing example parameters for the action.
- **exampleUserInput**: An optional field containing an example of user input that would trigger the action.

## Param

Each parameter in the `params` field of an action schema includes the following fields:

- **name**: The name of the parameter.
- **type**: The type of the parameter. This could be any JavaScript type like "string", "number", "boolean", etc.
- **description**: A description of the parameter.
- **enum**: An optional array of string values that the parameter can take.
- **pattern**: An optional regular expression that the parameter value should match.
- **assistantSupplied**: An optional boolean field indicating whether the parameter value can be supplied by the assistant.
- **userInputRequired**: An optional boolean field indicating whether the parameter value needs to be provided by the user. If this field is true and the user doesn't provide a value, the assistant should return the 'chat' action asking for this parameter.

## Using the framework

Here is a simple example to illustrate how to use the framework:

```javascript
import ActionableChatbot from "your-module-path";

const chatbot = new ActionableChatbot({
  apiKey: "your-openai-api-key",
});

// Add a simple action.
chatbot.addAction({
  name: "exampleAction",
  description: "This is an example action.",
  params: [
    {
      name: "exampleParam",
      type: "string",
      description: "This is an example parameter.",
      userInputRequired: true,
    },
  ],
  function: (params) => {
    console.log("Example action executed with params:", params);
  },
});
```

With the action defined above, if a user provides input that corresponds to the "exampleAction" and includes the necessary "exampleParam", the chatbot will execute the provided function and log the parameters to the console.

The framework provides a `input` method which takes user's input as a string, and returns a promise with an object containing the action to be executed along with its parameters.

```javascript
chatbot
  .input("User's text input")
  .then((actionObj) => {
    console.log(actionObj);
  })
  .catch((err) => {
    console.error(err);
  });
```

The chatbot remembers the history of the conversation, and will continue to respond if you call chatbot.input multiple times. 
