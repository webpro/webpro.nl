---
draft: true
published: 2023-04-29
---

# Using OpenAI with JavaScript

When trying to find my way around in the hyped lands of OpenAI and vector
databases, the dots were not always easy to connect. In this guide I'm sharing
what I've learned during my journey to make yours even better.

Most of OpenAI tooling and examples is based on Python, but this guide uses
JavaScript exclusively.

We'll begin with a brief explanation of some core concepts, before diving into
more and more code. We'll finish with token management and other tweaks.

## Overview

Here are the topics we will be discussing:

- [OpenAI endpoints][1]
- [Key Concepts][2]
- [Ingestion][3]
- [Query][4]
- [User Interface][5]
- [Conversation][6]
- [Tokens][7]
- [Parameters][8]
- [Markdown & Code Blocks][9]

## OpenAI endpoints

In this guide, we will work with two OpenAI REST endpoints.

### Chat Completions

    POST https://api.openai.com/v1/chat/completions

The [Create chat completion][10] endpoint generates a human-like text completion
for a provided prompt. We'll use it to start and keep the conversation going
between the end-user and OpenAI's Large Language Models (LLMs) such as GPT-3.5
and GPT-4.

### Create Embeddings

    POST https://api.openai.com/v1/embeddings

With the [embeddings][11] endpoint, we can create embeddings from plain text. We
will use these embeddings to store and query a vector database. Embeddings?
Vector database? No worries, we have you covered.

### The `openai` package

We're going to use these endpoints directly, and not [OpenAI's npm package][12].
This package targets Node.js, but eventually you might want to deploy your
application on an environment without Node.js, such as an Cloudlare Workers,
Deno, or any other edge provider. Now that `fetch` is ubiquitous I think the
REST APIs are just as easy to use without any dependencies. I also find being
"closer to the metal" is more flexible.

## Key Concepts

We've already introduced a few concepts that may be new to you. Let's discuss
[embeddings][13], [vector databases][14] and [prompts][15] briefly before diving
into any code.

If you're familiar with these terms, feel free to skip straight to
[ingestion][3].

### Embeddings

Vector embeddings are numerical representations of textual data in a
high-dimensional space. They are generated using large language models (LLMs).
Embeddings allow for efficient storage and search of content that is
semantically related to a user's query. By mapping semantically similar text
close together in the vector space, we can identify relevant content based on
user input.

For comparison, a lexical or "full text" search looks for literal matches of the
query words and phrases, without understanding the overall meaning of the query.

### Vector databases

Why do we need a vector database? Can't we just query OpenAI and get a response?

Yes, we can use the [ChatGPT UI][16] or even the OpenAI chat completions
endpoint directly. However, the response will be limited to what the OpenAI
models are trained on. The response may not be up-to-date, accurate, or specific
enough for your needs.

What if you want to have OpenAI generate responses based solely on your own
domain-specific content? For users to "chat with your content". Sounds
interesting! But how to go about this?

Unlike ChatGPT, the OpenAI APIs are not storing any of your content and they do
not store state or a session of the conversation(s). This is where vector
databases come in. Adding a vector database in the mix has interesting
advantages:

- Store and maintain domain-specific knowledge.
- Support semantic search across your content.
- Control your own data and keep it up-to-date and relevant.
- Reduce the number of calls to OpenAI.
- Store the user's conversational history.

Setting up a vector database might be easier than you think. I've been trying
out [Pinecone][17] and [Supabase][18] without any issues. There are more options
though, and I don't feel like I'm in a position to recommend one over another.

### Prompts

A prompt is the textual input we send to the chat completions endpoint to have
it generate a relevant "completion". You could say a prompt is a question, and a
completion is an answer.

Prompts are plain text and we can provide extra details and information to
improve the results. The more context we provide, the better the response will
be.

