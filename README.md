# factorygirl

A solution for generating deterministic test data. Inspired by the [`factory_girl`](https://github.com/thoughtbot/factory_bot) Gem.

## API

### `factory<T>`

Factory accepts 2 parameters:

1. A function that handles customization based on traits
2. A function that creates the "base"

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
    (utils) => ({
        name: "The Great Gatsby",
        genre: "fiction",
    }),
    ({ trait }) => {
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
        trait("has checked out books", () => ({
            books: [createBook(['checked out'])],
        }))
    }
)

const myUser = createUser()
const myUser2 = createUser(["has checked out books"])
```
