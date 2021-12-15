import { computed } from "vue";
import ApiService from "@/services/ApiService";
import useFlight from "@/composables/useFlight";

const { flight, updateComments } = useFlight();
export default () => {
  // Getters

  // Create a structured comments array with replies
  const commentsWithReplies = computed(() => {
    const repliesMap = new Map();

    const requireReplies = (id) => {
      if (!repliesMap.has(id)) {
        repliesMap.set(id, []);
      }
      return repliesMap.get(id);
    };

    return flight.value.comments.reduce((extendedComments, comment) => {
      const extendedComment = {
        ...comment,
        replies: requireReplies(comment.id),
      };
      if (comment.relatedTo) {
        requireReplies(comment.relatedTo).push(extendedComment);
      } else {
        extendedComments.push(extendedComment);
      }
      return extendedComments;
    }, []);
  });

  // Mutations

  // Actions
  const submitComment = async (comment) => {
    const res = await ApiService.addComment({
      flightId: flight.value.id,
      ...comment,
    });
    if (res.status != 200) throw res.statusText;
    updateComments();
    return res;
  };

  const deleteComment = async (id) => {
    const res = await ApiService.deleteComment(id);
    if (res.status != 200) throw res.statusText;
    await updateComments();
    return res;
  };

  const editComment = async (comment) => {
    const res = await ApiService.editComment(comment);
    if (res.status != 200) throw res.statusText;
    await updateComments();
    return res;
  };

  return { commentsWithReplies, submitComment, deleteComment, editComment };
};
