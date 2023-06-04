import ActionableChatbot from ".";

async function test() {
  const chat = new ActionableChatbot(
    "",
    "",
   // "gpt-4"
  );

  chat.addAction({
    name: "karate chop",
    description: "This action will karate chop the user supplied.",
    params: [
      {
        type: "string",
        name: "personToChop",
        description:
          "This is the person to karate chop. if not supplied, return the 'chat' questioning the user. ",
          userInputRequired: true,
      },
    ],
    function: async (params: Record<string, string>) => {
      console.log("KARATE CHOPPING ", params.personToChop);
    },
    exampleParams: {
      personToChop: "John",
    },
    exampleUserInput: "kill John",
  });
  /*
  chat.on("assisant", (message: string) => {
      console.log("Assistant Said: ", message);
  });
  */
  console.log("Inputting: ", "karate chop.");
  const response = await chat.input("I want to karate chop.");
  console.log(response);

  console.log("Inputting: ", " Ryan");
  const response2 = await chat.input(" Ryan");
  console.log(response2);
}

test();
