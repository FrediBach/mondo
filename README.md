# Mondo - Select, Subscribe, Mutate

# Part 1: Introduction and Basics

# Mondo
A powerful and safe JSON data selector system that never throws errors. Query complex JSON structures with an expressive, SQL-like syntax.

## Key Features
- Zero runtime errors - always returns a value, array, or undefined
- Powerful filtering with comparison and regex operators
- Flexible wildcards and array access
- Logical combinations (AND/OR) and negation
- Array slicing and deep property access
- Pattern matching and value filtering

## Installation
```bash
npm install mondo
```

```javascript
const { select, mutate, subscribe } = require('mondo');
```

## Basic Usage
```javascript
const { select } = require('mondo');

const data = {
  users: [
    { name: "John", age: 25, roles: ["admin"] },
    { name: "Jane", age: 31, roles: ["user"] }
  ],
  settings: {
    features: {
      darkMode: true,
      notifications: false
    }
  }
};

// Basic property access
select("users[0].name", data);                    // "John"

// Array of values
select("users.*.name", data);                     // ["John", "Jane"]

// Deep property with filter
select("users[roles~admin].name", data);          // ["John"]

// Combined selectors
select("users[age>30] | users[roles~admin]", data);  // [Jane's object, John's object]

// Deep wildcard search
select("**.darkMode", data);                      // [true]
```

## Core Principles
1. **Safety**: No runtime errors, ever. Invalid selectors or missing data return undefined or empty array.

2. **Predictability**: Only three possible return types:
   - Single value (when exactly one match is found)
   - Array (when multiple matches are found)
   - undefined (when no matches are found)

3. **Composability**: All selectors can be combined using logical operators.

4. **Simplicity**: Familiar syntax inspired by JSON Path, SQL, and regular expressions.

# Part 2: Core Selectors

## Property Access

### Basic Properties
```javascript
// Simple property access
"user.name"                    // value or undefined
"deeply.nested.property"       // value or undefined

// Properties with special characters
"user['my.property']"          // value or undefined
"user['spaces here']"          // value or undefined
```

### Arrays and Nested Properties
```javascript
const data = {
  users: [
    { 
      name: "John",
      "contact.info": {
        email: "john@example.com"
      }
    }
  ]
};

// Different ways to access properties
select("users[0].name", data)                    // "John"
select("users[0]['contact.info'].email", data)   // "john@example.com"
```

## Array Access

### Basic Indexing
```javascript
// Single element access
"users[0]"                     // first element or undefined
"users[-1]"                    // last element or undefined
"users[-2]"                    // second to last or undefined

const data = {
  users: ["John", "Jane", "Bob"]
};

select("users[0]", data)       // "John"
select("users[-1]", data)      // "Bob"
```

### Array Slicing
```javascript
// Python-style slicing
"users[1:4]"                   // elements 1-3 or empty array
"users[:-2]"                   // all except last two
"users[2:]"                    // from element 2 to end
"users[:]"                     // all elements

const data = {
  items: [0, 1, 2, 3, 4, 5]
};

select("items[1:4]", data)     // [1, 2, 3]
select("items[::2]", data)     // [0, 2, 4] (step by 2)
select("items[::-1]", data)    // [5, 4, 3, 2, 1, 0] (reverse)
```

## Wildcards

### Single Level Wildcard (*)
```javascript
// Match any property at current level
"users.*.name"                 // array of names at current level
"*.id"                         // all ids at root level

const data = {
  users: [
    { name: "John", address: { city: "NY" } },
    { name: "Jane", address: { city: "LA" } }
  ],
  admin: { name: "Bob" }
};

select("*.name", data)         // ["Bob"]
select("users.*.name", data)   // ["John", "Jane"]
```

### Deep Wildcard (**)
```javascript
// Recursive matching at any depth
"**.name"                      // all name properties anywhere
"**.id"                        // all id properties anywhere

const data = {
  users: [
    { 
      name: "John",
      documents: [
        { name: "doc1", type: "pdf" },
        { name: "doc2", type: "doc" }
      ]
    }
  ],
  settings: {
    name: "config"
  }
};

select("**.name", data)        // ["John", "doc1", "doc2", "config"]
select("**.type", data)        // ["pdf", "doc"]
```

### Advanced Wildcard Usage
```javascript
// Combining wildcards with filters
"**.users[active=true].*.name"  // names of active users at any depth

// Wildcards in property names
"users.*[type=admin].roles.*"   // all roles of admin users

// Multiple wildcards
"organizations.*.teams.*.members.*" // all members in all teams
```

