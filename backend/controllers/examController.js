const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const EXAM_QUESTIONS = {
  'React': {
    level: 'intermediate', questions: [
      { q: 'What is JSX in React?', options: ['A JavaScript XML syntax extension', 'A CSS framework', 'A database query language', 'A testing library'], answer: 0 },
      { q: 'Which hook is used to manage state in functional components?', options: ['useEffect', 'useState', 'useContext', 'useRef'], answer: 1 },
      { q: 'What does useEffect hook do?', options: ['Manages state', 'Handles side effects', 'Creates context', 'Renders components'], answer: 1 },
      { q: 'What is the virtual DOM?', options: ['A copy of real DOM in memory', 'A database', 'A CSS selector', 'A server'], answer: 0 },
      { q: 'How do you pass data from parent to child in React?', options: ['State', 'Props', 'Context', 'Redux'], answer: 1 },
      { q: 'What is the purpose of key prop in lists?', options: ['Styling elements', 'Unique identification for reconciliation', 'Event handling', 'Data fetching'], answer: 1 },
      { q: 'Which method is called after component mounts?', options: ['componentWillMount', 'componentDidMount', 'componentWillUpdate', 'componentDidUpdate'], answer: 1 },
      { q: 'What is React.memo used for?', options: ['Memory management', 'Memoizing components to prevent re-renders', 'Creating memos', 'State management'], answer: 1 },
      { q: 'What is the Context API used for?', options: ['HTTP requests', 'Global state management', 'Styling', 'Routing'], answer: 1 },
      { q: 'What does the spread operator do in React props?', options: ['Deletes props', 'Passes all properties of an object as props', 'Creates new components', 'Handles events'], answer: 1 },
      { q: 'What is a controlled component?', options: ['Component controlled by CSS', 'Form element controlled by React state', 'Component with no props', 'Server-side component'], answer: 1 },
      { q: 'What is React Router used for?', options: ['State management', 'Navigation between pages', 'API calls', 'Testing'], answer: 1 },
      { q: 'Which hook replaces componentDidMount and componentWillUnmount?', options: ['useState', 'useContext', 'useEffect', 'useReducer'], answer: 2 },
      { q: 'What is prop drilling?', options: ['Creating props', 'Passing props through multiple components', 'Deleting props', 'Testing props'], answer: 1 },
      { q: 'What is the purpose of useCallback?', options: ['Fetching data', 'Memoizing callback functions', 'Managing state', 'Routing'], answer: 1 },
      { q: 'What does ReactDOM.render() do?', options: ['Creates a component', 'Renders React element into DOM', 'Fetches data', 'Handles routing'], answer: 1 },
      { q: 'What is a Higher Order Component (HOC)?', options: ['A component with many props', 'A function that takes and returns a component', 'A class component', 'A styled component'], answer: 1 },
      { q: 'What is Lazy loading in React?', options: ['Slow loading', 'Loading components only when needed', 'Loading CSS', 'Preloading all data'], answer: 1 },
      { q: 'What is the difference between state and props?', options: ['No difference', 'State is internal, props are external', 'Props are internal, state is external', 'Both are the same'], answer: 1 },
      { q: 'Which of these is NOT a React lifecycle method?', options: ['componentDidMount', 'componentWillUnmount', 'componentDidRender', 'componentDidUpdate'], answer: 2 },
      { q: 'What is Reconciliation in React?', options: ['Error handling', 'Process of updating DOM efficiently', 'State management', 'Data fetching'], answer: 1 },
      { q: 'What does useMemo do?', options: ['Manages memory', 'Memoizes computed values', 'Creates memos', 'Handles API calls'], answer: 1 },
      { q: 'What is the Fragment in React?', options: ['A broken component', 'A way to group elements without adding DOM nodes', 'A CSS class', 'A hook'], answer: 1 },
      { q: 'What is StrictMode in React?', options: ['A CSS strict mode', 'A tool for highlighting potential problems', 'A testing framework', 'A production mode'], answer: 1 },
      { q: 'How do you handle forms in React?', options: ['Only with libraries', 'Using controlled or uncontrolled components', 'Only with Redux', 'Using jQuery'], answer: 1 },
      { q: 'What is the purpose of useRef?', options: ['State management', 'Accessing DOM elements and persisting values', 'Routing', 'Context'], answer: 1 },
      { q: 'What is code splitting in React?', options: ['Dividing CSS', 'Breaking app into smaller chunks loaded on demand', 'Splitting components', 'Dividing state'], answer: 1 },
      { q: 'What is React Suspense?', options: ['Pausing execution', 'Handling async loading states', 'Error boundaries', 'Testing'], answer: 1 },
      { q: 'What are Error Boundaries in React?', options: ['CSS borders', 'Components that catch JavaScript errors', 'Testing utilities', 'API handlers'], answer: 1 },
      { q: 'What is the default behavior of React rendering?', options: ['Only renders once', 'Re-renders when state or props change', 'Never re-renders', 'Renders every second'], answer: 1 },
      { q: 'What is Redux used with React?', options: ['Routing', 'Predictable state management', 'Testing', 'Styling'], answer: 1 },
      { q: 'What does the useReducer hook do?', options: ['Reduces bundle size', 'Manages complex state logic', 'Reduces re-renders', 'Compresses data'], answer: 1 },
      { q: 'What is server-side rendering in React?', options: ['Rendering on client only', 'Rendering HTML on server before sending to client', 'Rendering in database', 'Rendering in mobile'], answer: 1 },
      { q: 'What is React Native?', options: ['A CSS framework', 'React for building mobile apps', 'A testing tool', 'A backend framework'], answer: 1 },
      { q: 'What is the purpose of defaultProps?', options: ['Setting default CSS', 'Providing default values for props', 'Creating default state', 'Default routing'], answer: 1 },
      { q: 'What does batching mean in React 18?', options: ['Grouping API calls', 'Grouping multiple state updates into single re-render', 'Batch processing data', 'Grouping components'], answer: 1 },
      { q: 'What is the purpose of forwardRef?', options: ['Forwarding emails', 'Passing refs through components', 'Forwarding props', 'Routing'], answer: 1 },
      { q: 'What is React Fiber?', options: ['A CSS framework', 'React\'s reconciliation engine', 'A testing tool', 'A state manager'], answer: 1 },
      { q: 'How do you optimize React performance?', options: ['Only use class components', 'Use memo, useCallback, lazy loading, code splitting', 'Avoid using hooks', 'Use jQuery instead'], answer: 1 },
      { q: 'What is React DevTools used for?', options: ['Writing code', 'Debugging and profiling React apps', 'Deploying apps', 'Testing APIs'], answer: 1 },
    ]
  },
  'Node.js': {
    level: 'intermediate', questions: [
      { q: 'What is Node.js?', options: ['A browser', 'A JavaScript runtime built on Chrome V8 engine', 'A database', 'A CSS framework'], answer: 1 },
      { q: 'What is npm?', options: ['Node Package Manager', 'Node Program Manager', 'New Package Module', 'None'], answer: 0 },
      { q: 'What is the event loop in Node.js?', options: ['A loop for events', 'Mechanism for handling async operations', 'A CSS animation', 'A database loop'], answer: 1 },
      { q: 'What is Express.js?', options: ['A database', 'A minimal web framework for Node.js', 'A testing tool', 'A frontend framework'], answer: 1 },
      { q: 'What is middleware in Express?', options: ['Database layer', 'Functions that execute between request and response', 'Frontend code', 'Testing utilities'], answer: 1 },
      { q: 'What does require() do in Node.js?', options: ['Requires user input', 'Imports modules', 'Creates variables', 'Handles errors'], answer: 1 },
      { q: 'What is the difference between synchronous and asynchronous code?', options: ['No difference', 'Sync waits, async does not block', 'Async waits, sync does not', 'Both are same'], answer: 1 },
      { q: 'What is a callback function?', options: ['A function that calls back users', 'Function passed as argument to another function', 'Error handler', 'Database query'], answer: 1 },
      { q: 'What is Promise in Node.js?', options: ['A guarantee', 'Object representing eventual completion of async operation', 'A variable type', 'A database'], answer: 1 },
      { q: 'What is async/await?', options: ['CSS animations', 'Syntactic sugar for working with Promises', 'Database queries', 'Testing tools'], answer: 1 },
      { q: 'What is the fs module in Node.js?', options: ['Facebook SDK', 'File System module for file operations', 'Frontend styles', 'Function scope'], answer: 1 },
      { q: 'What is REST API?', options: ['A database', 'Architectural style for networked applications', 'A frontend tool', 'A testing framework'], answer: 1 },
      { q: 'What is JSON?', options: ['JavaScript Object Notation', 'Java Script Online Network', 'Just Some Object Names', 'None'], answer: 0 },
      { q: 'What is CORS?', options: ['Cross Origin Resource Sharing', 'Code Object Resource System', 'Cross Object React System', 'None'], answer: 0 },
      { q: 'What is JWT?', options: ['JSON Web Token', 'JavaScript Web Type', 'Just Web Token', 'None'], answer: 0 },
      { q: 'What is bcrypt used for?', options: ['Compression', 'Password hashing', 'Encryption of files', 'Database queries'], answer: 1 },
      { q: 'What is environment variable?', options: ['CSS variable', 'Variable stored outside code for configuration', 'JavaScript variable', 'Database variable'], answer: 1 },
      { q: 'What is package.json?', options: ['JSON data file', 'File containing project metadata and dependencies', 'CSS configuration', 'Database schema'], answer: 1 },
      { q: 'What does app.listen() do in Express?', options: ['Listens to database', 'Starts server on specified port', 'Listens to user input', 'Monitors errors'], answer: 1 },
      { q: 'What is req.body in Express?', options: ['Request body containing sent data', 'Response body', 'Error body', 'Database body'], answer: 0 },
      { q: 'What is res.json() used for?', options: ['Reading JSON', 'Sending JSON response', 'Parsing JSON', 'Storing JSON'], answer: 1 },
      { q: 'What is a 404 status code?', options: ['Success', 'Not Found', 'Server Error', 'Unauthorized'], answer: 1 },
      { q: 'What is a 500 status code?', options: ['Success', 'Not Found', 'Internal Server Error', 'Created'], answer: 2 },
      { q: 'What is Prisma?', options: ['A CSS tool', 'A modern ORM for Node.js', 'A testing framework', 'A frontend library'], answer: 1 },
      { q: 'What is an ORM?', options: ['Object Relational Mapping', 'Online Resource Manager', 'Object Request Model', 'None'], answer: 0 },
      { q: 'What is database migration?', options: ['Moving database location', 'Versioned changes to database schema', 'Copying data', 'Deleting tables'], answer: 1 },
      { q: 'What is rate limiting?', options: ['Limiting CSS animations', 'Controlling request frequency to API', 'Limiting database size', 'Limiting file size'], answer: 1 },
      { q: 'What is authentication vs authorization?', options: ['Same thing', 'Auth=who you are, Authz=what you can do', 'Auth=what you can do, Authz=who you are', 'Neither matters'], answer: 1 },
      { q: 'What is a token-based authentication?', options: ['Using passwords only', 'Using tokens like JWT for verifying identity', 'Using cookies only', 'Using sessions only'], answer: 1 },
      { q: 'What is nodemon used for?', options: ['Node monitoring', 'Auto-restarting server on file changes', 'Node memory management', 'Testing'], answer: 1 },
      { q: 'What is the purpose of .env file?', options: ['Environment styling', 'Storing environment variables securely', 'Environment testing', 'Error variables'], answer: 1 },
      { q: 'What is HTTP vs HTTPS?', options: ['Same protocol', 'HTTPS is HTTP with SSL encryption', 'HTTP is more secure', 'No difference'], answer: 1 },
      { q: 'What is a POST request?', options: ['Retrieving data', 'Sending data to server', 'Deleting data', 'Updating partially'], answer: 1 },
      { q: 'What is a PUT request?', options: ['Creating new data', 'Updating existing data', 'Deleting data', 'Retrieving data'], answer: 1 },
      { q: 'What is the purpose of try-catch in Node.js?', options: ['Performance optimization', 'Error handling', 'Data validation', 'Database queries'], answer: 1 },
      { q: 'What is clustering in Node.js?', options: ['Grouping variables', 'Running multiple instances to use all CPU cores', 'Database clustering', 'File grouping'], answer: 1 },
      { q: 'What is Socket.io used for?', options: ['Database connections', 'Real-time bidirectional communication', 'File uploads', 'Authentication'], answer: 1 },
      { q: 'What is the purpose of helmet in Express?', options: ['CSS helmet', 'Setting security HTTP headers', 'Authentication', 'Logging'], answer: 1 },
      { q: 'What is load balancing?', options: ['Balancing CSS load', 'Distributing traffic across multiple servers', 'Balancing database queries', 'File distribution'], answer: 1 },
      { q: 'What is caching?', options: ['Deleting data', 'Storing frequently accessed data for faster retrieval', 'Compressing files', 'Encrypting data'], answer: 1 },
    ]
  },
  'Python': {
    level: 'intermediate', questions: [
      { q: 'What is Python?', options: ['A snake', 'A high-level interpreted programming language', 'A database', 'A framework'], answer: 1 },
      { q: 'What is PEP 8?', options: ['Python version 8', 'Python style guide for code formatting', 'A Python library', 'An error code'], answer: 1 },
      { q: 'What is a list in Python?', options: ['An ordered mutable collection', 'An ordered immutable collection', 'An unordered collection', 'A key-value store'], answer: 0 },
      { q: 'What is a tuple?', options: ['An ordered mutable collection', 'An ordered immutable collection', 'A dictionary', 'A set'], answer: 1 },
      { q: 'What is a dictionary in Python?', options: ['A list', 'A key-value pair collection', 'A tuple', 'A string'], answer: 1 },
      { q: 'What is a lambda function?', options: ['A named function', 'An anonymous single-expression function', 'A class method', 'A loop'], answer: 1 },
      { q: 'What does len() do?', options: ['Lengthens a string', 'Returns length of object', 'Creates a list', 'Deletes items'], answer: 1 },
      { q: 'What is list comprehension?', options: ['Understanding lists', 'Concise way to create lists', 'Deleting list items', 'Sorting lists'], answer: 1 },
      { q: 'What is the difference between == and is?', options: ['No difference', '== checks value, is checks identity', 'is checks value, == checks identity', 'Both check identity'], answer: 1 },
      { q: 'What is a decorator in Python?', options: ['CSS decorator', 'Function that modifies another function', 'A class attribute', 'A loop'], answer: 1 },
      { q: 'What is self in Python class?', options: ['A keyword', 'Reference to the current instance', 'A global variable', 'A method'], answer: 1 },
      { q: 'What is inheritance in Python?', options: ['Copying code', 'One class deriving properties from another', 'Deleting methods', 'Creating variables'], answer: 1 },
      { q: 'What does __init__ do?', options: ['Initializes module', 'Constructor method called when object is created', 'Destroys object', 'Imports module'], answer: 1 },
      { q: 'What is a generator in Python?', options: ['Code generator', 'Function that yields values one at a time', 'Random number generator', 'HTML generator'], answer: 1 },
      { q: 'What is pip?', options: ['A pipe', 'Python package installer', 'A Python keyword', 'A data type'], answer: 1 },
      { q: 'What is a virtual environment?', options: ['Virtual reality', 'Isolated Python environment for projects', 'A cloud server', 'An IDE'], answer: 1 },
      { q: 'What does map() do?', options: ['Creates a map', 'Applies function to each item in iterable', 'Sorts items', 'Filters items'], answer: 1 },
      { q: 'What does filter() do?', options: ['Filters CSS', 'Returns items where function returns True', 'Creates new list', 'Sorts list'], answer: 1 },
      { q: 'What is exception handling in Python?', options: ['Handling exceptions to rules', 'try/except blocks to handle errors gracefully', 'Deleting errors', 'Ignoring errors'], answer: 1 },
      { q: 'What is the difference between append and extend?', options: ['No difference', 'append adds one item, extend adds multiple', 'extend adds one item, append adds multiple', 'Both delete items'], answer: 1 },
      { q: 'What is a set in Python?', options: ['A list', 'Unordered collection of unique elements', 'A tuple', 'A dictionary'], answer: 1 },
      { q: 'What is slicing in Python?', options: ['Cutting strings', 'Extracting portion of sequence', 'Deleting items', 'Sorting sequence'], answer: 1 },
      { q: 'What does zip() do?', options: ['Compresses files', 'Combines multiple iterables into tuples', 'Sorts items', 'Filters items'], answer: 1 },
      { q: 'What is global vs local variable?', options: ['No difference', 'Global accessible everywhere, local only in function', 'Local accessible everywhere, global only in function', 'Both same scope'], answer: 1 },
      { q: 'What is recursion?', options: ['A loop', 'Function that calls itself', 'A class method', 'An iterator'], answer: 1 },
      { q: 'What is the purpose of __str__ method?', options: ['Converting to string', 'Defining string representation of object', 'Deleting object', 'Creating object'], answer: 1 },
      { q: 'What is a context manager?', options: ['CSS context', 'Object that manages resources using with statement', 'A variable', 'A loop'], answer: 1 },
      { q: 'What is multiple inheritance?', options: ['Copying multiple classes', 'Class inheriting from multiple parent classes', 'Creating multiple objects', 'Multiple methods'], answer: 1 },
      { q: 'What is polymorphism?', options: ['Multiple forms of data', 'Same interface for different underlying forms', 'Multiple inheritance', 'Multiple loops'], answer: 1 },
      { q: 'What does sorted() return?', options: ['Sorts in place', 'Returns new sorted list', 'Deletes unsorted items', 'Returns sorted tuple'], answer: 1 },
    ]
  },
  'SQL': {
    level: 'beginner', questions: [
      { q: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'None'], answer: 0 },
      { q: 'What does SELECT do?', options: ['Deletes records', 'Retrieves data from database', 'Updates records', 'Creates tables'], answer: 1 },
      { q: 'What does WHERE clause do?', options: ['Filters records based on condition', 'Joins tables', 'Creates indexes', 'Deletes tables'], answer: 0 },
      { q: 'What is a PRIMARY KEY?', options: ['First column', 'Unique identifier for each record', 'Foreign key', 'Index'], answer: 1 },
      { q: 'What is a FOREIGN KEY?', options: ['External key', 'Key that references primary key in another table', 'Unique key', 'Index key'], answer: 1 },
      { q: 'What does JOIN do?', options: ['Splits tables', 'Combines rows from multiple tables', 'Deletes tables', 'Creates tables'], answer: 1 },
      { q: 'What is the difference between INNER JOIN and LEFT JOIN?', options: ['No difference', 'INNER returns matching rows, LEFT returns all from left table', 'LEFT returns matching, INNER returns all', 'Both return all rows'], answer: 1 },
      { q: 'What does GROUP BY do?', options: ['Groups columns', 'Groups rows that have same values', 'Orders data', 'Filters data'], answer: 1 },
      { q: 'What does ORDER BY do?', options: ['Creates order', 'Sorts result set', 'Groups results', 'Filters results'], answer: 1 },
      { q: 'What is DISTINCT used for?', options: ['Creating unique tables', 'Returning only unique values', 'Deleting duplicates', 'Counting records'], answer: 1 },
      { q: 'What does COUNT() do?', options: ['Counts tables', 'Returns number of rows', 'Sums values', 'Averages values'], answer: 1 },
      { q: 'What does SUM() do?', options: ['Counts rows', 'Returns sum of numeric column', 'Averages values', 'Returns maximum'], answer: 1 },
      { q: 'What is a NULL value?', options: ['Zero value', 'Absence of value', 'Empty string', 'False value'], answer: 1 },
      { q: 'What does HAVING clause do?', options: ['Filters before grouping', 'Filters after GROUP BY', 'Orders results', 'Joins tables'], answer: 1 },
      { q: 'What is an INDEX in SQL?', options: ['Table number', 'Data structure that improves query speed', 'Primary key', 'Column name'], answer: 1 },
      { q: 'What does INSERT INTO do?', options: ['Updates records', 'Adds new records to table', 'Deletes records', 'Creates table'], answer: 1 },
      { q: 'What does UPDATE do?', options: ['Adds new records', 'Modifies existing records', 'Deletes records', 'Creates table'], answer: 1 },
      { q: 'What does DELETE do?', options: ['Drops table', 'Removes records from table', 'Updates records', 'Creates records'], answer: 1 },
      { q: 'What does DROP TABLE do?', options: ['Removes all records', 'Deletes entire table and structure', 'Updates table', 'Creates table'], answer: 1 },
      { q: 'What is a transaction?', options: ['A payment', 'A unit of work that is atomic', 'A query', 'A table'], answer: 1 },
      { q: 'What does COMMIT do in a transaction?', options: ['Cancels transaction', 'Saves transaction permanently', 'Starts transaction', 'Pauses transaction'], answer: 1 },
      { q: 'What does ROLLBACK do?', options: ['Commits changes', 'Undoes transaction changes', 'Starts transaction', 'Deletes table'], answer: 1 },
      { q: 'What is normalization?', options: ['Making data normal', 'Organizing database to reduce redundancy', 'Sorting data', 'Indexing tables'], answer: 1 },
      { q: 'What is a VIEW in SQL?', options: ['A visual report', 'Virtual table based on SELECT query', 'A stored procedure', 'An index'], answer: 1 },
      { q: 'What is a stored procedure?', options: ['A saved query', 'Precompiled SQL code stored in database', 'A view', 'An index'], answer: 1 },
      { q: 'What does LIKE operator do?', options: ['Compares equality', 'Pattern matching in WHERE clause', 'Joins tables', 'Groups data'], answer: 1 },
      { q: 'What is the difference between CHAR and VARCHAR?', options: ['No difference', 'CHAR is fixed length, VARCHAR is variable length', 'VARCHAR is fixed, CHAR is variable', 'Both same'], answer: 1 },
      { q: 'What does BETWEEN do?', options: ['Joins tables', 'Filters values within a range', 'Creates ranges', 'Deletes ranges'], answer: 1 },
      { q: 'What is a subquery?', options: ['A small query', 'Query nested inside another query', 'A stored procedure', 'A view'], answer: 1 },
      { q: 'What does MAX() function return?', options: ['Minimum value', 'Maximum value in column', 'Average value', 'Count of values'], answer: 1 },
    ]
  },
  'JavaScript': {
    level: 'intermediate', questions: [
      { q: 'What is JavaScript?', options: ['A coffee brand', 'A scripting language for web', 'A database', 'A CSS framework'], answer: 1 },
      { q: 'What is the difference between let, const and var?', options: ['No difference', 'var is function scoped, let/const are block scoped, const cannot be reassigned', 'let is function scoped', 'const can be reassigned'], answer: 1 },
      { q: 'What is a closure?', options: ['Closing browser', 'Function that retains access to outer scope variables', 'A loop', 'An error'], answer: 1 },
      { q: 'What is hoisting?', options: ['Lifting elements in CSS', 'Moving declarations to top of scope', 'A sorting algorithm', 'Error handling'], answer: 1 },
      { q: 'What is event delegation?', options: ['Delegating CSS events', 'Attaching single event listener to parent element', 'Multiple event listeners', 'Removing events'], answer: 1 },
      { q: 'What is the DOM?', options: ['Document Object Model', 'Data Object Model', 'Dynamic Object Method', 'None'], answer: 0 },
      { q: 'What does async/await do?', options: ['Makes code faster', 'Handles asynchronous code more readably', 'Makes code synchronous', 'Handles errors'], answer: 1 },
      { q: 'What is a Promise?', options: ['A guarantee', 'Object representing eventual completion of async operation', 'A function', 'A variable'], answer: 1 },
      { q: 'What is the spread operator (...)?', options: ['Multiplication', 'Expands iterable into individual elements', 'Creates arrays', 'Deletes elements'], answer: 1 },
      { q: 'What is destructuring?', options: ['Destroying objects', 'Extracting values from arrays/objects into variables', 'Creating objects', 'Copying objects'], answer: 1 },
      { q: 'What is the difference between == and ===?', options: ['No difference', '== checks value only, === checks value and type', '=== checks value only', 'Both check type'], answer: 1 },
      { q: 'What is typeof operator?', options: ['Creates types', 'Returns data type of variable', 'Converts types', 'Deletes types'], answer: 1 },
      { q: 'What is null vs undefined?', options: ['Same thing', 'null is intentional absence, undefined means not assigned', 'undefined is intentional', 'Both mean empty'], answer: 1 },
      { q: 'What is event bubbling?', options: ['Creating bubbles', 'Event propagating from child to parent', 'Event propagating from parent to child', 'Stopping events'], answer: 1 },
      { q: 'What does preventDefault() do?', options: ['Prevents loading', 'Prevents default browser behavior for event', 'Stops bubbling', 'Prevents errors'], answer: 1 },
      { q: 'What is localStorage?', options: ['Local file storage', 'Browser storage for key-value pairs with no expiry', 'Server storage', 'Cookie storage'], answer: 1 },
      { q: 'What is a callback function?', options: ['Calling users back', 'Function passed as argument to another function', 'Error handler', 'Async function'], answer: 1 },
      { q: 'What is prototype in JavaScript?', options: ['A template', 'Object from which other objects inherit properties', 'A class', 'A function'], answer: 1 },
      { q: 'What is the event loop?', options: ['A for loop', 'Mechanism handling async operations in JS', 'A CSS animation', 'An error loop'], answer: 1 },
      { q: 'What is a Map in JavaScript?', options: ['A geographic map', 'Collection of key-value pairs with any key type', 'An array method', 'A set'], answer: 1 },
      { q: 'What is a Set in JavaScript?', options: ['Setting variables', 'Collection of unique values', 'An array', 'A map'], answer: 1 },
      { q: 'What does Object.keys() return?', options: ['Object values', 'Array of object property names', 'Object entries', 'Object length'], answer: 1 },
      { q: 'What is JSON.stringify()?', options: ['Parses JSON', 'Converts JS object to JSON string', 'Creates JSON', 'Deletes JSON'], answer: 1 },
      { q: 'What is JSON.parse()?', options: ['Creates JSON', 'Converts JSON string to JS object', 'Stringifies JSON', 'Deletes JSON'], answer: 1 },
      { q: 'What is the this keyword?', options: ['Current file', 'Reference to current execution context', 'Global variable', 'A function'], answer: 1 },
      { q: 'What is arrow function?', options: ['A function with arrow', 'Concise function syntax that does not bind this', 'A class method', 'An async function'], answer: 1 },
      { q: 'What is template literal?', options: ['A template engine', 'String with embedded expressions using backticks', 'A CSS template', 'A function'], answer: 1 },
      { q: 'What does Array.map() do?', options: ['Creates a map', 'Returns new array with function applied to each element', 'Filters array', 'Sorts array'], answer: 1 },
      { q: 'What does Array.filter() do?', options: ['Adds elements', 'Returns new array with elements passing test', 'Sorts array', 'Removes all elements'], answer: 1 },
      { q: 'What does Array.reduce() do?', options: ['Reduces array size', 'Reduces array to single value', 'Filters array', 'Maps array'], answer: 1 },
      { q: 'What is optional chaining (?.)?', options: ['A CSS selector', 'Safely accessing nested properties without errors', 'Creating optional variables', 'Deleting properties'], answer: 1 },
      { q: 'What is nullish coalescing (??)?', options: ['Null check', 'Returns right side if left is null or undefined', 'Creates null values', 'Deletes null'], answer: 1 },
      { q: 'What is a WeakMap?', options: ['A weak map', 'Map with weakly referenced keys for garbage collection', 'A small map', 'A map with strings only'], answer: 1 },
      { q: 'What is the purpose of Symbol?', options: ['Mathematical symbol', 'Unique and immutable primitive value', 'A string type', 'A number type'], answer: 1 },
      { q: 'What is a generator function?', options: ['Code generator', 'Function that can pause and resume execution', 'Random generator', 'Event generator'], answer: 1 },
      { q: 'What is the purpose of try/catch/finally?', options: ['Loop control', 'Error handling with cleanup code', 'Async handling', 'Event handling'], answer: 1 },
      { q: 'What does Object.assign() do?', options: ['Assigns variables', 'Copies properties from source to target object', 'Creates objects', 'Deletes properties'], answer: 1 },
      { q: 'What is memoization?', options: ['Memory allocation', 'Caching function results for same inputs', 'Memorizing code', 'Memory management'], answer: 1 },
      { q: 'What is the difference between call, apply and bind?', options: ['No difference', 'All invoke functions but differ in how args are passed', 'Only bind invokes function', 'call and apply are same'], answer: 1 },
      { q: 'What is a Proxy in JavaScript?', options: ['A server proxy', 'Object wrapping another object to intercept operations', 'A CSS proxy', 'A database proxy'], answer: 1 },
    ]
  },
  'DSA': {
    level: 'advanced', questions: [
      { q: 'What is time complexity?', options: ['Time to write code', 'Measure of time taken by algorithm as input grows', 'Execution time', 'Compile time'], answer: 1 },
      { q: 'What is O(1) complexity?', options: ['Very slow', 'Constant time regardless of input size', 'Linear time', 'Quadratic time'], answer: 1 },
      { q: 'What is O(n) complexity?', options: ['Constant time', 'Linear time proportional to input', 'Quadratic time', 'Logarithmic time'], answer: 1 },
      { q: 'What is O(log n) complexity?', options: ['Linear time', 'Logarithmic time - divides problem in half each step', 'Constant time', 'Quadratic time'], answer: 1 },
      { q: 'What data structure is used for BFS?', options: ['Stack', 'Queue', 'Array', 'Linked List'], answer: 1 },
      { q: 'What data structure is used for DFS?', options: ['Queue', 'Stack', 'Array', 'Hash Map'], answer: 1 },
      { q: 'What is a binary search tree?', options: ['A binary tree', 'Tree where left < root < right', 'A sorted array', 'A heap'], answer: 1 },
      { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], answer: 1 },
      { q: 'What is dynamic programming?', options: ['Programming with dynamic languages', 'Breaking problem into subproblems and storing results', 'Object oriented programming', 'Functional programming'], answer: 1 },
      { q: 'What is memoization in DP?', options: ['Memory allocation', 'Top-down DP storing computed results', 'Bottom-up DP', 'Recursion'], answer: 1 },
      { q: 'What is a stack?', options: ['A pile of plates (LIFO)', 'FIFO data structure', 'A queue', 'A tree'], answer: 0 },
      { q: 'What is a queue?', options: ['LIFO structure', 'FIFO data structure', 'A stack', 'A tree'], answer: 1 },
      { q: 'What is a linked list?', options: ['A Python list', 'Linear collection of nodes with pointers', 'An array', 'A tree'], answer: 1 },
      { q: 'What is the difference between array and linked list?', options: ['No difference', 'Array has fixed size and random access, linked list is dynamic', 'Linked list has random access', 'Array is dynamic'], answer: 1 },
      { q: 'What is a hash map?', options: ['A map with hashes', 'Key-value store with O(1) average lookup', 'A sorted map', 'A tree map'], answer: 1 },
      { q: 'What is a heap?', options: ['Memory heap', 'Complete binary tree with heap property', 'A stack', 'A queue'], answer: 1 },
      { q: 'What is Dijkstra\'s algorithm used for?', options: ['Sorting', 'Shortest path in weighted graph', 'Tree traversal', 'Searching'], answer: 1 },
      { q: 'What is a trie?', options: ['A tree for trying', 'Tree structure for string prefix searching', 'A binary tree', 'A heap'], answer: 1 },
      { q: 'What is quicksort\'s average time complexity?', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'], answer: 1 },
      { q: 'What is merge sort\'s time complexity?', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'], answer: 1 },
      { q: 'What is a graph?', options: ['A chart', 'Collection of nodes connected by edges', 'A tree', 'A list'], answer: 1 },
      { q: 'What is topological sort?', options: ['Sorting numbers', 'Linear ordering of vertices in directed graph', 'Sorting strings', 'Tree traversal'], answer: 1 },
      { q: 'What is Floyd-Warshall algorithm?', options: ['Shortest path', 'All-pairs shortest path algorithm', 'Tree traversal', 'Sorting'], answer: 1 },
      { q: 'What is a balanced binary tree?', options: ['A tree with equal nodes', 'Tree where height difference of subtrees is at most 1', 'A BST', 'A complete tree'], answer: 1 },
      { q: 'What is space complexity?', options: ['Space between code', 'Memory used by algorithm as input grows', 'File size', 'Database size'], answer: 1 },
      { q: 'What is a greedy algorithm?', options: ['Fast algorithm', 'Makes locally optimal choice at each step', 'DP algorithm', 'Brute force'], answer: 1 },
      { q: 'What is backtracking?', options: ['Going back in code', 'Trying all possibilities and abandoning invalid ones', 'DP approach', 'Greedy approach'], answer: 1 },
      { q: 'What is cycle detection in a graph?', options: ['Finding circles', 'Finding if graph has a cycle', 'Counting edges', 'Finding paths'], answer: 1 },
      { q: 'What is a minimum spanning tree?', options: ['Smallest tree', 'Spanning tree with minimum total edge weight', 'A BST', 'A heap'], answer: 1 },
      { q: 'What is KMP algorithm used for?', options: ['Graph traversal', 'Efficient pattern matching in strings', 'Sorting', 'Shortest path'], answer: 1 },
      { q: 'What is a segment tree?', options: ['A tree for segments', 'Tree for range queries and updates', 'A BST', 'A trie'], answer: 1 },
      { q: 'What is a deque?', options: ['A queue', 'Double-ended queue allowing insertion/deletion at both ends', 'A stack', 'A list'], answer: 1 },
      { q: 'What is amortized analysis?', options: ['Average case analysis', 'Average cost per operation over sequence of operations', 'Worst case analysis', 'Best case analysis'], answer: 1 },
      { q: 'What is a disjoint set (Union-Find)?', options: ['Separate sets', 'Data structure tracking elements in disjoint sets', 'A graph', 'A tree'], answer: 1 },
      { q: 'What is the two-pointer technique?', options: ['Using two pointers in code', 'Using two pointers moving towards each other to solve problems', 'Pointer arithmetic', 'Double linked list'], answer: 1 },
      { q: 'What is sliding window technique?', options: ['CSS window', 'Maintaining a window of elements to solve subarray problems', 'Browser window', 'Moving array'], answer: 1 },
      { q: 'What is bit manipulation?', options: ['Manipulating bits', 'Operating directly on binary representations', 'Binary search', 'Bitwise operations in sorting'], answer: 1 },
      { q: 'What is divide and conquer?', options: ['Military strategy', 'Breaking problem into subproblems, solving independently', 'DP approach', 'Greedy approach'], answer: 1 },
      { q: 'What is a monotonic stack?', options: ['A stack', 'Stack maintaining monotonic order of elements', 'A queue', 'A deque'], answer: 1 },
      { q: 'What is the difference between BFS and DFS?', options: ['No difference', 'BFS explores level by level, DFS explores depth first', 'DFS explores level by level', 'Both use queue'], answer: 1 },
      { q: 'What is an AVL tree?', options: ['A type of tree', 'Self-balancing BST maintaining height balance', 'A heap', 'A trie'], answer: 1 },
      { q: 'What is a red-black tree?', options: ['A colored tree', 'Self-balancing BST with color properties', 'A heap', 'A trie'], answer: 1 },
      { q: 'What is Bellman-Ford algorithm?', options: ['Shortest path', 'Shortest path algorithm that handles negative weights', 'Tree traversal', 'Sorting'], answer: 1 },
      { q: 'What is a priority queue?', options: ['A queue with priorities', 'Queue where elements are served by priority', 'A heap', 'A sorted array'], answer: 1 },
      { q: 'What is Kadane\'s algorithm used for?', options: ['Graph traversal', 'Finding maximum subarray sum', 'Sorting', 'String matching'], answer: 1 },
      { q: 'What is the knapsack problem?', options: ['Packing bags', 'Optimization problem of maximizing value within weight limit', 'Graph problem', 'String problem'], answer: 1 },
      { q: 'What is matrix chain multiplication?', options: ['Multiplying matrices', 'DP problem for optimal matrix multiplication order', 'Linear algebra', 'Graph problem'], answer: 1 },
      { q: 'What is the longest common subsequence (LCS)?', options: ['Common strings', 'Longest subsequence present in both sequences', 'Shortest path', 'Graph traversal'], answer: 1 },
      { q: 'What is a sparse table?', options: ['Empty table', 'Data structure for range queries in O(1)', 'A hash table', 'A segment tree'], answer: 1 },
      { q: 'What is randomized algorithm?', options: ['Random code', 'Algorithm using random numbers in logic', 'Unsorted algorithm', 'Brute force'], answer: 1 },
      { q: 'What is NP-hard problem?', options: ['Very hard problem', 'Problem at least as hard as NP-complete problems', 'Unsolvable problem', 'Polynomial problem'], answer: 1 },
    ]
  }
}

