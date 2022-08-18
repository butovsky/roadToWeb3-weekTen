import Link from "next/link";

export default function Post(props) {
    const { post, withLink } = props;

    const returnedDOM = (
        <div className="p-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
            <div className="md:flex">
                <div className="p-8">
                <p className="mt-2 text-xs text-slate-500 whitespace-pre-line">
                <Link href={`/profile/${post.profile.id}`}>
                <div className="w-auto mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-l mb-2">
                    <div className="md:flex items-center">
                        <div className="md:shrink-0 mr-2">
                        {post.profile && post.profile.picture ? (
                            <img
                            src={
                                post.profile.picture.original
                                ? post.profile.picture.original.url
                                : post.profile.picture.uri
                            }
                            className="h-7 w-full object-cover"
                            />
                        ) : (
                            <div
                            style={{
                                backgrondColor: "gray",
                            }}
                            className="h-7 w-full object-cover"
                            />
                        )}
                        </div>
                        <div className="block mt-1 text-sm leading-tight font-medium text-black hover:underline">
                            {`@${post.profile.handle}`}
                        </div>
                        <div className="w-3"/>
                    </div>
                    </div>
                </Link>
                    {post.metadata.content}
                </p>
                </div>
            </div>
            </div>
        </div>
    )
    return (withLink ? <Link href={`${window.location.href}/post/${post.id}`}>{returnedDOM}</Link> : returnedDOM);
  }