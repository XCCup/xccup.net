<template>
  <div class="bg-light dialog-bg-image" :class="heightClass">
    <div class="bg-gradient-1" :class="heightClass">
      <div class="container py-5">
        <div class="row justify-content-center align-items-center">
          <div :class="widthClass">
            <div class="card shadow-2-strong" style="border-radius: 15px">
              <div class="card-body p-3 p-md-4">
                <slot></slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  preventOverflow: {
    type: Boolean,
    default: false,
  },
  narrow: {
    type: Boolean,
    default: false,
  },
});
// TODO: Find a way to make his unnecessary
const heightClass = computed(() => (props.preventOverflow ? "" : "vh-100"));

// Width of the dialog
const wide = "col-11 col-lg-9 col-xl-7";
const narrow = "col-12 col-md-9 col-lg-7 col-xl-5";
const widthClass = computed(() => (props.narrow ? narrow : wide));
</script>
<style scoped></style>
