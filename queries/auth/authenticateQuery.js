import { client } from '../../apollo-client';
import { gql } from '@apollo/client'

export default gql `
  mutation($request: SignedAuthChallenge!) { 
    authenticate(request: $request) {
      accessToken
      refreshToken
    }
 }
`

export const authenticate = (address, signature) => {
   return client.mutate({
    mutation: gql(AUTHENTICATION),
    variables: {
      request: {
        address,
        signature,
      },
    },
  })
}