Requests to the chat completions endpoint are essentially stateless: not your
content, no session, no state. The challenge is to optimize and include the
right information with each request. We'll be discussing prompts throughout this
guide, and ways to optimize them.

## Ingestion

Armed with this knowledge, let's begin building a chat application with a
[vector database][14].

First of all, we need to get content into this database. Content is stored as
vector embeddings, and we can create those from textual content by using the
[embeddings endpoint][19].

### Metadata

Before creating the database and the index, it's important to consider what we
will do with the results of semantic search queries.

Vector embeddings are a compressed representation of semantics for efficient
storage and querying. It's not possible to translate them back to the original
text. This is the reason we need to store the original text along with the
embeddings in the database.

The text can be stored as metadata and can include more useful things to display
in the application, such as document or section titles and URL's to link back to
the original source.

### Tools

There are tools that can help with all of this. Yet I've only seen
[Markprompt][20] as a user-friendly solution for this. Do you know of any
others?

### 7-docs

As I prefer command-line tools and wanted to learn more about the OpenAI APIs
and embeddings, I decided to develop a tool myself.

This work ended up as [7-docs][21] and comes with the `7d` command-line tool to
ingest content from plain text, Markdown and PDF files into a vector database.
It ingests content from local files, GitHub repositories and also HTML from
public websites. Currently it supports "upserting" vectors into Pinecone indexes
and Supabase tables.

Installation can be done per project, or globally:

```shell
npm install 7-docs --global
```

To get an idea what ingestion using `7d` looks like, here are some examples that
ingest Markdown files:

```shell
7d ingest --files '*.md' --namespace my-collection
```

```shell
7d ingest --source github
  --repo reactjs/react.dev \
  --files 'src/content/reference/react/*.md' \
  --namespace react
```

## Query

When the embeddings and metadata are in the database, we can query it. We'll
look at some example code to implement this 4-step strategy:

1.  Create a vector embedding from the user's textual input.
2.  Query the database with this vector for related chunks of content.
3.  Build the prompt from the search results and the user's input.
4.  Request the model to generate a response based on this prompt.

The examples show working code, but contain no error handling or optimizations.
Just plain JavaScript without dependencies.

_(Don't want to implement this yourself, or just want to see examples? Visit
[7-docs][22] for available demos and starterkits to hit the ground running.)_

### 1. Create a vector embedding

The first function we'll need creates a vector embedding based on the user's
input:

```js
export const createEmbeddings = async ({ token, model, input }) => {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    body: JSON.stringify({ input, model }),
  });

  const { error, data, usage } = await response.json();

  return data;
};
```

This function can be called like this:

```js
const vector = await createEmbeddings({
  token: '[OPENAI_API_TOKEN]',
  model: 'text-embedding-ada-002',
  input: 'What is an embedding?',
});
```

### 2. Query the database

In the second step we are going to query the database with the `vector` we just
created. Each database has its own API to query it. Here's an example using
Pinecone:

```js
export const query = async ({ token, vector, namespace }) => {
  const response = await fetch('https://[my-index].pinecone.io/query', {
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': token,
    },
    method: 'POST',
    body: JSON.stringify({
      vector,
      namespace,
      topK: 10,
      includeMetadata: true,
    }),
  });

  const data = await response.json();
  return data.matches.map(match => match.metadata);
};
```

This `query` function can be invoked with the `vector` we received from
`createEmbeddings()` like so:

```js
const metadata = await query({
  token: '[PINECONE_API_KEY]',
  vector: vector, //  Here's the vector we received from `createEmbeddings()`
  namespace: 'my-knowledge-base',
});
```

### 3. Build the prompt

The third step builds the prompt. There are multiple ways to go about this and
the content of the template probably requires customization on your end, but
here is an example:

```js
const template = `Answer the question as truthfully and accurately as possible using the provided context.
If the answer is not contained within the text below, say "Sorry, I don't have that information.".

Context: {CONTEXT}

Question: {QUERY}

