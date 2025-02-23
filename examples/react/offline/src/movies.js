import {
  MutationCache,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import toast from "react-hot-toast";
import * as api from "./api";
import * as React from "react";
import { useMatch } from "@tanstack/react-location";

export const movieKeys = {
  all: () => ["movies"],
  list: () => [...movieKeys.all(), "list"],
  details: () => [...movieKeys.all(), "detail"],
  detail: (id) => [...movieKeys.details(), id],
};

export const useMovie = (movieId) => {
  const queryClient = useQueryClient();

  const movieQuery = useQuery(movieKeys.detail(movieId), () =>
    api.fetchMovie(movieId)
  );

  const [comment, setComment] = React.useState();

  const updateMovie = useMutation({
    mutationKey: movieKeys.detail(movieId),
    onMutate: async () => {
      await queryClient.cancelQueries(movieKeys.detail(movieId));
      const previousData = queryClient.getQueryData(movieKeys.detail(movieId));

      // remove local state so that server state is taken instead
      setComment(undefined);

      queryClient.setQueryData(movieKeys.detail(movieId), {
        ...previousData,
        movie: {
          ...previousData.movie,
          comment,
        },
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(movieKeys.detail(movieId), context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries(movieKeys.detail(movieId));
    },
  });

  return {
    comment: comment ?? movieQuery.data?.movie.comment,
    setComment,
    updateMovie,
    movieQuery,
  };
};
