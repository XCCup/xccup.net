<template>
  <div class="container">
    <CompRules />
    <hr />
    <div id="factorPanel">
      <CompFactors />
    </div>
  </div>
</template>

<script setup>
import { setWindowName } from "../helper/utils";

setWindowName("Ausschreibung");
</script>