Answer: `;

const getPrompt = (context, query) => {
  return template.replace('{CONTEXT}', context).replace('{QUERY}', query);
};
```

And here is how we can create the prompt with context from the `metadata`
returned from the database query:

```js
// Create a concatenated string from search results metadata
const context = metadata.map(metadata => metadata.content).join(' ');

// Build the complete prompt including the context and the question
const prompt = getPrompt(context, 'What is an embedding?');
```

Later in this guide, we will also look at example code to [build a
conversation][6] instead of only asking a one-shot question.

### 4. Query the model

We are ready for the last step: call the model with our prompt. Here's an
example function to call the chat completions endpoint:

```js
export const chatCompletions = async ({ token, body }) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response;
};
```

And here's how to make the request with the prompt:

```js
const messages = [];
messages.push({
  role: 'user',
  content: prompt, // This is the `prompt` we received from `getPrompt()`
});

const response = await chatCompletions({
  token: '[OPENAI_API_TOKEN]',
  model: 'gpt-3.5-turbo',
  messages,
});

const data = await response.json();
const text = data.choices[0].message.content;
```

The `text` contains the human-readable answer from OpenAI.

Great, this is the crux of generating chat completions based on your own vector
database. Now, how to put these 4 steps together and use them in a user
interface? You can implement a function that abstracts this behind a function.
Or use the [@7-docs/edge][22] package that does this for you. Keep reading to
see an example.

In the next part of this guide we will look at a UI component with a basic form
for users to enter a query. This component will also render the streaming
response coming from the [function][23] in the next section.

## User Interface

Let's put our 4-step strategy into action and build [function][23] and
[form][24].

_(Don't want to implement this yourself, or just want to see examples? Visit
[7-docs][22] for available demos and starterkits to hit the ground running.)_

### Function

The `/api/completion` endpoint will listen to incoming requests and respond
using all of the query logic from the previous section.

We're going use the `@7-docs/edge` package, which abstracts away the 4-step
strategy and some boring boilerplate. We need to pass the `OPENAI_API_KEY` and a
`query` function from a database adapter (Supabase in this case).

Bring this together in an API function in only a few lines of code:

```js
import { getCompletionHandler, supabase } from '@7-docs/edge';
import { createClient } from '@supabase/supabase-js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const namespace = 'my-knowledge-base';

const client = createClient(SUPABASE_URL, SUPABASE_API_KEY);
const query = vector => supabase.query({ client, namespace, vector });

export default getCompletionHandler({ OPENAI_API_KEY, query });
```

This can run anywhere, in any API endpoint or edge function.

### Form

Now we still need a UI component to render an input field, send the input to the
`/api/completion` endpoint, and render the streaming response.

This minimal example uses a little React and JSX for an easy read, but it could
just as well be plain JavaScript or any other framework.

```jsx
import { useState } from 'react';

export default function Page() {
  const [query, setQuery] = useState('');
  const [outputStream, setOutputStream] = useState('');

  function startStream(query) {
    const searchParams = new URLSearchParams();
    searchParams.set('query', encodeURIComponent(query));
    searchParams.set('embedding_model', 'text-embedding-ada-002');
    searchParams.set('completion_model', 'gpt-3.5-turbo');
    const url = '/api/completion?' + searchParams.toString();

    const source = new EventSource(url);
    source.addEventListener('message', event => {
      if (event.data.trim() === '[DONE]') {
        source.close();
      } else {
        const data = JSON.parse(event.data);
        const text = data.choices[0].delta.content;
        if (text) setOutputStream(v => v + text);
      }
    });
  }

  const onSubmit = event => {
    if (event) event.preventDefault();
    startStream(query);
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <input type="submit" value="Send" />
      </form>

      <div>{outputStream}</div>
    </>
  );
}
```

Now all the components in a "chat with your content" have come together:

- Ingest content as vector embeddings into a database
- Create a function to query the content using the 4-step strategy
- Build a UI to accept user input and render a streaming response