# Part 3: Filters and Operators

## Basic Filters

### Comparison Operators
```javascript
// Available operators: =, >, <, >=, <=, ~
"users[age>21]"               // users over 21
"users[name=John]"            // exact name match
"users[score>=100]"           // score greater or equal to 100
"users[price<50]"             // price less than 50

const data = {
  users: [
    { name: "John", age: 25, score: 100 },
    { name: "Jane", age: 31, score: 150 },
    { name: "Bob", age: 17, score: 90 }
  ]
};

select("users[age>=30]", data)   // [Jane's object]
select("users[score>90]", data)  // [John's and Jane's objects]
```

### Regular Expression Operator (~)
```javascript
// Regex matching using ~
"users[email~@gmail\.com$]"    // Gmail users
"products[name~^iPhone]"       // Products starting with iPhone
"files[path~\.pdf$]"          // PDF files

const data = {
  users: [
    { email: "john@gmail.com", name: "John Smith" },
    { email: "jane@yahoo.com", name: "Jane Smith" },
    { email: "bob@gmail.com", name: "Bob Jones" }
  ]
};

select("users[email~gmail]", data)      // Gmail users
select("users[name~^J]", data)          // Names starting with J
```

### Type Matching
```javascript
// Match by value type
"users[age=null]"              // Users with no age
"items[price=undefined]"       // Items with no price
"config[debug=true]"           // Debug settings

const data = {
  values: [
    { id: 1, value: null },
    { id: 2, value: 42 },
    { id: 3, value: "string" }
  ]
};

select("values[value=null]", data)      // Null values
```

## Complex Filters

### Property Existence
```javascript
// Check if property exists
"users[address]"               // Users with address property
"files[!metadata]"             // Files without metadata

const data = {
  users: [
    { name: "John", address: {} },
    { name: "Jane" },
    { name: "Bob", address: null }
  ]
};

select("users[address]", data)          // Users with address property
select("users[!address]", data)         // Users without address property
```

### Array Content Filters
```javascript
// Filter by array contents
"users[roles~admin]"           // Users with admin role
"posts[tags~urgent]"           // Posts tagged as urgent

const data = {
  users: [
    { name: "John", roles: ["admin", "user"] },
    { name: "Jane", roles: ["user"] },
    { name: "Bob", roles: ["moderator", "user"] }
  ]
};

select("users[roles~admin]", data)       // Admin users
select("users[roles~moderator]", data)   // Moderator users
```

### Nested Property Filters
```javascript
// Filter on nested properties
"users[address.country=USA]"    // Users from USA
"orders[items.price>100]"       // Orders with expensive items

const data = {
  users: [
    { 
      name: "John",
      address: { country: "USA", city: "NY" }
    },
    { 
      name: "Jane",
      address: { country: "UK", city: "London" }
    }
  ]
};

select("users[address.country=USA]", data)  // US users
```

### Multiple Conditions in Filter
```javascript
// Multiple conditions in single filter
"users[age>21 & status=active]"    // Active users over 21
"products[stock>0 & price<100]"    // Available products under 100

const data = {
  users: [
    { name: "John", age: 25, status: "active" },
    { name: "Jane", age: 31, status: "inactive" },
    { name: "Bob", age: 19, status: "active" }
  ]
};

select("users[age>20 & status=active]", data)  // Active users over 20
```

# Part 4: Logical Combinations and Negation

## Logical Operators

### AND Operator (&)
```javascript
// Combine multiple conditions with &
"users[age>21] & users[active=true]"    // Active users over 21
"products[inStock=true] & products[price<100]"  // Available cheap products

const data = {
  users: [
    { name: "John", age: 25, active: true },
    { name: "Jane", age: 31, active: false },
    { name: "Bob", age: 19, active: true }
  ]
};

// Multiple independent conditions
select("users[age>20] & users[active=true]", data)  // [John's object]
```

### OR Operator (|)
```javascript
// Combine alternatives with |
"users[role=admin] | users[role=moderator]"  // Admins or moderators
"items[featured=true] | items[onSale=true]"  // Featured or sale items

const data = {
  users: [
    { name: "John", role: "admin" },
    { name: "Jane", role: "moderator" },
    { name: "Bob", role: "user" }
  ]
};

select("users[role=admin] | users[role=moderator]", data)  // [John's and Jane's objects]
```

## Negation

