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

const OpenAI = require('openai');
const prompts = require('prompts');

// Initialize OpenAI with API key
const openai = new OpenAI({
  // For extra safety, use the line below and pass the API key as an environment variable
  apiKey: process.env['OPENAI_API_KEY']
});

// Function to handle user input and generate AI response
async function chatloop (messages) {
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
    messages: messages,
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
function main () {
  const messages = [];
  console.log("Start chatting with the AI. Press ESC or Ctrl+C to stop.");
  chatloop(messages);
}

// Invoke main function
main();