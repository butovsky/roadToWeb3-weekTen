import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client'

export const makeClient = () => {
    const httpLink = new HttpLink({ uri: 'https://api-mumbai.lens.dev/' });

    // example how you can pass in the x-access-token into requests using `ApolloLink`
    const authLink = new ApolloLink((operation, forward) => {
        // Retrieve the authorization token from local storage.
        const token = JSON.parse(localStorage.getItem('access_token'))?.value;

        // Use the setContext method to set the HTTP headers.
        operation.setContext({
            headers: {
            'x-access-token': token ? `Bearer ${token}` : ''
            }
        });

        // Call the next link in the middleware chain.
        return forward(operation);
    });

    return new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
    })
}