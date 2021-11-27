import { computed } from "vue";
import ApiService from "@/services/ApiService";
import useFlight from "@/composables/useFlight";

const { flight, updateComments } = useFlight();
export default () => {
  // Getters

  // Create a structured comments array with replies
  const commentsWithReplies = computed(() => {
    let comments = flight.value.comments.flatMap((comment) =>
      !comment.relatedTo ? [comment] : []
    );

    // Add replies
    flight.value.comments.forEach((comment) => {
      if (comment.relatedTo) {
        let parent = comments.findIndex(
          (element) => element.id === comment.relatedTo
        );
        if (!comments[parent]?.replies) comments[parent].replies = [];
        comments[parent].replies.push(comment);
      }
    });
    return comments;
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
