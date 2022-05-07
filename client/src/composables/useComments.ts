import { computed } from "vue";
import ApiService from "@/services/ApiService";
import useFlight from "@/composables/useFlight";
import type { Comment } from "@/types/Comment";

interface ExtendedComment extends Comment {
  replies?: Comment[];
}

const { flight, updateComments } = useFlight();
export default () => {
  // Getters

  // Create a structured comments array with replies
  const commentsWithReplies = computed(() => {
    const comments = flight.value?.comments;
    const repliesMap = new Map<string, ExtendedComment[]>();

    const requireReplies = (id: string) => {
      if (!repliesMap.has(id)) {
        repliesMap.set(id, []);
      }
      return repliesMap.get(id);
    };

    return comments?.reduce((prev: ExtendedComment[], cur) => {
      const extendedComment: ExtendedComment = {
        ...cur,
        replies: requireReplies(cur.id),
      };

      if (cur.relatedTo) {
        requireReplies(cur.relatedTo)?.push(extendedComment);
      } else {
        prev.push(extendedComment);
      }
      return prev;
    }, []);
  });

  // Mutations

  // Actions
  const submitComment = async (
    message: string,
    userId: string,
    relatedTo?: string
  ) => {
    if (!flight.value) return;
    const res = await ApiService.addComment({
      flightId: flight.value.id,
      message,
      userId,
      relatedTo,
    });
    if (res.status != 200) throw res.statusText;
    updateComments();
    return res;
  };

  const deleteComment = async (id: string) => {
    const res = await ApiService.deleteComment(id);
    if (res.status != 200) throw res.statusText;
    await updateComments();
    return res;
  };

  const editComment = async (comment: Comment) => {
    const res = await ApiService.editComment(comment);
    if (res.status != 200) throw res.statusText;
    await updateComments();
    return res;
  };

  return { commentsWithReplies, submitComment, deleteComment, editComment };
};
