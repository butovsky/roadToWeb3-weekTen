import { client } from '../../apollo-client';
import { gql } from '@apollo/client'

export default gql`
  query($request: ChallengeRequest!) {
    challenge(request: $request) { text }
  }
`