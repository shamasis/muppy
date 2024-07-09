![image](https://github.com/shamasis/muppy/assets/232373/44671224-0704-4ca4-8346-a21aca45f846)

# muppy

Simple Node.js Chatbot using OpenAI API. We are calling this Muppy!

Just `npm install muppy -g` and then `> muppy` away on your terminal!

> Get your OpenAI API Key from 
> [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
> and save it in your terminal environment using `export OPENAI_API_KEY=<your-api-key>`

Take a look at the code if you want to get started working with OpenAI API
➜ [index.js](index.js)

# Working with OpenAI SDK Code

OpenAI REST API's wrapper SDK does a fairly good job to provide all that is needed
to get started.

It operates around a `stream` object that accepts an array of conversations that
needs to be tracked and maintained by the consumer (you.)

The array of conversations look like:
```js
[
    { role: 'system', content: 'You are a chatbot' },
    { role: 'user', content: 'conversation 1' },
    { role: 'assistant', content: 'llm response to conversation 1' }
    { role: 'user', content: 'conversation 2' },
    { role: 'assistant', content: 'llm response to conversation 2' }
];
```
(roles can be system, user or assistant)

With this JS, we can now open and operate on a `stream` object like so

```js
const stream = await openai.beta.chat.completions.stream({
    model: 'gpt-4',
    messages: [], // this is the array of conversation that needs to be resent every time
    stream: true,
});
```

Now to capture response the stream, it should be fairly simple if you have had worked
with NodeJS stream objects.

## Here is a fully working chatbot code

```js
const OpenAI = require('openai'),
      readline = require('readline');

// Initialize OpenAI with API key
const openai = new OpenAI({
    apiKey: "" // your-api-key-here
    // For extra safety, use the line below, comment the line above and pass the API key as an environment variable:
    // apiKey: process.env['OPENAI_API_KEY']
});

// Function to get user input from the command line
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestionFromUser (query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Function to handle user input and generate AI response
async function chatloop(messages) {
    const userInput = await askQuestionFromUser('You: ');

    // Magic starts here where we start creating the structured array that holds all conversation
    messages.push({ role: 'user', content: userInput });

    // Use the openai SDK to now send the message history with every call and get response
    const stream = await openai.beta.chat.completions.stream({
        model: 'gpt-4',
        // We ensure that the entire message history array's first item is a special
        // system prompt.
        messages: [{ role: 'system', content: 'You are Muppy, a CLI chatbot.' }, 
            ...messages],
    stream: true,
  });

  let aiResponse = '';

  // Attach stream functions to handle AI response
  stream
    .on('content', (delta, snapshot) => {
      process.stdout.write(delta);
      aiResponse += delta;
    })
    .on('end', () => {
      // Add AI's response to the message history
      messages.push({ role: 'assistant', content: aiResponse });
      console.log('\n');
      // Recurse to continue the conversation
      chatloop(messages);
    });
}

// Start the conversation loop
function main() {
  const messages = [];
  console.log("Start chatting with the AI. Press Ctrl+C to stop.");
  chatloop(messages);
}

// Invoke main function
main();
```
