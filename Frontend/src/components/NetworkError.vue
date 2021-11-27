<template>
  <div class="container text-center my-5">
    <div class="networkError">
      <h1>Uh-Oh!</h1>

      <h3>
        Da ist was schief gelaufen :( <br />
        <a href="#" @click="$router.go(-1)">Hier klicken</a> um es noch mal zu
        probieren
      </h3>
    </div>
  </div>
</template>