The following sections will build on to make everything even more interesting!

## Conversation

To start a chat, we've seen how to [build a basic prompt][25]. This is good
enough for one-shot questions, but we need more to build a meaningful
conversation. The chat completions endpoint accepts an array of messages, so a
pattern to fill this array could look like this:

1.  Add a `system` message that explains the model (i.e. the `assistant`) how to
    behave and respond.
2.  Add the conversation history with `user` and `assistant` messages.
3.  Add the `user` prompt, containing the context and the query.

Here is an example building on the initial [prompt example][25] that extends the
`messages` array to build the conversation:

```js
const system = `Answer the question as truthfully as possible using the provided context.
If the answer is not contained within the text below, say "Sorry, I don't have that information.".`;

// In a real application, the conversation `history` can be sent with every request from the client,
// or by using some kind of storage.
const history = [
  ['What is an embedding?', 'An embedding is...'],
  ['Can you give an example?', 'Here is an example...'],
];

const prompt = getPrompt(context, 'Can I restore the original text?');

const messages = [];

messages.push({
  role: 'system',
  content: system,
});

history.forEach(([question, answer]) => {
  messages.push({
    role: 'user',
    content: question,
  });

  messages.push({
    role: 'assistant',
    content: answer,
  });
});

messages.push({
  role: 'user',
  content: prompt,
});

const response = await chatCompletions({
  token: '[OPENAI_API_TOKEN]',
  model: 'gpt-3.5-turbo',
  messages,
});
```

The actual `history` can come from the client. For instance, this could be
stored in UI component state, or browser session storage. In that case, it will
need to be sent with every request to the [function][23]. Other ways of storing
and retrieving the conversation history is outside the scope of this guide.

## Tokens

Tokens (not characters) are the unit used by OpenAI for limits and usage. There
are limits to the number of tokens that can be sent to and received from the API
endpoints with each request.

### Embeddings

The maximum number of input tokens to create embeddings with the
`text-embedding-ada-002` model is 8191.

The price is `$ 0.0004` per 1k tokens, which comes down to a maximum of
`$ 0.0032` per request when sending 8k tokens. That's roughly 6.000 words that
can be sent at once to create vector embeddings.

### Chat completions

For the chat completions endpoint, the `max_tokens` value represents the number
of tokens the model is allowed to use when generating the completion. The models
have their own limit (context length) and pricing:

| Model         | Context Length | $/1k prompt | $/1k completion |
| :------------ | -------------: | ----------: | --------------: |
| gpt-3.5-turbo |          4.096 |     $ 0.002 |         $ 0.002 |
| gpt-4         |          8.192 |      $ 0.03 |          $ 0.06 |
| gpt-4-32k     |         32.768 |      $ 0.06 |          $ 0.12 |

The sum of the tokens for the prompt plus the `max_tokens` for completion cannot
exceed the model's context length. For `gpt-3.5-turbo` this means:

    num_tokens(prompt) + max_tokens <= 4096

To see what this means in practice, we'll discuss tokenization first and then
look at an example calculation.

### Tokenization

The number of tokens for a given text can be calculated using a tokenizer (such
as [GPT-3-Encoder][26]). Tokenization can be slow on larger chunks, and npm
packages for Node.js may not work in other environments such as the browser or
Deno.

The alternative is to make an estimate: use 4 characters per token or 0.75 words
per token. That's 75 words per 100 tokens. This is a very rough estimate for the
English language and varies per language. You should probably also add a small
safety margin to stay within the limits and prevent erors.

OpenAI provides an online [Tokenizer][27]. For Python there's [tiktoken][28].

### Example

Let's say you're using the `gpt-3.5-turbo` model. If you want to preserve 25%
for the completion, use `max_tokens: 1024`. The rest of the model's context can
be occupied by the prompt. That's `3072` tokens (`4096-1024`), which comes down
to an estimated 2304 words (`3072*0.75`) or 12.288 characters (`3072*4`).

