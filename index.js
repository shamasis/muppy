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
  colors = require('colors/safe'),

  templates = require('./templates'),
  tools = require('./tools');

/**
 * This function is used to setup OpenAI JS SDK.
 * 
 * @param {?string} apiKey Provide API key to use for setup. This is optional as
 *        the function fetches the API key from environment variables and shows
 *        a proper help and bailout information if one is not provided.
 */
async function setup (apiKey = process.env['OPENAI_API_KEY']) {
  // check presence of Open AI API Key in environement. if not, gather from CLI
  if (!apiKey) {
    console.log (
      'You need a valid OpenAI API Key to use muppy. Get yours from ' +
      colors.underline('https://platform.openai.com/api-keys') + '\n\n' +

      colors.dim('Muppy does not save or log your API Key. To help Muppy find and use ' +
      'your saved API Keys, save the API key in your environment variable as ' +
      colors.bold('OPENAI_API_KEY') + '. You can set environment varable ' +
      'using the command export OPENAI_API_KEY="your-api-key" ' + 
      '(or setx OPENAI_API_KEY "your-api-key" on Windows.)\n\n' +

      colors.dim('Muppy does not store your API keys.')
      )
    );

    const response = await prompts({
      type: 'password',
      name: 'apiKey',
      message: 'Enter OpenAI API Key',
    }, { onCancel: () => process.exit(0) });

    apiKey = response.apiKey;
    console.log('\n');
  }

  return new OpenAI({ // Initialize OpenAI with API key
    apiKey: apiKey
  });
};

/**
 * Function to handle user input and generate AI response. This function 
 * continues to work in a loop
 * 
 * @param {OpenAI} openai expects an instance of OpenAI class instance.
 * @param {Object} tools
 * @param {Object} templates
 */
async function chatloop (openai, tools, templates, messages = []) {
  // Get input from user
  const response = await prompts({
    type: 'text',
    name: 'input',
    message: 'You:'
  }, { onCancel: () => process.exit(0) });

  // Add user's input to the message history
  messages.push({ role: 'user', content: response.input + 
    '\n\nPS: You may use your tools to see if it helps.' });

  // Open a stream with OpenAI
  const stream = await openai.beta.chat.completions.runTools({
    model: 'gpt-4o',
    // add a system prompt letting the llm know it is a CLI chatbot
    messages: [{ role: 'system', content: templates.systemBase }, 
      ...messages],
    tools: tools,
    stream: true
  });

  let aiResponse = ''; // accumulator for streaming AI response

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

      // ** RECURSION POINT **
      chatloop(openai, tools, templates, messages);
    });
}

// Start the conversation loop
(async function main () {
  // For extra safety, pass the API key as an environment variable
  const openai = await setup(),
    messages = [];

  console.log(`Start chatting with the AI. ${colors.dim("Press ESC or Ctrl+C to stop.")}\n`);
  chatloop(openai, tools, templates);
})();