### Negating Filters (!)
```javascript
// Inside filters
"users[!active=true]"          // Non-active users
"files[!type=pdf]"            // Non-PDF files
"users[!age>21]"              // Users not over 21

const data = {
  users: [
    { name: "John", active: true, age: 25 },
    { name: "Jane", active: false, age: 31 },
    { name: "Bob", active: true, age: 19 }
  ]
};

select("users[!active=true]", data)     // [Jane's object]
select("users[!age>20]", data)          // [Bob's object]
```

### Negating Selectors
```javascript
// Negate entire selectors
"!users[role=admin]"           // All users except admins
"!**.deleted=true"            // All items except deleted ones

const data = {
  items: [
    { id: 1, deleted: true },
    { id: 2, deleted: false },
    { id: 3, deleted: true }
  ]
};

select("!items[deleted=true]", data)    // [id:2 object]
```

## Complex Combinations

### Precedence and Grouping
```javascript
// Operator precedence: ! > & > |
// Use parentheses for explicit grouping
"(users[role=admin] | users[role=mod]) & users[active=true]"

const data = {
  users: [
    { name: "John", role: "admin", active: false },
    { name: "Jane", role: "mod", active: true },
    { name: "Bob", role: "user", active: true }
  ]
};

// Different results with different grouping
select("users[role=admin] | users[role=mod] & users[active=true]", data)
select("(users[role=admin] | users[role=mod]) & users[active=true]", data)
```

### Advanced Combinations
```javascript
const data = {
  documents: [
    { type: "pdf", size: 1024, archived: true, owner: "John" },
    { type: "doc", size: 512, archived: false, owner: "Jane" },
    { type: "pdf", size: 2048, archived: false, owner: "Bob" }
  ]
};

// Complex document queries
select("!documents[archived=true] & (documents[size>1000] | documents[type=doc])", data)

// Multiple negations
select("!documents[archived=true] & !documents[owner~^J]", data)

// Combining wildcards with negation
select("!**.system & **.active=true", data)
```

### Real-world Examples
```javascript
// Find active premium users who aren't in restricted regions
"users[premium=true] & users[active=true] & !users[region~^(CN|RU)$]"

// Find available products that are either featured or on sale but not both
"products[stock>0] & (products[featured=true] & !products[onSale=true] | !products[featured=true] & products[onSale=true])"

// Find non-archived documents accessible to current user
"!documents[archived=true] & (documents[public=true] | documents[owner=${userId}] | documents[sharedWith~${userId}])"
```

# Part 5: Advanced Usage and Examples

## Pattern Recognition and Common Use Cases

### Handling Hierarchical Data
```javascript
const data = {
  organization: {
    departments: [
      {
        name: "Engineering",
        teams: [
          {
            name: "Frontend",
            members: [
              { name: "John", level: "senior" },
              { name: "Jane", level: "mid" }
            ]
          },
          {
            name: "Backend",
            members: [
              { name: "Bob", level: "senior" }
            ]
          }
        ]
      }
    ]
  }
};

// Find all senior engineers across teams
select("**.members[level=senior]", data)

// Find specific team members
select("**.teams[name=Frontend].members.*.name", data)

// Complex team queries
select("**.teams[name~^(Front|Back)end].members[level=senior]", data)
```

### Working with Collections
```javascript
const data = {
  products: [
    { 
      id: "p1",
      variants: [
        { color: "red", sizes: ["S", "M"], stock: 5 },
        { color: "blue", sizes: ["M", "L"], stock: 0 }
      ],
      categories: ["clothing", "new"]
    }
  ]
};

// Find products with any in-stock variants
select("products[variants.*.stock>0]", data)

// Find products with specific size availability
select("products[variants.*.sizes~M]", data)

// Complex category matching
select("products[categories~clothing] & products[categories~new]", data)
```

### Data Transformation Patterns

#### Finding Related Data
```javascript
const data = {
  users: [
    { id: "u1", name: "John" }
  ],
  orders: [
    { id: "o1", userId: "u1", items: ["p1", "p2"] }
  ],
  products: [
    { id: "p1", name: "Laptop" },
    { id: "p2", name: "Mouse" }
  ]
};

// Find user's orders
select("orders[userId=u1]", data)

// Find active products in orders
select("products[id~^(p1|p2)$]", data)
```

#### Handling Nested Arrays
```javascript
const data = {
  playlists: [
    {
      name: "Favorites",
      tracks: [
        {
          title: "Song 1",
          artists: ["Artist 1", "Artist 2"],
          tags: ["rock", "popular"]
        }
      ]
    }
  ]
};

// Find tracks by artist
select("**.tracks[artists~Artist 1]", data)

// Find tracks by multiple criteria
select("**.tracks[tags~rock & artists~Artist 1]", data)
```

