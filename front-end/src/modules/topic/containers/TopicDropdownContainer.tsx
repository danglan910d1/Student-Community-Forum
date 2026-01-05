"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GenericDropdown } from "@/components/shared/GenericDropdown";
import { useTopicStore } from "@/stores/useTopicStore";
import { useTopicsQuery } from "../hooks/useTopicsQuery";
import { getSortedTopicItems } from "../utils/getTopic";
import { TOPIC } from "../constants/topic";

export const TopicDropdownContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSlug = searchParams.get("topic");

  const { data: serverTopics } = useTopicsQuery();
  const { topics, setTopics } = useTopicStore();

  useEffect(() => {
    if (serverTopics) setTopics(serverTopics);
  }, [serverTopics, setTopics]);

  const dropdownItems = useMemo(() => getSortedTopicItems(topics), [topics]);

  const handleSelect = useCallback(
    (slug: string) => {
      router.push(`/posts?topic=${slug}`);
    },
    [router]
  );

  return (
    <GenericDropdown
      label={TOPIC.DROPDOWN}
      items={dropdownItems}
      onSelect={handleSelect}
      activeValue={currentSlug || ""}
    />
  );
};
