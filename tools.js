const tools = [{
  type: "function",
  description: "This tool returns the current date and time as `Day Mon DD YYYY HH:mm:ss GMT+XXXX (Time Zone)`",
  function: {
    function: getCurrentDateTime
  }
}, {
  type: "function",
  description: "This tool exits the current chat process after showing a message.",
  function: {
    function: exitCurrentChatProcess,
    parse: JSON.parse,
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to be displayed before exiting the process"
        }
      },
      required: ["message"]
    }
  }
}, {
  type: "function",
  description: "This tool fetches a response from a given URL and returns the status code and response body as text.",
  function: {
    function: fetchResponseFromURL,
    parse: JSON.parse,
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to fetch the response from"
        }
      },
      required: ["url"]
    }
  }
}, {
  type: "function",
  description: "This tool writes a provided string to the clipboard.",
  function: {
    function: writeToClipboard,
    parse: JSON.parse,
    parameters: {
      type: "object",
      properties: {
        data: {
          type: "string",
          description: "The data string to be written to the clipboard"
        }
      },
      required: ["data"]
    }
  }
}, {
  type: "function",
  description: "This tool reads and returns the current content from the clipboard.",
  function: {
    function: readFromClipboard,
  }
}];


// Function to get the current date and time
async function getCurrentDateTime() {
  return (new Date()).toString();
}

// Function to exit the current chat process
function exitCurrentChatProcess(args = {}) {
  console.log(args.message); // Show this message before exiting process
  return process.exit(0);
}

// Function to fetch a response from a given URL
async function fetchResponseFromURL(args = {}) {
  const response = await (await import("node-fetch")).default(args.url);

  return {
    statusCode: response.status,
    responseBodyText: await response.text()
  };
}

async function writeToClipboard(arg = {}) {
  const clipboard = (await import('clipboardy')).default;
  return await clipboard.write(arg.data)
}

async function readFromClipboard() {
  const clipboard = (await import('clipboardy')).default;
  return await clipboard.read()
}

module.exports = tools;