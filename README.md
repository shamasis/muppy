![image](https://github.com/shamasis/muppy/assets/232373/44671224-0704-4ca4-8346-a21aca45f846)

# muppy

Simple Node.js Chatbot using OpenAI API. We are calling this Muppy!

Just `npm install muppy -g` and then `> muppy` away on your terminal!

> Get your OpenAI API Key from 
> [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
> and save it in your terminal environment using `export OPENAI_API_KEY=<your-api-key>`

Take a look at the code if you want to get started working with OpenAI API
➜ [index.js](index.js)

# The Code

OpenAI REST API's wrapper SDK does a fairly good job to provide all that is needed
to get started.

It operates around a `stream` object that accepts an array of conversations that
needs to be tracked and maintained by the consumer (you.)

The array of conversations look like:

```js
[
    { role: 'user', content: 'conversation 1' },
    { role: 'assistant', content: 'llm response to conversation 1' }
    { role: 'user', content: 'conversation 2' },
    { role: 'assistant', content: 'llm response to conversation 2' }
];
```

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

```js
let accumulateStreamingResponse = '';

stream
    .on('content', (delta) => {
        process.stdout.write(delta);
        accumulateStreamingResponse += delta;
    })

    .on('end', () => {
        let response = { role: 'assistant', content: accumulateStreamingResponse };
        // for next conversation append this object to the array of message and then
        // append the next user conversation
});
```