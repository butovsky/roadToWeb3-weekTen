import { gql } from "@apollo/client";

export default gql`
query($request: VerifyRequest!) {
  verify(request: $request)
}`