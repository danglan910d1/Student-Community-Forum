"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Tag, Hash, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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

  const { results, isLoading, mode } = useGlobalSearch(query);

  const navigate = (url: string) => {
    setOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
    <>
      {/* Trigger – 100% width, không icon dư */}
      <div className={className} onClick={() => setOpen(true)}>
        <Input
          readOnly
          placeholder="Tìm kiếm..."
          className="w-full cursor-pointer"
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-2xl">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Tìm kiếm</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>

          <Command shouldFilter={false} className="p-3 mt-2">
            {/* Input search */}
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Tìm bài viết, [tag], user:id, topic:name"
            />

            <CommandList>
              {/* Khi chưa nhập gì → hướng dẫn */}
              {query.length === 0 && <SearchHelp />}

              {/* Loading state KHÔNG làm mất layout */}
              {isLoading && (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}

              {!isLoading &&
                results.posts.length === 0 &&
                results.tags.length === 0 &&
                results.topics.length === 0 &&
                query.length > 0 && (
                  <CommandEmpty>Không tìm thấy kết quả</CommandEmpty>
                )}

              {!mode.isUserSearch &&
                !mode.isTopicSearch &&
                results.posts.length > 0 && (
                  <CommandGroup heading="Bài viết">
                    {results.posts.map((p) => (
                      <CommandItem
                        key={p.postId}
                        onSelect={() =>
                          navigate(`/posts/${p.postId}/${p.slug}`)
                        }
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {p.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

              {!mode.isUserSearch && results.tags.length > 0 && (
                <CommandGroup heading="Thẻ">
                  {results.tags.map((t) => (
                    <CommandItem
                      key={t.tagId}
                      onSelect={() => navigate(`/posts?tag=${t.slug}`)}
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      {t.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {!mode.isTagSearch &&
                !mode.isUserSearch &&
                results.topics.length > 0 && (
                  <CommandGroup heading="Chủ đề">
                    {results.topics.map((tp) => (
                      <CommandItem
                        key={tp.topicId}
                        onSelect={() => navigate(`/posts?topics=${tp.slug}`)}
                      >
                        <Hash className="mr-2 h-4 w-4" />
                        {tp.name}
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
    <div className="p-4 text-sm">
      <div className="grid grid-cols-[90px_1fr] gap-x-4 gap-y-2">
        <Hint syntax="[tag]" text="Tìm trong thẻ" />
        <Hint syntax='"keyword"' text="Cụm từ chính xác" />
        <Hint syntax="user:id" text="Theo tác giả" />
        <Hint syntax="topic:name" text="Theo chủ đề" />
      </div>
    </div>
  );
}

function Hint({ syntax, text }: { syntax: string; text: string }) {
  return (
    <>
      <code className="bg-muted px-2 py-0.5 rounded text-xs">{syntax}</code>
      <span className="text-muted-foreground">{text}</span>
    </>
  );
}
