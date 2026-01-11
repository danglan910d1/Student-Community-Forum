"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Tag, Hash, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

export function SearchBar({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  // Hook này đã được fix types ở bước trước
  const { results, isLoading, mode } = useGlobalSearch(query);

  const navigate = (url: string) => {
    setOpen(false);
    setQuery("");
    router.push(url);
  };
  console.log(results);

  return (
    <>
      {/* Trigger */}
      <div className={className} onClick={() => setOpen(true)}>
        <Input
          readOnly
          placeholder="Tìm kiếm bài viết, [thẻ], chủ đề..."
          className="w-full cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-2xl overflow-hidden">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Tìm kiếm hệ thống</DialogTitle>
              {/* Thêm dòng này để fix lỗi aria-describedby */}
              <DialogDescription>
                Tìm kiếm bài viết theo từ khóa, thẻ, chủ đề hoặc tác giả.
              </DialogDescription>
            </VisuallyHidden>
          </DialogHeader>

          <Command
            shouldFilter={false}
            className="rounded-none border-none mt-5 px-3"
          >
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Gõ để tìm kiếm hoặc [tag], topic:slug..."
              className="h-12"
            />

            <CommandList className="max-h-[450px] border-t mt-2">
              {query.length === 0 && <SearchHelp />}

              {/* 2. Tiếp theo là Loading - Luôn hiện Loader ngay khi đang fetch hoặc đang chờ debounce */}
              {isLoading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {/* 3. Logic "Không tìm thấy" - Chỉ hiện khi KHÔNG load, CÓ query và KHÔNG có data */}
              {!isLoading &&
                query.trim().length > 0 &&
                results.posts.length === 0 &&
                results.tags.length === 0 &&
                results.topics.length === 0 && (
                  <CommandEmpty className="py-10 text-center text-muted-foreground">
                    Không tìm thấy kết quả cho &quot;{query}&quot;
                  </CommandEmpty>
                )}

              {/* 4. Nhóm kết quả: Bài viết */}
              {!isLoading && results.posts.length > 0 && (
                <CommandGroup
                  heading={mode.isTag ? "Bài viết gắn thẻ này" : "Bài viết"}
                >
                  {results.posts.map((post) => (
                    <CommandItem
                      key={post.postId}
                      onSelect={() =>
                        navigate(`/posts/${post.postId}/${post.slug}`)
                      }
                      className="cursor-pointer py-3"
                    >
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium line-clamp-1">
                          {post.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          bởi {post.user?.name} • {post.views_count} lượt xem
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* 5. Nhóm kết quả: Thẻ (Ẩn khi đang ở chế độ search tag cụ thể) */}
              {!mode.isTag && results.tags.length > 0 && (
                <CommandGroup heading="Thẻ liên quan">
                  {results.tags.map((tag) => (
                    <CommandItem
                      key={tag.tagId}
                      onSelect={() => navigate(`/posts?tagSlug=${tag.slug}`)}
                      className="cursor-pointer"
                    >
                      <Tag className="mr-2 h-4 w-4 text-blue-500" />
                      <span>{tag.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* 6. Nhóm kết quả: Chủ đề */}
              {!mode.isTopic && results.topics.length > 0 && (
                <CommandGroup heading="Chủ đề">
                  {results.topics.map((topic) => (
                    <CommandItem
                      key={topic.topicId}
                      onSelect={() =>
                        navigate(`/posts?topicSlug=${topic.slug}`)
                      }
                      className="cursor-pointer"
                    >
                      <Hash className="mr-2 h-4 w-4 text-orange-500" />
                      <span>{topic.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchHelp() {
  return (
    <div className="p-4 text-sm border-b">
      <p className="mb-3 font-medium text-muted-foreground">
        Cú pháp tìm kiếm nâng cao:
      </p>
      <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-3">
        <Hint
          syntax="[tag-slug]"
          text="Tìm bài viết theo nhãn (vd: [reactjs])"
        />
        <Hint
          syntax="topic:slug"
          text="Lọc theo chuyên mục (vd: topic:javascript)"
        />
        <Hint syntax="user:name" text="Tìm bài viết của tác giả cụ thể" />
        <Hint
          syntax="từ khoá"
          text="Tìm kiếm toàn văn theo tiêu đề và nội dung"
        />
      </div>
    </div>
  );
}

function Hint({ syntax, text }: { syntax: string; text: string }) {
  return (
    <>
      <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono text-primary flex items-center justify-center">
        {syntax}
      </code>
      <span className="text-muted-foreground flex items-center">{text}</span>
    </>
  );
}
