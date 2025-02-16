# factorygirl

A solution for generating deterministic test data. Inspired by the [`factory_girl`](https://github.com/thoughtbot/factory_bot) Gem.

## API

### `factory<T>`

Factory accepts 2 parameters:

1. A function that creates the "base" (marker 1)
2. A function that handles customization based on traits. (marker 2)

And it returns a function, which then receives:

1. Overrides - any properties to override from the base.
2. Traits - a list of traits to apply.

Here's an API example for an imaginary web portal for a library.

```ts
type User = {
    name: string
    level: "user" | "administrator"
    isAdmin: boolean
    checkedOutBooks: Book[]
}
type UserTraits = "admin" | "has checked out books"

type Book = {
    name: string
    genre: string
    checkedOut: boolean
}
type Genre = "fantasy" | "fiction" | "non-fiction" // so on
type BookTraits = Genre | "checked out"

const createBook = factory<Book, BookTraits>(
    (utils) => ({ // <- Marker 1
        name: "The Great Gatsby",
        genre: "fiction",
    }),
    ({ trait }) => { // <- Marker 2
        trait("checked out", {
            checkedOut: true,
        })
        ;(["fantasy", "fiction", "non-fiction"] as Genre[]).forEach(genre => trait(genre, { genre }))
    },
)

const createUser = factory<User, UserTraits>(
    (utils) => ({
        name: `testuser${utils.sequentialValue('id')}`,
        level: "user",
        isAdmin: false,
    }),
    ({ trait }) => {
        // the second argument here will be merged directly back into the user object
        trait("isAdmin", {
            isAdmin: true,
            level: "administrator",
        })

        // the trait names are validated by TS, but can be whatever you want
        trait("has checked out books", (utils) => ({ // <- Marker 3
            books: [createBook(['checked out'])],
        }))
    }
)

const myUser = createUser()
// with overrides:
const myUserWithName = createUser({name: "Overridden Name"})
// with a trait:
const myUser2 = createUser({}, ["has checked out books"])
```

### Utils

`utils` is an object with utility functions. It is passed as a parameter to:

- The function that creates the base object (marker 1)
- The function that creates a trait (marker 3)

It has the following functions:

- `sequentialValue(category?: string | undefined)` - generates a sequential number.
- `sequentialUuid(category?: string | undefined)` - generates a sequential UUID.

**Note the category parameter**. Unless it's specified, every single use of either function would count towards the associated internal counters.
This means that in this scenario:

```ts
const createBook = factory<Book, BookTraits>(
    (utils) => ({
        name: `My Excellent Book #${utils.sequentialValue()}`,
        author: `Author #${utils.sequentialValue()}`,
        isbn: utils.sequentialValue(),
        genre: "fiction",
    }),
)

const book = createBook()
```

Book will be: `{ name: "My Excellent Book #0", author: "Author #1", isbn: 2 }`

Obviously, it doesn't make sense to have it increment like that, since authors and ISBNs are separate entities.
Each category will have its own unique counter. In this case, you'd want to instead do:

```ts
const createBook = factory<Book, BookTraits>(
    (utils) => ({
        name: `My Excellent Book #${utils.sequentialValue('name')}`,
        author: `Author #${utils.sequentialValue('author')}`,
        isbn: utils.sequentialValue('isbn'),
        genre: "fiction",
    }),
)

const book = createBook()
```

Which would yield `0` for each sequentialValue call.
