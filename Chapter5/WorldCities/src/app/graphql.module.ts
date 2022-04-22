import {NgModule} from '@angular/core';
import {ApolloModule, APOLLO_OPTIONS} from 'apollo-angular';
import {ApolloClientOptions, InMemoryCache} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import { environment } from '../environments/environment';

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  return {
    cache: new InMemoryCache({
      addTypename: false
    }),
    link: httpLink.create({
      uri: environment.baseUrl + 'api/graphql'
    }),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'no-cache' },
      query: { fetchPolicy: 'no-cache' }
    }
  };
}

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
