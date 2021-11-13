<template>
    <div class="card-header"></div>
    <div class="card-body row justify-content-start align-items-center">
        <!-- TODO: Cols should wrap in own row when viewport width shrinks -->
        <div class="col-3">
            <h5 class="card-title">{{ sponsor.name }}</h5>
            <p class="card-text">{{ sponsor.tagline }}</p>
            <!-- TODO: Reevaluate if it's a good decision to use a button. Steph has mentioned that he wants to get a note when a button would leads to an external website. -->
            <a :href="sponsor.website" target="_blank" class="btn btn-primary">{{ linkMessage }}</a>
        </div>
        <div class="col-3">
            <div>{{ sponsor.contacts?.address }}</div>
            <div>{{ sponsor.contacts?.email }}</div>
            <div>{{ sponsor.contacts?.phone }}</div>
            <div>{{ sponsor.contacts?.phone2 }}</div>
        </div>
        <div class="col-3">
            <div class="square-holder">
                <a :href="sponsor.website" target="_blank">
                    <img :src="baseURL + `media/` + sponsor.logo?.id" />
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"
const baseURL = import.meta.env.VITE_API_URL;


const props = defineProps({
    sponsor: {
        type: Object,
        required: true
    },
    linkMessage: {
        type: String,
        default: "Erfahre mehr"
    }
})

</script>

<style scoped>
img {
    max-height: 100px;
}
.square-holder {
    padding: 5px;
    border: 1px solid #cecece;
    align-items: center;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    max-width: 100%;
}

.square-holder:hover {
    border-color: #08556d;
}
</style>