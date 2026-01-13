import MDEditor from "@uiw/react-md-editor";
import { Badge } from "@/components/ui/badge";
import { IPost } from "../../types";
import Link from "next/link";
import { AuthorCard } from "@/components/shared/AuthorCard";

export function PostDetailBody({ post }: { post: IPost }) {
  return (
    <div className="flex gap-4 sm:gap-6">
      {/* VOTE SIDEBAR */}
      {/* <div className="flex flex-col items-center gap-3">
        <Button variant="outline" size="icon" className="rounded-full shrink-0">
          <ChevronUp className="h-5 w-5" />
        </Button>
        <span className="text-xl font-bold">{post.likes_count}</span>
        <Button variant="outline" size="icon" className="rounded-full shrink-0">
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div> */}

      {/* CONTENT AREA */}
      <div className="flex-1 min-w-0">
        <article className="min-h-[300px] space-y-8">
          <div
            data-color-mode="light"
            className="prose dark:prose-invert max-w-none"
          >
            <MDEditor.Markdown
              source={post.content}
              style={{
                backgroundColor: "transparent",
                color: "inherit",
              }}
            />
          </div>

          {/* TAGS*/}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.tagId} variant="outline" asChild>
                <Link href={`/posts?tag=${tag.slug}`}>{tag.name}</Link>
              </Badge>
            ))}
          </div>

          {/* AUTHOR CARD */}
          <div className="flex justify-end border-t pt-6">
            <AuthorCard user={post.user} createdAt={post.createdAt} />
          </div>
        </article>
      </div>
    </div>
  );
}
