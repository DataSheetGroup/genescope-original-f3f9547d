import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPreferences, putPreferences } from "@/lib/user-data";
import { useAuth } from "@/lib/auth-context";

const KEY = ["preferences"] as const;

export function usePreferences<T extends Record<string, unknown> = Record<string, unknown>>() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => getPreferences() as Promise<T>,
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (patch: Partial<T>) => putPreferences(patch) as Promise<T>,
    onSuccess: (data) => qc.setQueryData(KEY, data),
  });

  const set = useCallback(
    (patch: Partial<T>) => mutation.mutate(patch),
    [mutation],
  );

  return { prefs: (query.data ?? ({} as T)) as T, isLoading: query.isLoading, set };
}
