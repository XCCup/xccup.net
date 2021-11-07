import { reactive, readonly, toRefs } from "@vue/reactivity";

/**
 * Define our state
 *
 * This state is mutable in the function below,
 * but if we pass it to the component without `toRefs`
 * it will not mutate.
 */
const state = reactive({
  counter: 0,
});

export default () => {
  /**
   * Increment the counter
   *
   * @param amount Value to increment (default to `1`)
   */
  const increment = (amount = 1) => {
    state.counter += amount;
  };

  /**
   * Return the state as a `reference` to make it mutable.
   */
  return {
    state: readonly(state),
    increment,
  };
};
