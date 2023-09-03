# MathWay API

An unofficial API package for [MathWay](https://www.mathway.com)
# Documentation
To use the package import it using `require` keyword:
```javascript
const mathway = require("mathway-api");
```
### function `submit`
Submit an expression to MathWay and return the response. Arguments:
- `expression` - Expression to submit (in LaTeX format)
- `subject` - Answers subject (See all subjects list below)
- `language` - Optional, 2-letter code of answers language (See supported languages list below)

Return value is a `MessagesResponse` or `TopicsResponse` object

Example:
```javascript
mathway.submit('\\sqrt(16) + x = 5', 'algebra', 'en').then(answer => {
    if (answer.type === `topicsResponse`) { // Checking if the answer is TopicsResponse
        answer.topics[0].getResult().then(result => { // Getting MessagesResponse by the first topic
            console.log(result.messages[0].content); // Log content of the first message
        });
    }
});
```
### function `getTopicResult`
Get an MessagesResponse result for given topic manually. Arguments:
- `expression` - Expression to submit (in LaTeX format)
- `subject` - Answers subject (See all subjects list below)
- `topicId` - ID of the topic
- `language` - Optional, 2-letter code of answers language (See supported languages list below)

Return value is a `MessagesResponse` object

Example:
```javascript
const topicId = 1; // ID of the "Solve for x" topic
const answer = await mathway.getTopicResult('x + 1 = 2', 'algebra', topicId);
```

### function `greet`
Sends greeting request to MathWay. Arguments:
- `subject` - Answers subject (See all subjects list below)
- `language` - Optional, 2-letter code of answers language (See supported languages list below)

Return value is a `MessagesResponse` object

Example:
```javascript
console.log((await mathway.greet('precalculus', 'es')).messages[0].content);
// Output is: ¿Cómo puedo ayudarte?
```

### object `MessagesResponse`
- `type` - always `"messagesResponse"`
- `messages` - Array of `Message`. Messages related to the provided request

### object `TopicsResponse`
- `type` - always `"topicsResponse"`
- `topics` - Array of `Topic`. Array of suggested topics

### object `Message`
- `content` - String.  Content of the message (with HTML tags)
- `genre` - Genre/Type of the message
    - `mathway` - Solving of the expression
    - `message` - Self-promotion and other messages not related to the expression
    - `autoresolve` - `"Not the answer you were looking for?"` message
    - `greeting` - Greeting messages
    - `rating` - Messages asking to rate the solution
- `timestamp` - Message timestamp

### object `Topic`
- `id` - Number. Unique ID of the topic.
- `score` - Number. Number between 0 and 1. Probability that this topic was meant.
- `text` - String. Topic text.
- function `getResult` - shorthand for `getTopicResult` call with current topic. Just use `getResult()` instead of `getTopicResult(expression, subject, topicId, language)`.

### Supported subjects
- `BasicMath`
- `prealgebra`
- `algebra`
- `trigonometry`
- `precalculus`
- `calculus`
- `statistics`
- `finitemath`
- `linearalgebra`
- `chemistry`
- `physics`


### Supported languages
|  Language  | 2-letter code |
|------------|---------------|
| English    |      en       |
| Arabic     |      ar       |
| Chinese    |      zh       |
| French     |      fr       |
| German     |      de       |
| Hindi      |      hi       |
| Indonesian |      id       |
| Italian    |      it       |
| Japanese   |      ja       |
| Korean     |      ko       |
| Portuguese |      pt       |
| Russian    |      ru       |
| Spanish    |      es       |
| Vietnamese |      vi       |

All others will not work and the answers will be in English
