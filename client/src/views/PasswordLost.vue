<template>
  <section class="bg-light">
    <div class="container py-5 h-100">
      <div class="row justify-content-center align-items-center h-100">
        <div class="col-12 col-lg-9 col-xl-7">
          <div class="card shadow-2-strong" style="border-radius: 15px">
            <div class="card-body p-4 p-md-5">
              <h3 class="mb-4 pb-2">Passwortwiederherstellung</h3>
              <div v-if="confirm">
                <NewPasswordConfirm />
              </div>
              <div v-else>
                <NewPasswordRequest />
              </div>
              <div>
                Falls Du keine Mail erhältst wende Dich bitte an einen
                <router-link :to="{ name: 'Imprint' }"
                  >Administrator</router-link
                >
              </div>
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
