"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { orpc } from "@/lib/orpc";
import { MessageItem } from "./_message/message-item";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/general/empty-state";

export function ChannelMessageList() {
  const { channelId } = useParams<{ channelId: string }>();

  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const lastItemIdRef = useRef<string | undefined>(undefined);

  const infiniteOptions = orpc.message.list.infiniteOptions({
    input: (pageParam: string | undefined) => ({
      channelId: channelId,
      cursor: pageParam,
      limit: 30,
    }),
    queryKey: ["message.list", channelId],
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: [...data.pages]
        .map((p) => ({
          ...p,
          items: [...p.items].reverse(),
        }))
        .reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    isFetching,
  } = useInfiniteQuery({
    ...infiniteOptions,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const {
    data: { user },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  //scroll to bottom when messages first load
  useEffect(() => {
    if (!hasInitialScrolled && data?.pages.length) {
      const el = scrollRef.current;

      if (el) {
        bottomRef.current?.scrollIntoView({
          block: "end",
        });
        setHasInitialScrolled(true);
        setIsAtBottom(true);
      }
    }
  }, [hasInitialScrolled, data?.pages.length]);

  //keep view pinned to bottom on late content growth(e.g. images)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollToBottomIfNeeded = () => {
      if (isAtBottom || !hasInitialScrolled) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ block: "end" });
        });
      }
    };
    const onImageLoad = (e: Event) => {
      if (e.target instanceof HTMLImageElement) {
        scrollToBottomIfNeeded();
      }
    };
    el.addEventListener("load", onImageLoad, true);

    //resize observer watches for size changes in the container
    const resizeObserver = new ResizeObserver(() => {
      scrollToBottomIfNeeded();
    });
    resizeObserver.observe(el);

    //mutation observer watches for dom changes(e.g - images loading, content updates etc)
    const mutationObserver = new MutationObserver(() => {
      scrollToBottomIfNeeded();
    });

    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("load", onImageLoad, true);
      mutationObserver.disconnect();
    };
  }, [isAtBottom, hasInitialScrolled]);

  const isNearBottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= 80;

  const handleScroll = () => {
    const el = scrollRef.current;

    if (!el) return;

    if (el.scrollTop <= 80 && hasNextPage && !isFetching) {
      const prevScrollHeight = el.scrollHeight;
      const prevScrollTop = el.scrollTop;
      fetchNextPage().then(() => {
        const newScrollHeight = el.scrollHeight;
        el.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
      });
    }
    setIsAtBottom(isNearBottom(el));
  };

  const items = useMemo(() => {
    return data?.pages.flatMap((p) => p.items) ?? [];
  }, [data]);

  const isEmpty = !isLoading && !error && items.length === 0;

  useEffect(() => {
    if (!items.length) return;
    const lastId = items[items.length - 1].id;
    const prevLastId = lastItemIdRef.current;
    const el = scrollRef.current;
    if (prevLastId && lastId !== prevLastId) {
      if (el && isNearBottom(el)) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });
        setIsAtBottom(true);
      }
    }
    lastItemIdRef.current = lastId;
  }, [items]);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    bottomRef.current?.scrollIntoView({
      block: "end",
      behavior: "smooth",
    });
    setIsAtBottom(true);
  };

  return (
    <div className="relative h-full">
      <div
        onScroll={handleScroll}
        ref={scrollRef}
        className="h-full overflow-y-auto px-4 flex flex-col space-y-1"
      >
        {isEmpty ? (
          <div className="flex h-full pt-4">
            <EmptyState
              title="No messages yet"
              description="Start the conversation by sending the first message"
              buttonText="Send a message"
              href="#"
            />
          </div>
        ) : (
          items?.map((message) => (
            <MessageItem
              currentUserId={user.id}
              key={message.id}
              message={message}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      {isFetchingNextPage && (
        <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex items-center justify-center py-2">
          <div className="flex items-center gap-2 rounded-md bg-gradient-to-b from-white/80 to-transparent dark:from-neutral-900/80 backdrop-blur px-3 py-1">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Loading previous messages...
            </span>
          </div>
        </div>
      )}

      {!isAtBottom && (
        <Button
          onClick={scrollToBottom}
          type="button"
          variant="outline"
          size="sm"
          className="absolute bottom-4 right-6 z-20 size-10 cursor-pointer rounded-full hover:shadow-xl transition-all duration-200"
        >
          <ChevronDown className="size-4" />
        </Button>
      )}
    </div>
  );
}
