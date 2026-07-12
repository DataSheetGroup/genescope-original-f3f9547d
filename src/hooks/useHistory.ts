import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PredictPayload, PredictResponse } from "@/lib/api";
import {
  addHistory,
  clearHistory,
  deleteHistory,
  listHistory,
  type HistoryItem,
} from "@/lib/user-data";
import { useAuth } from "@/lib/auth-context";

export type { HistoryItem };

export function useHistory() {
  const qc = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const queryKey = ["history", user?.id ?? "signed-out"] as const;
  const enabled = !authLoading && Boolean(user);

  const query = useQuery({
    queryKey,
    queryFn: () => listHistory(),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const addM = useMutation({
    mutationFn: ({ input, result }: { input: PredictPayload; result: PredictResponse }) =>
      addHistory(input, result),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const clearM = useMutation({
    mutationFn: () => clearHistory(),
    onSuccess: () => qc.setQueryData(queryKey, []),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteHistory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const add = useCallback(
    (input: PredictPayload, result: PredictResponse) =>
      addM.mutateAsync({ input, result }),
    [addM],
  );
  const clear = useCallback(() => clearM.mutate(), [clearM]);
  const remove = useCallback((id: string) => deleteM.mutate(id), [deleteM]);

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    add,
    clear,
    remove,
  };
}
