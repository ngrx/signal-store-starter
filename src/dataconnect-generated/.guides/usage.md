# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.


### Angular

The generated SDK creates injectable wrapper functions.

Here's an example:
```
import { injectCreateMovie, injectUpsertUser, injectAddReview, injectDeleteReview, injectListMovies, injectListUsers, injectListUserReviews, injectGetMovieById, injectSearchMovie } from '@dataconnect/generated/angular';

@Component({
  selector: 'my-component',
  ...
})
class MyComponent {
  // The types of these injectors are available in angular/index.d.ts
  private readonly CreateMovieOperation = injectCreateMovie(createMovieVars);
  private readonly UpsertUserOperation = injectUpsertUser(upsertUserVars);
  private readonly AddReviewOperation = injectAddReview(addReviewVars);
  private readonly DeleteReviewOperation = injectDeleteReview(deleteReviewVars);
  private readonly ListMoviesOperation = injectListMovies();
  private readonly ListUsersOperation = injectListUsers();
  private readonly ListUserReviewsOperation = injectListUserReviews();
  private readonly GetMovieByIdOperation = injectGetMovieById(getMovieByIdVars);
  private readonly SearchMovieOperation = injectSearchMovie(searchMovieVars);
  }
```

Each operation is a wrapper function around Tanstack Query Angular.

Here's an example:
```ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'simple-example',
  template: `
    @if (movies.isPending()) {
      Loading...
    }
    @if (movies.error()) {
      An error has occurred: {{ movies.error().message }}
    }
    @if (movies.data(); as data) {
      @for (movie of data.movies ; track
        movie.id) {
      <h1>{{ movie.title }}</h1>
      <p>{{ movie.synopsis }}</p>
      }
    }
  `
})
export class SimpleExampleComponent {
  http = inject(HttpClient)

  movies = injectListMovies();
}
```




## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createMovie, upsertUser, addReview, deleteReview, listMovies, listUsers, listUserReviews, getMovieById, searchMovie } from '@dataconnect/generated';


// Operation CreateMovie:  For variables, look at type CreateMovieVars in ../index.d.ts
const { data } = await CreateMovie(dataConnect, createMovieVars);

// Operation UpsertUser:  For variables, look at type UpsertUserVars in ../index.d.ts
const { data } = await UpsertUser(dataConnect, upsertUserVars);

// Operation AddReview:  For variables, look at type AddReviewVars in ../index.d.ts
const { data } = await AddReview(dataConnect, addReviewVars);

// Operation DeleteReview:  For variables, look at type DeleteReviewVars in ../index.d.ts
const { data } = await DeleteReview(dataConnect, deleteReviewVars);

// Operation ListMovies: 
const { data } = await ListMovies(dataConnect);

// Operation ListUsers: 
const { data } = await ListUsers(dataConnect);

// Operation ListUserReviews: 
const { data } = await ListUserReviews(dataConnect);

// Operation GetMovieById:  For variables, look at type GetMovieByIdVars in ../index.d.ts
const { data } = await GetMovieById(dataConnect, getMovieByIdVars);

// Operation SearchMovie:  For variables, look at type SearchMovieVars in ../index.d.ts
const { data } = await SearchMovie(dataConnect, searchMovieVars);


```