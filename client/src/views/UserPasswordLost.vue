<template>
  <section class="bg-light">
    <!-- Todo this is reused a few times. Maybe but it in a component with slots -->
    <div class="container py-5 h-100">
      <div class="row justify-content-center align-items-center h-100">
        <div class="col-12 col-lg-9 col-xl-7">
          <div class="card shadow-2-strong" style="border-radius: 15px">
            <div class="card-body p-4 p-md-5">
              <h3 class="mb-4">Passwortwiederherstellung</h3>
              <NewPasswordConfirm v-if="confirm" />
              <NewPasswordRequest v-else />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  confirm: {
    type: String,
    default: "",
  },
});
</script>