## Advanced Techniques

### Dynamic Queries
```javascript
// Using template literals for dynamic values
const userId = "user123";
const minAge = 25;

select(`users[id=${userId}] & users[age>${minAge}]`, data)

// Building complex dynamic queries
const roles = ["admin", "moderator"];
const rolePattern = `^(${roles.join("|")})$`;
select(`users[role~${rolePattern}]`, data)
```

### Performance Optimization
```javascript
// Prefer specific paths over deep wildcards
// Less efficient:
select("**.name", data)

// More efficient:
select("users.*.name", data)

// Combine filters instead of multiple selectors
// Less efficient:
select("users[age>21] & users[active=true] & users[role=admin]", data)

// More efficient:
select("users[age>21 & active=true & role=admin]", data)
```

### Error Handling Patterns
```javascript
const data = {
  config: {
    features: {
      darkMode: true
    }
  }
};

// Handle missing data gracefully
const darkMode = select("config.features.darkMode", data) ?? false;

// Provide defaults for arrays
const users = select("users.*.name", data) || [];

// Check existence before complex queries
const hasFeature = select("config.features[darkMode=true]", data) !== undefined;
```

# Part 6: Return Value Rules and Error Handling

## Return Value Types

### Single Values
```javascript
const data = {
  user: {
    name: "John",
    settings: {
      theme: "dark"
    }
  }
};

// Single value returns
select("user.name", data)              // "John"
select("user.settings.theme", data)    // "dark"
select("user.age", data)               // undefined
```

### Arrays
```javascript
const data = {
  users: [
    { name: "John", active: true },
    { name: "Jane", active: true },
    { name: "Bob", active: false }
  ]
};

// Array returns
select("users.*.name", data)           // ["John", "Jane", "Bob"]
select("users[active=true].name", data) // ["John", "Jane"]
select("users[age>20].name", data)     // []
```

### Type Conversion Rules
```javascript
const data = {
  items: [
    { id: "1", value: "100" },
    { id: "2", value: "200" }
  ]
};

// Automatic number conversion for comparisons
select("items[value>150]", data)       // [id:2 object]

// String comparisons
select("items[id~^[12]$]", data)       // [both objects]
```

## Error Handling

### Missing Properties
```javascript
const data = {
  user: {
    name: "John"
  }
};

// All these are safe:
select("user.address.street", data)     // undefined
select("user.contacts[0].email", data)  // undefined
select("unknown.property", data)        // undefined
```

### Invalid Selectors
```javascript
// All these return undefined instead of throwing:
select("user[].name", data)            // undefined
select("user[[]]", data)               // undefined
select("][invalid", data)              // undefined
```

### Type Mismatches
```javascript
const data = {
  items: [
    { id: 1, tags: ["a", "b"] },
    { id: 2, tags: "single" },
    { id: 3, tags: null }
  ]
};

// Safe handling of type mismatches
select("items.*.tags[0]", data)        // ["a", undefined, undefined]
select("items[tags~a]", data)          // [id:1 object]
```

## Best Practices

### Defensive Programming
```javascript
// Always handle undefined cases
const userName = select("user.name", data) ?? "Anonymous";

// Check array existence before mapping
const userNames = select("users.*.name", data) || [];

// Validate existence before complex operations
const userSettings = select("user.settings", data);
const theme = userSettings ? select("user.settings.theme", data) : "default";
```

### Common Patterns
```javascript
// Optional chaining alternative
const street = select("user.address.street", data) ?? "No address";

// Default arrays
const tags = select("post.tags", data) || [];

// Type checking
const isAdmin = select("user.role", data) === "admin";
```

### Debugging Tips
```javascript
// Check existence
const hasProperty = select("deep.nested.property", data) !== undefined;

// Verify array contents
const results = select("items[complex=filter]", data) || [];
console.log(`Found ${results.length} matches`);

// Trace selection path
const intermediate = select("first.step", data);
if (intermediate === undefined) {
    console.log("First step failed");
}
```

## Edge Cases

### Empty Values
```javascript
const data = {
  values: {
    empty: "",
    zero: 0,
    nil: null,
    undef: undefined,
    falsy: false
  }
};

// All these are distinct:
select("values[empty='']", data)       // matches
select("values[nil=null]", data)       // matches
select("values[undef=undefined]", data) // matches
select("values[falsy=false]", data)    // matches
```

