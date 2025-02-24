import { useInfiniteQuery } from "@tanstack/react-query";

import { GET_QUERY_KEY } from "../keys";

import { getQuery } from "@/api";
import { GetQueryRequest } from "@/@types";
import useClientStore from "@/store/client";
import { createUUID, validateResponse } from "@/lib/utils";

export const useGetEvents = () => {
  const PAGINIATION_LIMIT = 100;

  const project = useClientStore((state) => state.project);
  const timePeriod = useClientStore((state) => state.activityTimePeriod);
  const filterTestAccounts = useClientStore(
    (state) => state.filterTestAccounts
  );

  // Craft the payload that we will send to the server
  const payload: Omit<GetQueryRequest, "client_query_id"> = {
    project_id: project!,
    query: {
      after: timePeriod,
      kind: "EventsQuery",
      filterTestAccounts: filterTestAccounts,
      orderBy: ["timestamp DESC"],
      select: [
        "*",
        "event",
        "coalesce(properties.$current_url, properties.$screen_name) -- Url / Screen",
        "timestamp",
      ],
    },
  };

  // Derive some stable query keys so we refetch when critical data changes
  const queryKey = [GET_QUERY_KEY, project, timePeriod, filterTestAccounts];

  const query = useInfiniteQuery({
    staleTime: Infinity,
    initialPageParam: 0,
    queryKey: queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      // Generate a unique query id for each request, add the pagination
      // updates, then query
      const res = await getQuery({
        ...payload,
        client_query_id: createUUID(),
        query: {
          ...payload.query,
          limit: PAGINIATION_LIMIT,
          offset: pageParam * PAGINIATION_LIMIT,
        },
      });

      return validateResponse(res);
    },
    // If we have more pages to fetch, return the next offset
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.offset + 1;
      }
    },
  });

  // Combine all of the results into one flat array
  const pages = query.data?.pages || [];
  const results = pages.flatMap((page) => page.results);

  return {
    ...query,
    data: {
      ...query.data,
      results,
    },
  };
};
