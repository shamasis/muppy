#!/usr/bin/env node

/**
 * Simple Node.js Chatbot using OpenAI API. We are calling this Muppy!
 * 
 * 
 * Note: Keep your API key secure and avoid sharing it publicly.
 * 
 * If should pass the API key as an environment variable:
 *   > export OPENAI_API_KEY=<your-api-key>
 *   > muppy
 * 
 * To exit the conversation, press ESC or Ctrl+C.
 */

const OpenAI = require('openai'),
  prompts = require('prompts'),
  colors = require('colors/safe');


// this function is used to setup OpenAI JS SDK.
async function setup (apiKey) {
  // check presence of Open AI API Key in environement. if not, gather from CLI
  if (!apiKey) {
    console.log (
      'You need a valid OpenAI API Key to use muppy. Get yours from\n' +
      colors.underline('https://platform.openai.com/api-keys') + '\n\n' +

      colors.dim('Muppy does not save or log your API Key. To help Muppy find and use ' +
      'your saved API Keys, save the API key in your environment variable as ' +
      colors.bold('OPENAI_API_KEY') + '. You can set environment varable ' +
      'using the command export OPENAI_API_KEY="your-api-key" ' + 
      '(or setx OPENAI_API_KEY "your-api-key" on Windows.)\n')
    );

    const response = await prompts({
      type: 'password',
      name: 'apiKey',
      message: 'Enter OpenAI API Key',
      description: 'aaa'
    }, { onCancel: () => process.exit(0) });

    apiKey = response.apiKey;
    console.log('\n');
  }

  return new OpenAI({ // Initialize OpenAI with API key
    apiKey: apiKey
  });
}

// Function to handle user input and generate AI response
async function chatloop (messages, openai) {
  const response = await prompts({
    type: 'text',
    name: 'input',
    message: 'You:'
  }, { onCancel: () => process.exit(0) });

  // Add user's input to the message history
  messages.push({ role: 'user', content: response.input });

  // Open a stream with OpenAI
  const stream = await openai.beta.chat.completions.stream({
    model: 'gpt-4',
    // add a system prompt letting the llm know it is a CLI chatbot
    messages: [{ role: 'system', content: 'You are Muppy, a CLI chatbot.' }, ...messages],
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
      chatloop(messages, openai);
    });
}

// Start the conversation loop
async function main () {
  // For extra safety, pass the API key as an environment variable
  const openai = await setup(process.env['OPENAI_API_KEY']),
    messages = [];

  console.log(`Start chatting with the AI. ${colors.dim("Press ESC or Ctrl+C to stop.")}\n`);
  chatloop(messages, openai);
}

// Invoke main function
main();