### Special Characters
```javascript
const data = {
  "special-key": 123,
  "nested.key": 456,
  "array[0]": 789
};

// Accessing special property names
select("['special-key']", data)        // 123
select("['nested.key']", data)         // 456
select("['array[0]']", data)           // 789
```

# Part 7: Performance Considerations and Best Practices

## Performance Optimization

### Selector Optimization
```javascript
// Less Efficient (searches entire tree)
"**.name"                              

// More Efficient (searches specific path)
"users.*.name"                         

// Less Efficient (multiple separate filters)
"users[age>21] & users[active=true]"   

// More Efficient (combined filter)
"users[age>21 & active=true]"          

const data = {
  users: [/* many users */],
  posts: { comments: [/* many comments */] }
};

// Less Efficient
select("**[type=comment]", data)

// More Efficient
select("posts.comments[type=comment]", data)
```

### Memory Usage

#### Avoiding Memory Bloat
```javascript
// Less Efficient (keeps all intermediate results)
const allData = select("**.data", largeData);
const filtered = select("allData[size>1000]", { allData });

// More Efficient (filters during traversal)
const result = select("**[data.size>1000].data", largeData);
```

#### Working with Large Datasets
```javascript
// Break down large queries into specific paths
const activeUsers = select("users[active=true]", data);
const activeAdmins = select("users[active=true & role=admin]", data);

// Use specific paths instead of deep searches
const recentComments = select("posts.*.comments[-10:]", data);
```

## Best Practices

### Selector Design
```javascript
// Good: Clear and specific
"users[active=true].settings.notifications"

// Better: Combined filters when possible
"users[active=true & role=admin].permissions"

// Good: Explicit paths
"organization.departments.*.teams.*.members"

// Avoid: Unnecessary deep searches
// Bad: "**.members"
// Good: "departments.*.teams.*.members"
```

### Error Prevention
```javascript
// Defensive selecting
function getUserName(userData) {
    const firstName = select("name.first", userData) ?? "";
    const lastName = select("name.last", userData) ?? "";
    return `${firstName} ${lastName}`.trim() || "Anonymous";
}

// Safe array operations
function getActiveUsers(data) {
    return select("users[active=true]", data) || [];
}

// Type-safe selections
function isUserAdmin(user) {
    return select("permissions[role=admin]", user) !== undefined;
}
```

### Maintainable Patterns

#### Query Building
```javascript
// Build complex queries programmatically
function buildUserQuery(filters) {
    const conditions = [];
    if (filters.age) conditions.push(`age>${filters.age}`);
    if (filters.role) conditions.push(`role=${filters.role}`);
    
    return conditions.length 
        ? `users[${conditions.join(" & ")}]`
        : "users";
}
```

#### Reusable Selectors
```javascript
const SELECTORS = {
    ACTIVE_USERS: "users[active=true]",
    ADMIN_USERS: "users[role=admin]",
    RECENT_POSTS: "posts[-10:]",
    USER_SETTINGS: (userId) => `users[id=${userId}].settings`
};

// Usage
select(SELECTORS.ACTIVE_USERS, data);
select(SELECTORS.USER_SETTINGS(currentUserId), data);
```

## Advanced Use Cases

### Composition and Chaining
```javascript
// Complex data transformations
function getTeamMembers(data) {
    const teams = select("organization.teams", data) || [];
    const activeTeams = select("teams[active=true]", { teams }) || [];
    const members = select("activeTeams.*.members", { activeTeams }) || [];
    return select("members[role!=guest]", { members }) || [];
}
```

### Integration Patterns
```javascript
// API Response handling
async function fetchUserData(userId) {
    const response = await api.fetch(`/users/${userId}`);
    const data = await response.json();
    
    return {
        name: select("user.profile.name", data),
        settings: select("user.settings", data) ?? defaultSettings,
        permissions: select("user.roles.*.permissions", data) || []
    };
}

// Event handling
function handleDataUpdate(newData) {
    const changedSettings = select("changes.settings.*", newData) || [];
    const criticalChanges = select("changes[priority=high]", newData) || [];
    
    if (criticalChanges.length > 0) {
        notifyAdmin(criticalChanges);
    }
}
```

### Testing and Debugging
```javascript
// Test helpers
function assertSelector(selector, data, expected) {
    const result = select(selector, data);
    console.assert(
        JSON.stringify(result) === JSON.stringify(expected),
        `Selector "${selector}" failed`
    );
}

// Debug helpers
function debugSelector(selector, data) {
    console.log({
        selector,
        result: select(selector, data),
        dataSize: JSON.stringify(data).length
    });
}
```
