import { useQuery, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import fetchPostQuery from "../../../../queries/fetchPostQuery.js";
import Post from "../../../../components/Post.js";

// challenge 10

export default function ProfilePage() {
  const router = useRouter();
  const { post } = router.query;

  console.log("fetching post for", post);
  const { loading: postLoading, error: postError, data: postData } = useQuery(fetchPostQuery, {
    variables: {
      request: {
        publicationIds: [post]
      },
    },
  });
  
  console.log("fetching comments for", post)
  const { loading: commentsLoading, error: commentsError, data: commentsData } = useQuery(fetchPostQuery, {
    variables: {
      request: {
        commentsOf: post
      },
    },
  });

  if (postLoading || commentsLoading) return "Loading..";
  if (postError || commentsError) return `Error! ${(postError || commentsError).message}`;

  return (
    <div className="flex flex-col p-8 items-center">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Post</div>
        <Post withLink={false} post={postData.publications.items[0]}/>
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Comments</div>
        <div className="flex flex-row flex-wrap">
            {commentsData.publications.items.map((post, idx) => {
                return <Post withLink={false} key={idx} post={post}/>;
            })}
        </div>
    </div>
  );
}