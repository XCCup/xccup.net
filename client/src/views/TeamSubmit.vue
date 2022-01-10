<template>
  <slot-dialog :narrow="true">
    <h3>Teammeldung</h3>
    <BaseInput label="Teamname" />
    <BaseSelect label="Teammitglied auswählen" />
    <button
      class="mb-3 btn btn-primary btn"
      type="submit"
      :disabled="true"
      @click.prevent="onSubmit"
    >
      Mitglied hinzufügen
    </button>
    <hr />
    <ul class="list-group list-unstyled">
      <li class="row">
        <p class="col-6"><i class="bi bi-trash"></i> Erster Name</p>
      </li>
      <li class="row">
        <p class="col-6"><i class="bi bi-trash"></i> Zweiter Name</p>
      </li>
      <li class="row">
        <p class="col-6"><i class="bi bi-trash"></i> Dritter Name</p>
      </li>
      <li class="row">
        <p class="col-6"><i class="bi bi-trash"></i> Vierter Name</p>
      </li>
      <li class="row">
        <p class="col-6"><i class="bi bi-trash"></i> Fünfter Name</p>
      </li>
    </ul>
    <button
      class="mt-3 btn btn-primary btn"
      type="submit"
      :disabled="true"
      @click.prevent="onSubmit"
    >
      Teammeldung absenden
    </button>
  </slot-dialog>
</template>

<script setup></script>

<style scoped></style>
