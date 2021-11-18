<template>
  <div class="card mb-2">
    <div class="card-header"></div>
    <div class="card-body row">
      <div class="col-xl-7 col-md-8 col-sm-6 col-12 mb-2">
        <h5 class="mt-0">{{ sponsor.name }}</h5>
        <p>{{ sponsor.tagline }}</p>
        <a :href="sponsor.website" target="_blank" class="btn btn-primary"
          >Zur Webseite</a
        >
      </div>
      <div class="col-xl-5 col-md-4 col-sm-6 col-12 text-end">
        <a :href="sponsor.website" target="_blank" class="square-holder">
          <img :src="baseURL + `media/` + sponsor.logo?.id" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
const baseURL = import.meta.env.VITE_API_URL;

defineProps({
  sponsor: {
    type: Object,
    required: true,
  },
  linkMessage: {
    type: String,
    default: "Erfahre mehr",
  },
});
</script>

<style scoped>
img {
  max-height: 8em;
  max-width: 10em;
}
.square-holder {
  padding: 5px;
  border: 1px solid #cecece;
  align-items: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 10em;
}

.square-holder:hover {
  border-color: #08556d;
}
</style>