The length of the prompt is the combined length of all `content` in the
`messages` (i.e. the combined messages of the `system`, `user` and `assistant`
roles in [Conversation][6]).

If the prompt has the maximum length and the model would use all completion
tokens, using `4096` tokens would cost $ 0.008 (`4*$0.002`).

Using the `gpt-4` model, the same roundtrip would cost $ 0.15 (`3*$0.03` for the
prompt + `1*$0.06` for the completion).

### Strategies

To optimize for your end-user, you'll need to find the right balance between
input (prompt) and output (completion).

When adding context and conversation history to the chat completion request it
may become a challenge to keep everything within the model's limit. More context
and more conversation history (input) means less room for the completion
(output).

There are various ways to mitigate this. You can think of keeping a certain
maximum number of messages from the conversation history and/or truncating or
leaving out previous answers from the assistant.

Another idea is to send some sort of summary of the conversation history, but
that would likely require additional effort.

Some form of "compression" could work in certain cases. An example using GPT-4
can be found at [gpt4_compression.md][29].

Another thing to consider is the amount of context to send with the prompt. This
context comes from the semantic search results when querying the vector
database. You may want to create smaller vector embeddings during ingestion to
eventually have more options and wiggle room when building the context for the
chat completion. On the other hand, including smaller but more varied pieces of
context may result in less "focused" completions.

Overall, I think what matters most is to not lose the first and last question
throughout the conversation. Keep in mind that the model does not store state or
session.

### Usage

When using OpenAI endpoints, the token `usage` for the request is included in
the response (with separate `prompt_tokens` and `completion_tokens`).
Unfortunately, `usage` is not included for streaming chat completion responses
(`stream: true`).

## Parameters

### Temperature

The `temperature` parameter is a number between 0 and 2. A low number like `0.2`
makes the output more focused and deterministic. You want this when the output
should be generated based on the context we send in the prompt. A higher value
like `0.8` makes the output more random.

## Markdown & Code Blocks

If you ingest Markdown content, you likely also want the completion to include
Markdown and code blocks when relevant. Here's a list of things to remember
during ingestion and building the client application:

### Ingestion

- Don't strip out code blocks from the Markdown during ingestion.
- Try to prevent splitting text in the middle of code blocks.

### Client

- Include something like "Use Markdown" and "Try to include a code example in
  language-specific fenced code blocks" in the prompt, ideally in the `system`
  message.
- Use a Markdown renderer (e.g. [react-markdown][30]).
- Use a syntax highlighter (e.g. [react-syntax-highlighter][31]).

[1]: #openai-endpoints
[2]: #key-concepts
[3]: #ingestion
[4]: #query
[5]: #user-interface
[6]: #conversation
[7]: #tokens
[8]: #parameters
[9]: #markdown--code-blocks
[10]: https://platform.openai.com/docs/api-reference/chat/create
[11]: https://platform.openai.com/docs/api-reference/embeddings
[12]: https://www.npmjs.com/package/openai
[13]: #embeddings
[14]: #vector-databases
[15]: #prompts
[16]: https://chat.openai.com
[17]: https://www.pinecone.io
[18]: https://supabase.com
[19]: #create-embeddings
[20]: https://markprompt.com
[21]: https://github.com/7-docs/7-docs
[22]: https://www.npmjs.com/package/@7-docs/edge
[23]: #function
[24]: #form
[25]: #3-build-the-prompt
[26]: https://github.com/latitudegames/GPT-3-Encoder
[27]: https://platform.openai.com/tokenizer
[28]: https://github.com/openai/tiktoken
[29]: https://github.com/itamargol/openai/blob/main/gpt4_compression.md
[30]: https://github.com/remarkjs/react-markdown
[31]: https://github.com/react-syntax-highlighter/react-syntax-highlighter