const getRetryTime = (attemptNumber) => {
  const now = new Date()
  if (attemptNumber === 1) return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  if (attemptNumber === 2) return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  if (attemptNumber === 3) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return null
}

const getAvailableExams = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({
      where: { userId },
      include: { verifiedSkills: true, examAttempts: { orderBy: { createdAt: 'desc' } } }
    })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const skills = (student.technicalSkills || '').split(',').map(s => s.trim()).filter(Boolean)
    const availableExams = Object.keys(EXAM_QUESTIONS)

    const skillStatus = skills.map(skill => {
      const examKey = availableExams.find(e => e.toLowerCase() === skill.toLowerCase())
      const verified = student.verifiedSkills.find(v => v.skill.toLowerCase() === skill.toLowerCase())
      const attempts = student.examAttempts.filter(a => a.skill.toLowerCase() === skill.toLowerCase())
      const lastAttempt = attempts[0]
      const attemptCount = attempts.length

      let status = 'not_verified'
      let canRetake = true
      let nextRetryAt = null
      let expiresAt = null
      let redirectToCourses = false

      if (verified && new Date(verified.expiresAt) > new Date()) {
        status = 'verified'
        expiresAt = verified.expiresAt
        canRetake = false
      } else if (verified && new Date(verified.expiresAt) <= new Date()) {
        status = 'expired'
      } else if (lastAttempt && !lastAttempt.passed) {
        if (attemptCount >= 4) {
          status = 'failed_max'
          canRetake = false
          redirectToCourses = true
        } else if (lastAttempt.nextRetryAt && new Date(lastAttempt.nextRetryAt) > new Date()) {
          status = 'cooldown'
          canRetake = false
          nextRetryAt = lastAttempt.nextRetryAt
        }
      }

      return {
        skill,
        hasExam: !!examKey,
        examKey,
        status,
        canRetake,
        nextRetryAt,
        expiresAt,
        attemptCount,
        redirectToCourses,
        level: examKey ? EXAM_QUESTIONS[examKey]?.level : null,
        questionCount: examKey ? EXAM_QUESTIONS[examKey]?.questions.length : null
      }
    })

    res.json({ skillStatus, verifiedSkills: student.verifiedSkills })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getExamQuestions = async (req, res) => {
  try {
    const { skill } = req.params
    const examKey = Object.keys(EXAM_QUESTIONS).find(e => e.toLowerCase() === skill.toLowerCase())
    if (!examKey) return res.status(404).json({ message: 'Exam not available for this skill' })

    const userId = req.user.userId
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        examAttempts: { where: { skill: examKey }, orderBy: { createdAt: 'desc' } },
        verifiedSkills: { where: { skill: examKey } }
      }
    })

    const verified = student?.verifiedSkills[0]
    if (verified && new Date(verified.expiresAt) > new Date()) {
      return res.status(400).json({ message: 'Skill already verified' })
    }

    const attempts = student?.examAttempts || []
    const lastAttempt = attempts[0]

    if (attempts.length >= 4) {
      return res.status(400).json({ message: 'Maximum attempts reached. Please take a course first.', redirectToCourses: true })
    }

    if (lastAttempt && !lastAttempt.passed && lastAttempt.nextRetryAt && new Date(lastAttempt.nextRetryAt) > new Date()) {
      return res.status(400).json({ message: 'Please wait before retrying', nextRetryAt: lastAttempt.nextRetryAt })
    }

    const exam = EXAM_QUESTIONS[examKey]
    const shuffled = [...exam.questions].sort(() => Math.random() - 0.5)
    const questionsForStudent = shuffled.map((q, i) => ({
      id: i,
      question: q.q,
      options: q.options,
    }))

    res.json({
      skill: examKey,
      level: exam.level,
      questions: questionsForStudent,
      totalQuestions: questionsForStudent.length,
      timeLimit: 30,
      passMark: 70,
      attemptNumber: attempts.length + 1
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const submitExam = async (req, res) => {
  try {
    const { skill } = req.params
    const { answers } = req.body
    const userId = req.user.userId

    const examKey = Object.keys(EXAM_QUESTIONS).find(e => e.toLowerCase() === skill.toLowerCase())
    if (!examKey) return res.status(404).json({ message: 'Exam not found' })

    const student = await prisma.student.findUnique({
      where: { userId },
      include: { examAttempts: { where: { skill: examKey }, orderBy: { createdAt: 'desc' } } }
    })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const exam = EXAM_QUESTIONS[examKey]
    const shuffled = [...exam.questions].sort(() => Math.random() - 0.5)

    let correct = 0
    answers.forEach((answer, i) => {
      if (i < shuffled.length && answer === shuffled[i].answer) correct++
    })

    const score = Math.round((correct / exam.questions.length) * 100)
    const passed = score >= 70
    const attemptNumber = (student.examAttempts.length || 0) + 1
    const nextRetryAt = passed ? null : getRetryTime(attemptNumber)
    const redirectToCourses = !passed && attemptNumber >= 4

    await prisma.studentExamAttempt.create({
      data: {
        studentId: student.id,
        skill: examKey,
        score,
        totalQuestions: exam.questions.length,
        passed,
        attemptNumber,
        nextRetryAt
      }
    })

    if (passed) {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 3)
      await prisma.verifiedSkill.upsert({
        where: { id: (await prisma.verifiedSkill.findFirst({ where: { studentId: student.id, skill: examKey } }))?.id || 0 },
        update: { verifiedAt: new Date(), expiresAt },
        create: { studentId: student.id, skill: examKey, expiresAt }
      })
    }

    res.json({ score, passed, correct, total: exam.questions.length, attemptNumber, nextRetryAt, redirectToCourses, message: passed ? `Congratulations! You scored ${score}%. ${examKey} is now verified on your GRID!` : `You scored ${score}%. You need 70% to pass.` })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getVerifiedSkills = async (req, res) => {
  try {
    const userId = req.user.userId
    const student = await prisma.student.findUnique({ where: { userId }, include: { verifiedSkills: true } })
    if (!student) return res.status(404).json({ message: 'Student not found' })
    res.json({ verifiedSkills: student.verifiedSkills })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getAvailableExams, getExamQuestions, submitExam, getVerifiedSkills }
