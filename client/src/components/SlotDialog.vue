<template>
  <section class="bg-light dialog-bg-image">
    <div class="bg-gradient-1">
      <div class="container py-5 h-100">
        <div class="row justify-content-center align-items-center h-100">
          <div class="col-11 col-lg-9 col-xl-7">
            <div class="card shadow-2-strong" style="border-radius: 15px">
              <div class="card-body p-4 p-md-5">
                <slot></slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style scoped></style>
